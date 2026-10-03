/**
 * Temperature Scaling Fit & Evaluation Script
 *
 * Loads collected pre-softmax classification results, fits optimal scalar Temperature T
 * by minimizing Multiclass Negative Log-Likelihood (NLL) on the calibration split,
 * and independently evaluates calibration improvements on the held-out evaluation split.
 *
 * Saves verified calibration artifact to backend/calibration/device-classifier/calibration.json
 * ONLY when real calibration data has been successfully processed.
 *
 * Usage:
 *   node scripts/fitDeviceTemperature.js [--results <path>] [--output <path>]
 */

const fs = require('fs');
const path = require('path');
const {
  fitTemperature,
  computeDatasetMetrics,
} = require('../utils/temperatureCalibration');

const DEFAULT_RESULTS_PATH = path.join(__dirname, '../calibration/device-classifier/results.json');
const DEFAULT_CALIBRATION_OUTPUT = path.join(__dirname, '../calibration/device-classifier/calibration.json');

function parseArgs() {
  const args = process.argv.slice(2);
  let resultsPath = DEFAULT_RESULTS_PATH;
  let outputPath = DEFAULT_CALIBRATION_OUTPUT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--results' && args[i + 1]) {
      resultsPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = path.resolve(args[i + 1]);
      i++;
    }
  }

  return { resultsPath, outputPath };
}

function printMetricsTable(title, rawMetrics, calMetrics) {
  console.log(`\n--- ${title} ---`);
  console.log(`Sample Count:           ${rawMetrics.sampleCount}`);
  console.log(`Metric                  Raw (T=1.0)       Calibrated (T=${calMetrics.temperature})`);
  console.log(`-------------------------------------------------------------`);
  console.log(`Accuracy:               ${(rawMetrics.accuracy * 100).toFixed(2)}%             ${(calMetrics.accuracy * 100).toFixed(2)}%`);
  console.log(`Multiclass NLL:         ${rawMetrics.nll.toFixed(5)}           ${calMetrics.nll.toFixed(5)}`);
  console.log(`Multiclass Brier Score: ${rawMetrics.brierScore.toFixed(5)}           ${calMetrics.brierScore.toFixed(5)}`);
  console.log(`ECE (5 bins):           ${(rawMetrics.ece * 100).toFixed(2)}%             ${(calMetrics.ece * 100).toFixed(2)}%`);
}

function printReliabilityBins(title, bins) {
  console.log(`\n--- Reliability Diagram Bins (${title}) ---`);
  console.log(`Bin Range        Count    Mean Conf    Accuracy    Gap (|Acc - Conf|)`);
  console.log(`-------------------------------------------------------------------`);
  bins.forEach(b => {
    const gap = Math.abs(b.accuracy - b.meanConfidence);
    console.log(
      `[${b.lowerBound.toFixed(2)} - ${b.upperBound.toFixed(2)}]     ${String(b.count).padEnd(8)} ${(b.meanConfidence * 100).toFixed(2)}%       ${(b.accuracy * 100).toFixed(2)}%       ${(gap * 100).toFixed(2)}%`,
    );
  });
}

function runFitting() {
  const { resultsPath, outputPath } = parseArgs();

  console.log('\n======================================================');
  console.log('DISSECTRA TEMPERATURE SCALING OPTIMIZER');
  console.log('======================================================\n');
  console.log(`Results File: ${resultsPath}`);
  console.log(`Output File:  ${outputPath}`);

  if (!fs.existsSync(resultsPath)) {
    console.error(`\n[ERROR] Results file not found: ${resultsPath}`);
    console.error('Please run collection first: node scripts/collectDeviceCalibration.js\n');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  } catch (err) {
    console.error(`\n[ERROR] Failed to parse results JSON: ${err.message}`);
    process.exit(1);
  }

  const allSamples = Array.isArray(data.samples) ? data.samples : [];
  const validSamples = allSamples.filter(s => s.success && s.classLogScores);

  const calibrationSamples = validSamples.filter(s => s.split === 'calibration');
  const evaluationSamples = validSamples.filter(s => s.split === 'evaluation');

  console.log(`\nTotal Records Loaded:        ${allSamples.length}`);
  console.log(`Successful Records:          ${validSamples.length}`);
  console.log(`Calibration Split Samples:   ${calibrationSamples.length}`);
  console.log(`Evaluation Split Samples:    ${evaluationSamples.length}`);

  if (calibrationSamples.length === 0) {
    console.error('\n[ERROR] No successful calibration samples found.');
    console.error('Temperature cannot be fitted. Calibration artifact WILL NOT be created.\n');
    process.exit(1);
  }

  // Model consistency check
  const distinctModels = new Set(validSamples.map(s => s.classifierModel).filter(Boolean));
  if (distinctModels.size > 1) {
    console.warn(`\n[WARNING] Multiple classifier models detected in dataset: ${Array.from(distinctModels).join(', ')}`);
    console.warn('Temperature scaling requires one consistent model identifier.');
  }
  const classifierModel = distinctModels.values().next().value || 'MobileNetV2';
  const classifierConfigVersion = data.classifierConfigVersion || 'device-abc-v1';

  // Step 1: Baseline metrics on calibration split
  const rawCalMetrics = computeDatasetMetrics(calibrationSamples, 1.0);

  // Step 2: Fit scalar T on calibration split
  console.log('\nOptimizing temperature T via golden-section search on Multiclass NLL...');
  const fitResult = fitTemperature(calibrationSamples);
  const fittedT = fitResult.temperature;
  console.log(`✓ Fitted optimal Temperature: T = ${fittedT} (NLL: ${fitResult.initialNLL} -> ${fitResult.optimizedNLL}, iterations: ${fitResult.iterations})`);

  // Step 3: Calibrated metrics on calibration split
  const calibratedCalMetrics = computeDatasetMetrics(calibrationSamples, fittedT);
  printMetricsTable('CALIBRATION SET METRICS', rawCalMetrics, calibratedCalMetrics);

  // Step 4: Held-out evaluation split metrics
  let rawEvalMetrics = null;
  let calibratedEvalMetrics = null;

  if (evaluationSamples.length > 0) {
    rawEvalMetrics = computeDatasetMetrics(evaluationSamples, 1.0);
    calibratedEvalMetrics = computeDatasetMetrics(evaluationSamples, fittedT);
    printMetricsTable('HELD-OUT EVALUATION SET METRICS', rawEvalMetrics, calibratedEvalMetrics);
    printReliabilityBins('Evaluation Split - Calibrated', calibratedEvalMetrics.reliabilityBins);
  } else {
    console.log('\n[INFO] No held-out evaluation samples provided in dataset.');
  }

  // Step 5: Save calibration artifact
  const calibrationArtifact = {
    method: 'temperature_scaling',
    temperature: fittedT,
    classifierModel,
    classifierConfigVersion,
    classes: ['mouse', 'pendrive', 'other'],
    artifactReference: 'device_classifier.pth',
    preprocessing: {
      imageFormat: 'RGB',
      inputSize: [224, 224],
      normalization: {
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225],
      },
      alphaCompositing: 'solid_white_background',
    },
    calibrationSampleCount: calibrationSamples.length,
    evaluationSampleCount: evaluationSamples.length,
    createdAt: new Date().toISOString(),
    metrics: {
      calibration: {
        raw: {
          accuracy: rawCalMetrics.accuracy,
          nll: rawCalMetrics.nll,
          brierScore: rawCalMetrics.brierScore,
          ece: rawCalMetrics.ece,
        },
        calibrated: {
          accuracy: calibratedCalMetrics.accuracy,
          nll: calibratedCalMetrics.nll,
          brierScore: calibratedCalMetrics.brierScore,
          ece: calibratedCalMetrics.ece,
        },
      },
      evaluation: evaluationSamples.length > 0 ? {
        raw: {
          accuracy: rawEvalMetrics.accuracy,
          nll: rawEvalMetrics.nll,
          brierScore: rawEvalMetrics.brierScore,
          ece: rawEvalMetrics.ece,
        },
        calibrated: {
          accuracy: calibratedEvalMetrics.accuracy,
          nll: calibratedEvalMetrics.nll,
          brierScore: calibratedEvalMetrics.brierScore,
          ece: calibratedEvalMetrics.ece,
        },
      } : null,
    },
    reliabilityBins: evaluationSamples.length > 0 ? calibratedEvalMetrics.reliabilityBins : calibratedCalMetrics.reliabilityBins,
  };

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(calibrationArtifact, null, 2), 'utf8');
  console.log(`\n✓ Calibration artifact successfully written to: ${outputPath}\n`);
}

if (require.main === module) {
  runFitting();
}

module.exports = {
  runFitting,
};
