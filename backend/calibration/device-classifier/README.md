# Dissectra Device Classifier — Temperature Scaling Calibration

This directory contains the dataset specification, tooling, and calibration artifacts for post-hoc **Temperature Scaling** of the Dissectra closed-set device classifier (Mouse vs USB Flash Drive vs Other).

---

## 1. Why Temperature Scaling is Needed

Modern deep vision-language models like Gemini produce accurate argmax classifications, but their raw softmax probabilities are often **overconfident** or miscalibrated compared to empirical true likelihoods.

Temperature Scaling applies a learned scalar parameter $T > 0$ to pre-softmax log scores:

$$p_i(T) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

- **$T = 1.0$**: Uncalibrated raw softmax.
- **$T > 1.0$**: Softens overconfident predictions.
- **$0 < T < 1.0$**: Sharpens underconfident predictions.
- **Argmax preservation**: Dividing all logits by a constant positive scalar $T$ preserves class ranking, keeping accuracy identical while aligning confidence with empirical reality.

---

## 2. Dataset Collection Requirements

For this university prototype, collect **at least 45 labelled physical device samples**:

### Recommended Class Distribution

| Split | Mouse (A) | Pen Drive (B) | Other (C) | Subtotal |
| :--- | :---: | :---: | :---: | :---: |
| **Calibration** (`split: "calibration"`) | 10 | 10 | 10 | **30** |
| **Evaluation** (`split: "evaluation"`) | 5 | 5 | 5 | **15** |
| **Total** | **15** | **15** | **15** | **45** |

### Guidelines for Capturing Images

1. **Images per Sample**: 1 to 3 photos of the same physical item from different angles (e.g. top, side, 45-degree angle).
2. **Diversity**:
   - Vary **lighting** (natural daylight, indoor LED, warm lighting).
   - Vary **backgrounds** (wooden table, plain white sheet, office desk, mousepad).
   - Vary **distance and angle** (close-up, overhead, side profile).
   - Vary **device colors and form factors** (gaming mouse, ergonomic office mouse, slim metal pen drive, swivel flash drive, rubber cap flash drive).
3. **Diverse Negatives for Class C ("Other")**:
   Do **NOT** use only one object for "other". Include a wide spectrum of negative electronic items and distractors:
   - Keyboard
   - Smartphone
   - USB cable / lightning cable
   - Wall charger / power adapter
   - Power bank
   - Calculator
   - Earphones / headphones
   - TV / AC remote control
   - Laptop
   - USB hub
   - SD / MicroSD memory card
   - Non-electronic objects (e.g. water bottle, mug, pen)
4. **Split Separation**:
   Do **NOT** place photos of the exact same physical device in both the calibration and evaluation splits. They must be disjoint physical objects to evaluate true out-of-sample generalization.

---

## 3. How to Run Calibration

### Step 1: Prepare your manifest file

Copy `samples.example.json` to `samples.json` (or any custom path):

```json
{
  "version": "1.0.0",
  "classifierConfigVersion": "device-abc-v1",
  "samples": [
    {
      "id": "mouse_001",
      "label": "mouse",
      "split": "calibration",
      "images": [
        "C:/my_dataset/mouse_01_top.jpg",
        "C:/my_dataset/mouse_01_side.jpg"
      ]
    },
    {
      "id": "other_001",
      "label": "other",
      "split": "calibration",
      "images": [
        "C:/my_dataset/keyboard.jpg"
      ]
    }
  ]
}
```

Allowed labels: `"mouse"`, `"pendrive"`, `"other"`.  
Allowed splits: `"calibration"`, `"evaluation"`.

### Step 2: Collect Gemini classification log scores

Ensure your `GEMINI_API_KEY` and fixed model `GEMINI_CLASSIFIER_MODEL` are set in `backend/.env`.

Run the collection script:

```bash
cd backend
node scripts/collectDeviceCalibration.js --manifest calibration/device-classifier/samples.json
```

This sends each sample to the real Gemini classifier, extracts pre-softmax `classLogScores`, and writes raw responses into:
`backend/calibration/device-classifier/results.json`

### Step 3: Fit Temperature $T$ and evaluate

Run the temperature fitting script:

```bash
cd backend
node scripts/fitDeviceTemperature.js --results calibration/device-classifier/results.json
```

This script:
1. Filters successful calibration samples (`split: "calibration"`).
2. Optimizes scalar $T$ using deterministic 1D golden-section search to minimize **Multiclass Negative Log-Likelihood (NLL)**.
3. Computes raw ($T=1$) and calibrated metrics (Accuracy, NLL, Brier Score, ECE with 5 bins).
4. Evaluates the fitted $T$ on the held-out **evaluation split** (`split: "evaluation"`).
5. Generates the reliability diagram bin data.
6. Saves the validated calibration artifact into:
   `backend/calibration/device-classifier/calibration.json`

---

## 4. Calibration Artifact Schema

When generated from real data, `calibration.json` contains:

```json
{
  "method": "temperature_scaling",
  "temperature": 1.421,
  "classifierModel": "gemini-1.5-flash",
  "classifierConfigVersion": "device-abc-v1",
  "classes": ["mouse", "pendrive", "other"],
  "generationConfig": {
    "temperature": 1.0,
    "responseLogprobs": true,
    "logprobs": 20,
    "maxOutputTokens": 32
  },
  "calibrationSampleCount": 30,
  "evaluationSampleCount": 15,
  "createdAt": "2026-10-03T...",
  "metrics": {
    "calibration": {
      "raw": { "accuracy": 0.9667, "nll": 0.2810, "brierScore": 0.0542, "ece": 0.0821 },
      "calibrated": { "accuracy": 0.9667, "nll": 0.1852, "brierScore": 0.0381, "ece": 0.0215 }
    },
    "evaluation": {
      "raw": { "accuracy": 0.9333, "nll": 0.3120, "brierScore": 0.0610, "ece": 0.0910 },
      "calibrated": { "accuracy": 0.9333, "nll": 0.2104, "brierScore": 0.0432, "ece": 0.0310 }
    }
  },
  "reliabilityBins": [ ... ]
}
```

---

## 5. Safety & Configuration Matching

The backend runtime **strictly verifies** that any active `calibration.json` matches the current running model and prompt configuration:
- Exact model identifier (`classifierModel`)
- Configuration version (`classifierConfigVersion`)
- Class list (`classes`)
- Generation parameters (`temperature`, `responseLogprobs`, `logprobs`)

If any field does not match, the runtime disables calibration (`calibrated: false`), reports `calibrationReason: "CALIBRATION_CONFIG_MISMATCH"`, and safely falls back to uncalibrated raw log-probability scores.
