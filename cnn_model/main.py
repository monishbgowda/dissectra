"""
FastAPI Server for Dissectra Local MobileNetV2 Device Classifier

Provides local REST endpoints for 3-class device classification:
  - mouse (0)
  - pendrive (1)
  - other (2)
"""

import io
import os
import sys
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from product_classifier import (
    DeviceClassifier,
    CLASSES,
    CLASS_TO_INDEX,
    INDEX_TO_CLASS,
    predict_single_image,
    predict_multi_images,
)

app = FastAPI(
    title="Dissectra Local Classifier API",
    description="FastAPI service for 3-class MobileNetV2 device classification",
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

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "artifacts")
WEIGHTS_PATH = os.path.join(ARTIFACTS_DIR, "device_classifier.pth")

_model = None
_model_loaded = False


def load_model_if_available():
    global _model, _model_loaded
    if _model_loaded and _model is not None:
        return _model

    if os.path.exists(WEIGHTS_PATH):
        try:
            model = DeviceClassifier(num_classes=3, freeze_backbone=True)
            state_dict = torch.load(WEIGHTS_PATH, map_location=torch.device('cpu'))
            model.load_state_dict(state_dict)
            model.eval()
            _model = model
            _model_loaded = True
            print(f"✓ Successfully loaded trained weights from {WEIGHTS_PATH}")
            return _model
        except Exception as err:
            print(f"[ERROR] Failed to load model weights at {WEIGHTS_PATH}: {err}")
            _model = None
            _model_loaded = False
            return None
    else:
        _model = None
        _model_loaded = False
        return None


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Dissectra Local Classifier FastAPI Server",
        "version": "1.0.0",
        "model_loaded": os.path.exists(WEIGHTS_PATH),
        "endpoints": {
            "health": "/health",
            "classifyDevice": "POST /classify-device"
        }
    }


@app.get("/health")
def health_check():
    model_ready = os.path.exists(WEIGHTS_PATH)
    return {
        "status": "ok",
        "model_loaded": model_ready,
        "weights_path": WEIGHTS_PATH if model_ready else None
    }


@app.get("/products")
def list_products():
    """Return catalog of supported 3-class categories."""
    return {"total": len(CLASSES), "catalog": INDEX_TO_CLASS}


@app.post("/classify-device")
async def classify_device_endpoint(files: List[UploadFile] = File(...)):
    """
    Accepts 1 or more uploaded inspection images for the same physical device.
    Element-wise averages raw pre-softmax logits across images, then computes stable softmax.
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="At least one image file is required.")

    model = load_model_if_available()
    if model is None:
        return {
            "success": False,
            "confidenceAvailable": False,
            "calibrated": False,
            "temperature": None,
            "reason": "LOCAL_CLASSIFIER_NOT_READY",
            "message": "Local PyTorch model weights do not exist on disk yet. Run train_device_classifier.py after dataset collection."
        }

    try:
        image_bytes_list = []
        for file in files:
            contents = await file.read()
            image_bytes_list.append(contents)

        if len(image_bytes_list) == 1:
            result = predict_single_image(model, image_bytes_list[0])
            result["imageCount"] = 1
        else:
            result = predict_multi_images(model, image_bytes_list)

        result["success"] = True
        return result

    except Exception as e:
        return {
            "success": False,
            "confidenceAvailable": False,
            "calibrated": False,
            "temperature": None,
            "reason": f"INFERENCE_ERROR: {str(e)}"
        }


@app.post("/predict")
async def predict_legacy(file: UploadFile = File(...)):
    """Legacy compatibility endpoint."""
    return await classify_device_endpoint(files=[file])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
