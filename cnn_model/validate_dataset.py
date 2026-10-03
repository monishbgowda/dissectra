#!/usr/bin/env python3
"""
Dissectra Prototype Dataset Validator

Scans cnn_model/dataset/ directory for training, calibration, and evaluation splits across:
  - mouse
  - pendrive
  - other

Validates target prototype counts (30 real images total):
  - Training: 6 mouse, 6 pendrive, 6 other (18 total)
  - Calibration: 2 mouse, 2 pendrive, 2 other (6 total)
  - Evaluation: 2 mouse, 2 pendrive, 2 other (6 total)
"""

import os
import sys

# Force UTF-8 stdout encoding for Windows console compatibility
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
CLASSES = ['mouse', 'pendrive', 'other']
SPLITS = ['training', 'calibration', 'evaluation']

EXPECTED_COUNTS = {
    'training': {'mouse': 6, 'pendrive': 6, 'other': 6, 'total': 18},
    'calibration': {'mouse': 2, 'pendrive': 2, 'other': 2, 'total': 6},
    'evaluation': {'mouse': 2, 'pendrive': 2, 'other': 2, 'total': 6},
    'grand_total': 30
}

def validate_dataset(dataset_dir=None):
    if dataset_dir is None:
        dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')

    print("\n======================================================")
    print("DISSECTRA DATASET VALIDATOR")
    print("======================================================\n")
    print(f"Dataset Root Directory: {dataset_dir}")

    if not os.path.exists(dataset_dir):
        print(f"\n[ERROR] Dataset directory does not exist: {dataset_dir}")
        return False

    summary = {
        'total_images': 0,
        'missing_folders': [],
        'unsupported_files': [],
        'counts': {}
    }

    for split in SPLITS:
        summary['counts'][split] = {}
        split_dir = os.path.join(dataset_dir, split)

        if not os.path.exists(split_dir):
            summary['missing_folders'].append(f"dataset/{split}")
            continue

        print(f"\n--- {split.upper()} SPLIT ---")
        split_total = 0

        for cls in CLASSES:
            cls_dir = os.path.join(split_dir, cls)
            if not os.path.exists(cls_dir):
                summary['missing_folders'].append(f"dataset/{split}/{cls}")
                summary['counts'][split][cls] = 0
                print(f"  [{cls.ljust(8)}] MISSING FOLDER (0 / expected {EXPECTED_COUNTS[split][cls]})")
                continue

            valid_images = 0
            for entry in os.listdir(cls_dir):
                full_path = os.path.join(cls_dir, entry)
                if os.path.isfile(full_path):
                    ext = os.path.splitext(entry)[1].lower()
                    if ext in ALLOWED_EXTENSIONS:
                        valid_images += 1
                    elif entry != '.gitkeep':
                        summary['unsupported_files'].append(f"{split}/{cls}/{entry}")

            summary['counts'][split][cls] = valid_images
            split_total += valid_images
            summary['total_images'] += valid_images

            expected = EXPECTED_COUNTS[split][cls]
            status = "[OK]" if valid_images >= expected else f"[NEED {expected - valid_images} MORE]"
            print(f"  [{cls.ljust(8)}] {valid_images} / expected {expected}  {status}")

        print(f"Subtotal:   {split_total} / expected {EXPECTED_COUNTS[split]['total']}")

    print("\n======================================================")
    print("DATASET VALIDATION SUMMARY")
    print("======================================================")
    print(f"Total Real Images Found: {summary['total_images']} / expected {EXPECTED_COUNTS['grand_total']}")

    if summary['missing_folders']:
        print("\nMissing Folders:")
        for mf in summary['missing_folders']:
            print(f"  - {mf}")

    if summary['unsupported_files']:
        print("\nUnsupported File Format Warnings:")
        for uf in summary['unsupported_files']:
            print(f"  - {uf}")

    exact_target_met = (
        summary['counts'].get('training', {}).get('mouse', 0) >= 6 and
        summary['counts'].get('training', {}).get('pendrive', 0) >= 6 and
        summary['counts'].get('training', {}).get('other', 0) >= 6 and
        summary['counts'].get('calibration', {}).get('mouse', 0) >= 2 and
        summary['counts'].get('calibration', {}).get('pendrive', 0) >= 2 and
        summary['counts'].get('calibration', {}).get('other', 0) >= 2 and
        summary['counts'].get('evaluation', {}).get('mouse', 0) >= 2 and
        summary['counts'].get('evaluation', {}).get('pendrive', 0) >= 2 and
        summary['counts'].get('evaluation', {}).get('other', 0) >= 2
    )

    if exact_target_met:
        print("\n[SUCCESS] DATASET COMPLETE: Minimum prototype dataset (30 images) is ready for training.\n")
    else:
        print("\n[PENDING] DATASET INCOMPLETE: Please add the required images to dataset folders before training.\n")

    return exact_target_met

if __name__ == '__main__':
    dataset_path = sys.argv[1] if len(sys.argv) > 1 else None
    validate_dataset(dataset_path)
