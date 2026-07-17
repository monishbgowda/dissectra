"""
CNN Model for Product Classification in Dissectra
Compatible with React Native via ONNX/TFLite export

Architecture: MobileNetV2-based classifier for product images
- Input: 224x224 RGB images
- Output: Product class + component segmentation
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import json


class ProductClassifier(nn.Module):
    """
    MobileNetV2-based product classifier with component detection.
    Lightweight enough for mobile deployment.
    """

    def __init__(self, num_classes=10, num_components=5):
        super(ProductClassifier, self).__init__()

        # Backbone: MobileNetV2 (lightweight, mobile-friendly)
        self.backbone = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        self.backbone.classifier = nn.Identity()  # Remove default classifier

        # Feature dimensions from MobileNetV2
        self.feature_dim = 1280

        # Product classification head
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(self.feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes)
        )

        # Component detection head (multi-label classification)
        self.component_detector = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(self.feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, num_components)
        )

    def forward(self, x):
        features = self.backbone(x)
        class_logits = self.classifier(features)
        component_logits = self.component_detector(features)
        return class_logits, component_logits


class ProductDataset(torch.utils.data.Dataset):
    """Dataset loader for product images with component labels."""

    def __init__(self, image_paths, labels, component_labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.component_labels = component_labels
        self.transform = transform or self.default_transform()

    def default_transform(self):
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image = Image.open(self.image_paths[idx]).convert('RGB')
        image = self.transform(image)
        return image, self.labels[idx], self.component_labels[idx]


def export_to_onnx(model, output_path="product_classifier.onnx"):
    """Export model to ONNX format for React Native integration."""
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)

    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        input_names=['input'],
        output_names=['class_output', 'component_output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'class_output': {0: 'batch_size'},
            'component_output': {0: 'batch_size'}
        },
        opset_version=11
    )
    print(f"Model exported to {output_path}")


def get_product_info(prediction_idx):
    """Map prediction index to product info."""
    PRODUCT_CATALOG = {
        0: {"name": "Duck", "category": "Toy", "components": ["Beak", "Wings", "Tail"]},
        1: {"name": "Box", "category": "Container", "components": ["Face", "Edge", "Corner"]},
        2: {"name": "Avocado", "category": "Food", "components": ["Skin", "Flesh", "Seed"]},
        3: {"name": "Chair", "category": "Furniture", "components": ["Seat", "Legs", "Backrest"]},
        4: {"name": "Phone", "category": "Electronics", "components": ["Screen", "Battery", "Camera"]},
        5: {"name": "Bottle", "category": "Container", "components": ["Cap", "Body", "Label"]},
        6: {"name": "Car", "category": "Vehicle", "components": ["Engine", "Wheels", "Body"]},
        7: {"name": "Watch", "category": "Accessory", "components": ["Dial", "Strap", "Crown"]},
        8: {"name": "Laptop", "category": "Electronics", "components": ["Screen", "Keyboard", "Battery"]},
        9: {"name": "Shoe", "category": "Clothing", "components": ["Sole", "Upper", "Laces"]}
    }
    return PRODUCT_CATALOG.get(prediction_idx, {"name": "Unknown", "category": "Unknown", "components": []})


def predict(image_path, model_path="product_classifier.onnx"):
    """Run inference on a single image."""
    import onnxruntime as ort

    session = ort.InferenceSession(model_path)

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ])

    image = Image.open(image_path).convert('RGB')
    input_tensor = transform(image).unsqueeze(0).numpy()

    outputs = session.run(
        None,
        {'input': input_tensor}
    )

    class_probs = torch.softmax(torch.tensor(outputs[0]), dim=1)
    component_probs = torch.sigmoid(torch.tensor(outputs[1]))

    predicted_class = torch.argmax(class_probs, dim=1).item()
    detected_components = (component_probs > 0.5).squeeze().tolist()

    return {
        "product": get_product_info(predicted_class),
        "confidence": class_probs[0][predicted_class].item(),
        "components_detected": detected_components
    }


# Example usage
if __name__ == "__main__":
    # Create model
    model = ProductClassifier(num_classes=10, num_components=5)

    # Export to ONNX
    export_to_onnx(model, "product_classifier.onnx")

    print("CNN Model created and exported successfully!")
    print("\nModel Architecture:")
    print(f"  Backbone: MobileNetV2")
    print(f"  Input: 224x224 RGB")
    print(f"  Output: 10 product classes + 5 component detections")
    print(f"  Parameters: {sum(p.numel() for p in model.parameters()):,}")
