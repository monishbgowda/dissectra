/**
 * Calibration Data Collection Script
 *
 * Reads a dataset manifest of labelled device images, executes the REAL Gemini
 * closed-set classifier on each sample, extracts pre-softmax classLogScores,
 * and saves the uncorrupted evaluation records for temperature scaling.
 *
 * Usage:
 *   node scripts/collectDeviceCalibration.js [--manifest <path>] [--output <path>]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { classifyDevice, CLASSIFIER_CONFIG_VERSION } = require('../services/deviceClassificationService');

const DEFAULT_MANIFEST_PATH = path.join(__dirname, '../calibration/device-classifier/samples.json');
const DEFAULT_OUTPUT_PATH = path.join(__dirname, '../calibration/device-classifier/results.json');

const VALID_LABELS = new Set(['mouse', 'pendrive', 'other']);
const VALID_SPLITS = new Set(['calibration', 'evaluation']);

function parseArgs() {
  const args = process.argv.slice(2);
  let manifestPath = DEFAULT_MANIFEST_PATH;
  let outputPath = DEFAULT_OUTPUT_PATH;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--manifest' && args[i + 1]) {
      manifestPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = path.resolve(args[i + 1]);
      i++;
    }
  }

  return { manifestPath, outputPath };
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Invalid manifest: Must be a valid JSON object.');
  }

  if (!Array.isArray(manifest.samples) || manifest.samples.length === 0) {
    throw new Error('Invalid manifest: "samples" array is missing or empty.');
  }

  const errors = [];

  manifest.samples.forEach((sample, idx) => {
    const id = sample.id || `sample_${idx + 1}`;

    if (!VALID_LABELS.has(sample.label)) {
      errors.push(`[${id}] Invalid label "${sample.label}". Must be one of: ${Array.from(VALID_LABELS).join(', ')}`);
    }

    if (!VALID_SPLITS.has(sample.split)) {
      errors.push(`[${id}] Invalid split "${sample.split}". Must be one of: ${Array.from(VALID_SPLITS).join(', ')}`);
    }

    if (!Array.isArray(sample.images) || sample.images.length === 0) {
      errors.push(`[${id}] Missing images array or empty.`);
    } else {
      sample.images.forEach(imgPath => {
        if (!fs.existsSync(imgPath)) {
          errors.push(`[${id}] Image file not found on disk: "${imgPath}"`);
        }
      });
    }
  });

  return errors;
}

async function runCollection() {
  const { manifestPath, outputPath } = parseArgs();

  console.log('\n======================================================');
  console.log('DISSECTRA DEVICE CALIBRATION DATA COLLECTION');
  console.log('======================================================\n');
  console.log(`Manifest Path: ${manifestPath}`);
  console.log(`Output Path:   ${outputPath}`);

  if (!fs.existsSync(manifestPath)) {
    console.error(`\n[ERROR] Manifest file not found: ${manifestPath}`);
    console.error('Please create samples.json using samples.example.json as a reference.\n');
    process.exit(1);
  }

  let rawManifest;
  try {
    rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    console.error(`\n[ERROR] Failed to parse JSON manifest: ${err.message}`);
    process.exit(1);
  }

  const validationErrors = validateManifest(rawManifest);
  if (validationErrors.length > 0) {
    console.error(`\n[ERROR] Manifest validation failed with ${validationErrors.length} error(s):`);
    validationErrors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  const samples = rawManifest.samples;
  console.log(`\nValidated ${samples.length} sample(s). Starting collection calls...\n`);

  const results = {
    collectedAt: new Date().toISOString(),
    classifierConfigVersion: CLASSIFIER_CONFIG_VERSION,
    totalCount: samples.length,
    samples: [],
  };

  const summary = {
    total: samples.length,
    successful: 0,
    failed: 0,
    failureReasons: {},
    classCounts: { mouse: 0, pendrive: 0, other: 0 },
    splitCounts: { calibration: 0, evaluation: 0 },
  };

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const sampleId = sample.id || `sample_${i + 1}`;
    console.log(`[${i + 1}/${samples.length}] Processing "${sampleId}" (true: ${sample.label}, split: ${sample.split})...`);

    summary.classCounts[sample.label] = (summary.classCounts[sample.label] || 0) + 1;
    summary.splitCounts[sample.split] = (summary.splitCounts[sample.split] || 0) + 1;

    const imageFiles = sample.images.map(p => ({
      path: p,
      mimeType: getMimeType(p),
    }));

    try {
      const response = await classifyDevice(imageFiles);

      if (response.confidenceAvailable && response.classLogScores) {
        summary.successful++;
        console.log(`    ✓ SUCCESS -> predicted: ${response.predictedClass} (raw prob: ${response.rawClassProbability.toFixed(4)})`);

        results.samples.push({
          id: sampleId,
          trueLabel: sample.label,
          split: sample.split,
          success: true,
          classifierModel: response.classifierModel,
          classLogScores: response.classLogScores,
          predictedClass: response.predictedClass,
          rawClassProbability: response.rawClassProbability,
          normalizedEntropy: response.normalizedEntropy,
        });
      } else {
        summary.failed++;
        const reason = response.reason || 'CONFIDENCE_UNAVAILABLE';
        summary.failureReasons[reason] = (summary.failureReasons[reason] || 0) + 1;
        console.warn(`    ✗ FAILED -> reason: ${reason}`);

        results.samples.push({
          id: sampleId,
          trueLabel: sample.label,
          split: sample.split,
          success: false,
          reason,
        });
      }
    } catch (err) {
      summary.failed++;
      const reason = `API_EXCEPTION: ${err.message || 'Unknown error'}`;
      summary.failureReasons[reason] = (summary.failureReasons[reason] || 0) + 1;
      console.error(`    ✗ EXCEPTION -> ${reason}`);

      results.samples.push({
        id: sampleId,
        trueLabel: sample.label,
        split: sample.split,
        success: false,
        reason,
      });
    }

    // Gentle pacing to respect rate limits
    if (i < samples.length - 1) {
      await new Promise(res => setTimeout(res, 500));
    }
  }

  // Ensure target output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n======================================================');
  console.log('COLLECTION SUMMARY');
  console.log('======================================================');
  console.log(`Total Samples:      ${summary.total}`);
  console.log(`Successful Samples: ${summary.successful}`);
  console.log(`Failed Samples:     ${summary.failed}`);
  console.log('\nSplit Breakdown:');
  console.log(`  Calibration:      ${summary.splitCounts.calibration}`);
  console.log(`  Evaluation:       ${summary.splitCounts.evaluation}`);
  console.log('\nClass Breakdown:');
  console.log(`  Mouse:            ${summary.classCounts.mouse}`);
  console.log(`  Pen Drive:        ${summary.classCounts.pendrive}`);
  console.log(`  Other:            ${summary.classCounts.other}`);

  if (summary.failed > 0) {
    console.log('\nFailure Reasons:');
    for (const [r, cnt] of Object.entries(summary.failureReasons)) {
      console.log(`  - ${r}: ${cnt}`);
    }
  }

  console.log(`\nResults written to: ${outputPath}\n`);
}

if (require.main === module) {
  runCollection().catch(err => {
    console.error('Fatal error during collection:', err);
    process.exit(1);
  });
}

module.exports = {
  validateManifest,
  runCollection,
};
