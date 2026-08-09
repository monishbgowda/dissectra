"""
FastAPI Server for Dissectra CNN Product Classifier
Provides REST endpoints for product classification and component detection.
"""

import io
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import torch
import torchvision.transforms as transforms

from product_classifier import ProductClassifier, get_product_info, export_to_onnx

app = FastAPI(
    title="Dissectra CNN Classification API",
    description="FastAPI service for product image classification & component breakdown",
    version="1.0.0"
)

# Enable CORS for React Native and Express backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy loading model instance
MODEL_PATH = "product_classifier.onnx"
_model = None


def get_model():
    global _model
    if _model is None:
        _model = ProductClassifier(num_classes=10, num_components=5)
        _model.eval()
    return _model


# Image preprocessing pipeline
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Dissectra CNN FastAPI Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "products": "/products",
            "predict": "POST /predict",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": _model is not None}


@app.get("/products")
def list_products():
    """Return catalog of supported product categories and their components."""
    catalog = {}
    for idx in range(10):
        catalog[idx] = get_product_info(idx)
    return {"total": len(catalog), "catalog": catalog}


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """Accept an uploaded product image and return classification & detected components."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        input_tensor = transform(image).unsqueeze(0)

        model = get_model()
        with torch.no_grad():
            class_logits, component_logits = model(input_tensor)
            class_probs = torch.softmax(class_logits, dim=1)
            component_probs = torch.sigmoid(component_logits)

            predicted_idx = torch.argmax(class_probs, dim=1).item()
            confidence = class_probs[0][predicted_idx].item()
            detected_flags = (component_probs > 0.5).squeeze().tolist()

        product_info = get_product_info(predicted_idx)

        # Map component flags to component names
        all_components = product_info.get("components", [])
        detected_component_names = [
            comp for idx, comp in enumerate(all_components)
            if idx < len(detected_flags) and (detected_flags[idx] if isinstance(detected_flags, list) else detected_flags)
        ]

        return {
            "success": True,
            "product": product_info,
            "confidence": round(confidence, 4),
            "predicted_class_id": predicted_idx,
            "detected_components": detected_component_names,
            "all_components": all_components
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
