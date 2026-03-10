"""
AI Classification Service for Jan Sahayak
Uses a trained EfficientNetB0 CNN (civic-sense-final.keras).

Model architecture (from config.json):
  - Base: EfficientNetB0 (ImageNet pretrained, fine-tuned)
  - Input: (224, 224, 3)  — includes internal Rescaling + Normalization
  - GlobalAveragePooling2D
  - Dense(256, relu)
  - Dropout(0.5)
  - Dense(6, softmax)   <- 6 civic issue classes

Class order (alphabetical, standard Keras ImageDataGenerator default):
  Index 0: drainage
  Index 1: garbage
  Index 2: normal       <- "no issue / background"
  Index 3: pothole
  Index 4: streetlight
  Index 5: water_leakage

If your training data folder order differs, update CLASS_NAMES below.
"""

import io
import os
import logging
import hashlib
import random

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ── CLASS NAMES — must match your training folder order (alphabetical default) ─
CLASS_NAMES = [
    "drainage",       # 0
    "garbage",        # 1
    "normal",         # 2  background / no issue
    "pothole",        # 3
    "streetlight",    # 4
    "water_leakage",  # 5
]

DEPARTMENT_MAP = {
    "pothole":       "Road Department",
    "garbage":       "Sanitation Department",
    "streetlight":   "Electricity Department",
    "drainage":      "Water & Drainage Department",
    "water_leakage": "Water Supply Department",
    "normal":        "General Municipal Department",
}

INPUT_SIZE = (224, 224)  # EfficientNetB0 input

# ── Lazy singleton model ────────────────────────────────────────────────────────
_model = None
_model_load_attempted = False


def _load_model():
    global _model, _model_load_attempted
    if _model_load_attempted:
        return _model
    _model_load_attempted = True

    # Where to place the .keras folder (config.json + model.weights.h5 inside it)
    search_paths = [
        os.path.join(os.path.dirname(__file__), "..", "ml", "civic-sense-final.keras"),
        os.path.join(os.path.dirname(__file__), "..", "civic-sense-final.keras"),
        "civic-sense-final.keras",
        "/models/civic-sense-final.keras",
    ]

    model_path = None
    for p in search_paths:
        p = os.path.abspath(p)
        if os.path.exists(p):
            model_path = p
            break

    if model_path is None:
        logger.warning(
            "civic-sense-final.keras not found. "
            "Falling back to heuristic classifier. "
            "To enable real AI: place the .keras folder at backend/ml/"
        )
        return None

    try:
        import tensorflow as tf
        logger.info(f"Loading Keras model from {model_path} ...")
        model = tf.keras.models.load_model(model_path)
        logger.info("Keras model loaded successfully.")
        _model = model
        return model
    except Exception as e:
        logger.error(f"Failed to load Keras model: {e}")
        return None


def _preprocess(image_bytes: bytes) -> "np.ndarray":
    """
    Resize to (224,224) and cast to float32.
    The model's own Rescaling+Normalization layers handle pixel scaling.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(INPUT_SIZE, Image.BILINEAR)
    arr = np.array(img, dtype=np.float32)   # (224, 224, 3), values 0-255
    return np.expand_dims(arr, axis=0)       # (1, 224, 224, 3)


# ── Fallback heuristic (used when model file is absent) ────────────────────────
def _heuristic_classify(image_bytes: bytes) -> dict:
    FALLBACK = ["pothole", "garbage", "streetlight", "drainage", "water_leakage"]
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((64, 64))
        arr = np.array(img).astype(float)
        r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
        T = arr.shape[0] * arr.shape[1]
        hints = {
            "pothole":       np.sum(np.abs(r-g) < 30)/T * 0.4 + np.sum((r+g+b) < 150)/T * 0.3,
            "garbage":       np.sum((g > r+20) & (g > b+20))/T * 0.5,
            "streetlight":   np.sum((r+g+b) > 500)/T * 0.3 + np.sum((r>150)&(g>150)&(b<100))/T * 0.4,
            "drainage":      np.sum((r+g+b) < 180)/T * 0.35,
            "water_leakage": np.sum((b > r+20) & (b > g+10))/T * 0.4,
        }
    except Exception:
        hints = {k: 0.2 for k in FALLBACK}

    seed = int(hashlib.md5(image_bytes[:512]).hexdigest()[:8], 16) % (2**31)
    rng = random.Random(seed)
    scores = {k: v + rng.uniform(0.05, 0.25) for k, v in hints.items()}
    total = sum(scores.values())
    probs = {k: v / total for k, v in scores.items()}
    best = max(probs, key=probs.get)
    conf = round(max(0.65, min(0.97, probs[best] * 2.8)), 3)

    return {
        "category": best,
        "confidence": conf,
        "department": DEPARTMENT_MAP.get(best, "General Department"),
        "all_predictions": {k: round(v, 3) for k, v in probs.items()},
        "model": "heuristic",
    }


# ── Main public API ─────────────────────────────────────────────────────────────
def classify_image(image_bytes: bytes) -> dict:
    """
    Classify a civic issue image.
    Returns: { category, confidence, department, all_predictions, model }
    """
    model = _load_model()
    if model is None:
        return _heuristic_classify(image_bytes)

    try:
        arr = _preprocess(image_bytes)
        preds = model.predict(arr, verbose=0)[0]           # shape (6,)
        all_preds = {CLASS_NAMES[i]: float(round(float(preds[i]), 4)) for i in range(len(CLASS_NAMES))}

        best_idx = int(np.argmax(preds))
        best_class = CLASS_NAMES[best_idx]
        confidence = float(round(float(preds[best_idx]), 4))

        # If "normal" wins with high confidence, use second-best civic class
        if best_class == "normal" and confidence > 0.7:
            civic_idx = max(
                (i for i, c in enumerate(CLASS_NAMES) if c != "normal"),
                key=lambda i: preds[i]
            )
            best_class = CLASS_NAMES[civic_idx]
            confidence = float(round(float(preds[civic_idx]), 4))

        return {
            "category": best_class,
            "confidence": confidence,
            "department": DEPARTMENT_MAP.get(best_class, "General Department"),
            "all_predictions": all_preds,
            "model": "efficientnetb0",
        }

    except Exception as e:
        logger.error(f"Model inference failed: {e}. Falling back to heuristic.")
        return _heuristic_classify(image_bytes)


def get_department(category: str) -> str:
    return DEPARTMENT_MAP.get(category, "General Department")