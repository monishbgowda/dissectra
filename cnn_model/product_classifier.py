"""
MobileNetV2 3-Class Device Classifier for Dissectra

Architecture: MobileNetV2-based transfer learning classifier
Input: 224x224 RGB image
Classes:
  0 = mouse
  1 = pendrive
  2 = other
"""

import io
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

# Centralized explicit class mapping
CLASS_TO_INDEX = {
    "mouse": 0,
    "pendrive": 1,
    "other": 2
}

INDEX_TO_CLASS = {
    0: "mouse",
    1: "pendrive",
    2: "other"
}

CLASSES = ["mouse", "pendrive", "other"]


class DeviceClassifier(nn.Module):
    """
    MobileNetV2-based 3-class device classifier for Dissectra.
    Outputs raw pre-softmax logits for: mouse (0), pendrive (1), other (2).
    """

    def __init__(self, num_classes=3, freeze_backbone=True):
        super(DeviceClassifier, self).__init__()

        # Pretrained MobileNetV2 backbone (ImageNet)
        try:
            weights = models.MobileNet_V2_Weights.DEFAULT
            self.backbone = models.mobilenet_v2(weights=weights)
        except Exception:
            self.backbone = models.mobilenet_v2(pretrained=True)

        self.backbone.classifier = nn.Identity()

        if freeze_backbone:
            for param in self.backbone.parameters():
                param.requires_grad = False

        self.feature_dim = 1280

        # Classifier head (exposes 3 raw logits)
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(self.feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes)
        )

    def unfreeze_upper_backbone(self, unfreeze_from_block=14):
        """
        Unfreezes feature blocks from unfreeze_from_block onwards for Stage B partial fine-tuning.
        Keeps earlier lower-level feature extraction blocks frozen.
        """
        for i, block in enumerate(self.backbone.features):
            if i >= unfreeze_from_block:
                for param in block.parameters():
                    param.requires_grad = True
            else:
                for param in block.parameters():
                    param.requires_grad = False

    def forward(self, x):
        features = self.backbone(x)
        class_logits = self.classifier(features)
        return class_logits


# Alias for backward compatibility
ProductClassifier = DeviceClassifier


def get_inference_transform():
    """Deterministic image preprocessing for validation & inference."""
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


def get_training_transform():
    """Training augmentation pipeline (applied only to training split)."""
    return transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


def load_image(image_input):
    """
    Loads a PIL Image from path string, bytes, or PIL Image instance.
    Safely handles RGB, RGBA, LA, palette (P) images with transparency by compositing
    transparent alpha layers onto a solid white background before converting to RGB.
    """
    if isinstance(image_input, Image.Image):
        img = image_input
    elif isinstance(image_input, bytes):
        img = Image.open(io.BytesIO(image_input))
    elif isinstance(image_input, str):
        img = Image.open(image_input)
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        return background

    return img.convert('RGB')


def predict_single_image(model, image_input):
    """
    Runs local 3-class inference on a single image.

    Returns raw pre-softmax logits (classLogScores) and stable softmax probabilities.
    """
    model.eval()
    transform = get_inference_transform()
    image = load_image(image_input)
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        logits_tensor = model(tensor)
        logits = logits_tensor.squeeze(0).tolist()

    class_log_scores = {
        "mouse": float(logits[0]),
        "pendrive": float(logits[1]),
        "other": float(logits[2])
    }

    # Numerically stable softmax computation
    probs_tensor = torch.softmax(logits_tensor, dim=1).squeeze(0).tolist()
    raw_probabilities = {
        "mouse": float(probs_tensor[0]),
        "pendrive": float(probs_tensor[1]),
        "other": float(probs_tensor[2])
    }

    # Predicted class = argmax of raw logits
    top_idx = int(torch.argmax(logits_tensor, dim=1).item())
    predicted_class = INDEX_TO_CLASS.get(top_idx, "other")

    return {
        "predictedClass": predicted_class,
        "classLogScores": class_log_scores,
        "rawProbabilities": raw_probabilities,
        "confidenceAvailable": True
    }


def predict_multi_images(model, image_inputs):
    """
    Runs multi-image inference across K photos of the same physical device.

    Element-wise averages the raw pre-softmax logits across images, then computes stable softmax.
    """
    if not isinstance(image_inputs, list) or len(image_inputs) == 0:
        raise ValueError("image_inputs must be a non-empty list.")

    if len(image_inputs) == 1:
        single_result = predict_single_image(model, image_inputs[0])
        single_result["imageCount"] = 1
        return single_result

    model.eval()
    transform = get_inference_transform()

    all_logits = []
    for img_inp in image_inputs:
        image = load_image(img_inp)
        tensor = transform(image).unsqueeze(0)
        with torch.no_grad():
            l_tensor = model(tensor).squeeze(0)
            all_logits.append(l_tensor)

    # Element-wise mean of pre-softmax logits
    stacked_logits = torch.stack(all_logits, dim=0)
    mean_logits = torch.mean(stacked_logits, dim=0)

    aggregated_logits = {
        "mouse": float(mean_logits[0].item()),
        "pendrive": float(mean_logits[1].item()),
        "other": float(mean_logits[2].item())
    }

    probs_tensor = torch.softmax(mean_logits.unsqueeze(0), dim=1).squeeze(0)
    raw_probabilities = {
        "mouse": float(probs_tensor[0].item()),
        "pendrive": float(probs_tensor[1].item()),
        "other": float(probs_tensor[2].item())
    }

    top_idx = int(torch.argmax(mean_logits).item())
    predicted_class = INDEX_TO_CLASS.get(top_idx, "other")

    return {
        "predictedClass": predicted_class,
        "classLogScores": aggregated_logits,
        "rawProbabilities": raw_probabilities,
        "imageCount": len(image_inputs),
        "confidenceAvailable": True
    }
