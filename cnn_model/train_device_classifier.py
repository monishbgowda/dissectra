#!/usr/bin/env python3
"""
Lightweight Transfer Learning Trainer for Dissectra 3-Class Device Classifier

Fine-tunes the classifier head of a MobileNetV2 model on cnn_model/dataset/training/
Exclusively uses dataset/training/ split. NEVER trains on calibration or evaluation splits.

Usage:
  python cnn_model/train_device_classifier.py [--epochs 15] [--batch-size 4] [--lr 0.001]
"""

import os
import sys
import argparse
import json
import random
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from PIL import Image

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from product_classifier import (
    DeviceClassifier,
    CLASS_TO_INDEX,
    CLASSES,
    load_image,
    get_training_transform,
    get_inference_transform,
)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}


def set_seed(seed=42):
    """Set random seed for reproducibility."""
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


class DirectoryDataset(Dataset):
    """PyTorch Dataset that loads images from class folders (mouse, pendrive, other)."""

    def __init__(self, root_dir, transform=None):
        self.image_paths = []
        self.labels = []
        self.transform = transform or get_inference_transform()
        self.class_counts = {cls: 0 for cls in CLASSES}

        for cls_name, cls_idx in CLASS_TO_INDEX.items():
            cls_dir = os.path.join(root_dir, cls_name)
            if not os.path.exists(cls_dir):
                continue

            for file_name in sorted(os.listdir(cls_dir)):
                ext = os.path.splitext(file_name)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    full_path = os.path.join(cls_dir, file_name)
                    self.image_paths.append(full_path)
                    self.labels.append(cls_idx)
                    self.class_counts[cls_name] += 1

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        path = self.image_paths[idx]
        label = self.labels[idx]
        image = load_image(path)
        tensor = self.transform(image)
        return tensor, label


def parse_args():
    parser = argparse.ArgumentParser(description="Train Dissectra 3-Class MobileNetV2 Classifier")
    parser.add_argument('--dataset-dir', type=str, default=None, help="Root dataset folder")
    parser.add_argument('--artifacts-dir', type=str, default=None, help="Output folder for weights")
    parser.add_argument('--stage-a-epochs', type=int, default=15, help="Stage A head epochs")
    parser.add_argument('--stage-b-epochs', type=int, default=15, help="Stage B fine-tuning epochs")
    parser.add_argument('--batch-size', type=int, default=4, help="Batch size")
    parser.add_argument('--stage-a-lr', type=float, default=1e-3, help="Stage A learning rate")
    parser.add_argument('--stage-b-backbone-lr', type=float, default=1e-5, help="Stage B backbone learning rate")
    parser.add_argument('--stage-b-head-lr', type=float, default=1e-4, help="Stage B head learning rate")
    parser.add_argument('--seed', type=int, default=42, help="Random seed")
    return parser.parse_parse_args() if hasattr(parser, 'parse_parse_args') else parser.parse_args()


def train():
    args = parse_args()
    set_seed(args.seed)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = args.dataset_dir or os.path.join(base_dir, 'dataset')
    artifacts_dir = args.artifacts_dir or os.path.join(base_dir, 'artifacts')
    training_dir = os.path.join(dataset_dir, 'training')

    print("\n======================================================")
    print("DISSECTRA 3-CLASS CLASSIFIER TWO-STAGE TRAINING")
    print("======================================================\n")
    print(f"Training Folder:  {training_dir}")
    print(f"Artifacts Output: {artifacts_dir}")
    print(f"Stage A: Epochs={args.stage_a_epochs}, Head LR={args.stage_a_lr}")
    print(f"Stage B: Epochs={args.stage_b_epochs}, Backbone LR={args.stage_b_backbone_lr}, Head LR={args.stage_b_head_lr}\n")

    if not os.path.exists(training_dir):
        print(f"[ERROR] Training directory not found: {training_dir}")
        sys.exit(1)

    train_dataset = DirectoryDataset(training_dir, transform=get_training_transform())

    print("Training Dataset Image Counts:")
    for cls_name, count in train_dataset.class_counts.items():
        print(f"  - {cls_name}: {count}")
    print(f"Total Real Training Images: {len(train_dataset)}\n")

    if len(train_dataset) == 0:
        print("[WARNING] No real training images found in dataset/training/.")
        print("Training CANNOT proceed. Model weights file WILL NOT be created.")
        return

    dataloader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using compute device: {device}\n")

    # Start from clean pretrained MobileNetV2 state
    model = DeviceClassifier(num_classes=3, freeze_backbone=True).to(device)
    criterion = nn.CrossEntropyLoss()

    # ----------------------------------------------------
    # STAGE A: Classifier Head Training (Backbone Frozen)
    # ----------------------------------------------------
    print("--- STAGE A: Training Classifier Head (Backbone Frozen) ---")
    optimizer_a = optim.Adam(
        [p for p in model.classifier.parameters() if p.requires_grad],
        lr=args.stage_a_lr,
        weight_decay=1e-4
    )

    model.train()
    start_time = time.time()
    stage_a_loss = 0.0
    stage_a_acc = 0.0

    for epoch in range(1, args.stage_a_epochs + 1):
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer_a.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer_a.step()

            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += inputs.size(0)

        stage_a_loss = running_loss / total
        stage_a_acc = correct / total
        print(f"Stage A Epoch [{epoch:02d}/{args.stage_a_epochs:02d}] - Loss: {stage_a_loss:.4f} - Acc: {stage_a_acc * 100:.2f}%")

    print(f"Stage A Final Result -> Loss: {stage_a_loss:.4f}, Accuracy: {stage_a_acc * 100:.2f}%\n")

    # ----------------------------------------------------
    # STAGE B: Partial Fine-Tuning (Unfreeze Features 14-18)
    # ----------------------------------------------------
    print("--- STAGE B: Partial Fine-Tuning (Unfreezing Backbone Blocks 14-18) ---")
    model.unfreeze_upper_backbone(unfreeze_from_block=14)

    backbone_params = [p for i, block in enumerate(model.backbone.features) if i >= 14 for p in block.parameters() if p.requires_grad]
    head_params = [p for p in model.classifier.parameters() if p.requires_grad]

    optimizer_b = optim.Adam([
        {'params': backbone_params, 'lr': args.stage_b_backbone_lr},
        {'params': head_params, 'lr': args.stage_b_head_lr}
    ], weight_decay=1e-3)

    stage_b_loss = 0.0
    stage_b_acc = 0.0

    for epoch in range(1, args.stage_b_epochs + 1):
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer_b.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer_b.step()

            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += inputs.size(0)

        stage_b_loss = running_loss / total
        stage_b_acc = correct / total
        print(f"Stage B Epoch [{epoch:02d}/{args.stage_b_epochs:02d}] - Loss: {stage_b_loss:.4f} - Acc: {stage_b_acc * 100:.2f}%")

    elapsed = time.time() - start_time
    print(f"\nTwo-Stage Training completed in {elapsed:.2f} seconds.")
    print(f"Stage B Final Result -> Loss: {stage_b_loss:.4f}, Accuracy: {stage_b_acc * 100:.2f}%\n")

    os.makedirs(artifacts_dir, exist_ok=True)
    pth_path = os.path.join(artifacts_dir, 'device_classifier.pth')
    meta_path = os.path.join(artifacts_dir, 'device_classifier_metadata.json')

    torch.save(model.state_dict(), pth_path)
    print(f"Saved trained weights: {pth_path}")

    metadata = {
        "architecture": "MobileNetV2",
        "pretrainedWeights": "MobileNetV2_Weights.DEFAULT",
        "classes": CLASSES,
        "classToIndex": CLASS_TO_INDEX,
        "inputSize": [224, 224],
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        },
        "trainingTimestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "realTrainingImages": train_dataset.class_counts,
        "totalTrainingImages": len(train_dataset),
        "twoStageStrategy": {
            "stageA": {
                "description": "Classifier Head Training (Backbone Frozen)",
                "epochs": args.stage_a_epochs,
                "learningRate": args.stage_a_lr,
                "finalLoss": round(stage_a_loss, 4),
                "finalAccuracy": round(stage_a_acc, 4)
            },
            "stageB": {
                "description": "Partial Fine-Tuning (Unfrozen feature blocks 14-18)",
                "unfrozenBlocks": "features[14:]",
                "epochs": args.stage_b_epochs,
                "backboneLearningRate": args.stage_b_backbone_lr,
                "headLearningRate": args.stage_b_head_lr,
                "weightDecay": 1e-3,
                "finalLoss": round(stage_b_loss, 4),
                "finalAccuracy": round(stage_b_acc, 4)
            }
        },
        "augmentation": [
            "RandomResizedCrop(224, scale=(0.8, 1.0))",
            "RandomHorizontalFlip(p=0.5)",
            "RandomRotation(degrees=15)",
            "ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1)"
        ],
        "hyperparameters": {
            "batchSize": args.batch_size,
            "seed": args.seed
        },
        "artifactFilename": "device_classifier.pth"
    }

    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved training metadata: {meta_path}\n")


if __name__ == '__main__':
    train()
