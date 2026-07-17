# CNN Model for Dissectra Product Classification

## Overview
Lightweight CNN model for classifying product images and detecting their components.
Designed for mobile deployment via ONNX export.

## Architecture
- **Backbone**: MobileNetV2 (pretrained on ImageNet)
- **Input**: 224x224 RGB images
- **Output 1**: Product class (10 categories)
- **Output 2**: Component detection (5 types per product)

## Setup

```bash
cd cnn_model
pip install -r requirements.txt
```

## Usage

### Train / Export Model
```python
from product_classifier import ProductClassifier, export_to_onnx

model = ProductClassifier(num_classes=10, num_components=5)
export_to_onnx(model, "product_classifier.onnx")
```

### Run Inference
```python
from product_classifier import predict

result = predict("path/to/product_image.jpg")
print(result["product"]["name"])  # e.g. "Duck"
print(result["product"]["components"])  # ["Beak", "Wings", "Tail"]
```

## Integration with React Native
1. Export model to ONNX format
2. Use `onnx-react-native` or TensorFlow Lite converter
3. Deploy model to device for offline inference

## Product Categories
| ID | Product   | Components                  |
|----|-----------|----------------------------|
| 0  | Duck      | Beak, Wings, Tail           |
| 1  | Box       | Face, Edge, Corner         |
| 2  | Avocado   | Skin, Flesh, Seed          |
| 3  | Chair     | Seat, Legs, Backrest      |
| 4  | Phone     | Screen, Battery, Camera  |
| 5  | Bottle    | Cap, Body, Label         |
| 6  | Car       | Engine, Wheels, Body     |
| 7  | Watch     | Dial, Strap, Crown         |
| 8  | Laptop    | Screen, Keyboard, Battery|
| 9  | Shoe      | Sole, Upper, Laces        |
