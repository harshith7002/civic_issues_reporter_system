"""
AI Classification Service for Jan Sahayak
Uses civic-sense-final.keras — EfficientNetB0 with integrated rejection pipeline.

Model output (dict from RejectionLayer):
    ood_distance    : float  — Mahalanobis distance from training distribution
    ood_rejected    : bool   — True if image is not a civic issue
    confidence      : float  — softmax probability of top class
    conf_rejected   : bool   — True if confidence below threshold (0.6)
    predicted_class : int    — index into CLASS_NAMES

Class order (alphabetical):
    0: Domestic_trash
    1: Infrastructure_Damage_Concrete
    2: Parking_Issues_Illegal_Parking
    3: Road_Issues_Damaged_Sign
    4: Road_Issues_Pothole
    5: Vandalism_Graffiti
"""

import io
import os
import logging
import cv2
import numpy as np

logger = logging.getLogger(__name__)

# ── Class names — must match training folder order exactly ─────────────────────
CLASS_NAMES = [
    "Domestic_trash",                   # 0
    "Infrastructure_Damage_Concrete",   # 1
    "Parking_Issues_Illegal_Parking",   # 2
    "Road_Issues_Damaged_Sign",         # 3
    "Road_Issues_Pothole",              # 4
    "Vandalism_Graffiti",               # 5
]

DEPARTMENT_MAP = {
    "Domestic_trash":                   "Solid Waste Management",
    "Infrastructure_Damage_Concrete":   "Buildings & Structures Department",
    "Parking_Issues_Illegal_Parking":   "Traffic Police",
    "Road_Issues_Damaged_Sign":         "Roads & Traffic Department",
    "Road_Issues_Pothole":              "Roads & Traffic Department",
    "Vandalism_Graffiti":               "Estate & Public Works Department",
}

INPUT_SIZE = (224, 224)

# Blur threshold — images below this are considered blurry
BLUR_THRESHOLD       = 50
# After enhancement, accept if blur score reaches this
BLUR_SALVAGE_THRESHOLD = 40   # slightly lower than original — enhanced images
                               # rarely fully recover but can be good enough


# ── Custom Keras classes — required to load your model ─────────────────────────
def _get_custom_objects():
    try:
        import tensorflow as tf

        class RejectionLayer(tf.keras.layers.Layer):
            def __init__(self, cov_mean, cov_precision,
                         ood_threshold, conf_threshold=0.6, **kwargs):
                super().__init__(**kwargs)
                self.cov_mean       = tf.constant(cov_mean,      dtype=tf.float32)
                self.cov_precision  = tf.constant(cov_precision, dtype=tf.float32)
                self.ood_threshold  = tf.constant(ood_threshold, dtype=tf.float32)
                self.conf_threshold = tf.constant(conf_threshold, dtype=tf.float32)

            def call(self, features, predictions):
                diff     = features - self.cov_mean
                distance = tf.sqrt(tf.reduce_sum(
                    diff @ self.cov_precision * diff, axis=-1
                ))
                ood_rejected  = distance > self.ood_threshold
                max_conf      = tf.reduce_max(predictions, axis=-1)
                conf_rejected = max_conf < self.conf_threshold
                return {
                    "ood_distance":    distance,
                    "ood_rejected":    ood_rejected,
                    "confidence":      max_conf,
                    "conf_rejected":   conf_rejected,
                    "predicted_class": tf.argmax(predictions, axis=-1),
                }

            def get_config(self):
                config = super().get_config()
                config.update({
                    "cov_mean":       self.cov_mean.numpy().tolist(),
                    "cov_precision":  self.cov_precision.numpy().tolist(),
                    "ood_threshold":  float(self.ood_threshold.numpy()),
                    "conf_threshold": float(self.conf_threshold.numpy()),
                })
                return config

        class CivicIssueClassifier(tf.keras.Model):
            def __init__(self, base_cnn, cov_mean, cov_precision,
                         ood_threshold, conf_threshold=0.6, **kwargs):
                super().__init__(**kwargs)
                self.base_cnn          = base_cnn
                self.feature_extractor = tf.keras.Model(
                    inputs=base_cnn.input,
                    outputs=base_cnn.layers[-3].output,
                    name="feature_extractor"
                )
                self.rejection = RejectionLayer(
                    cov_mean, cov_precision, ood_threshold, conf_threshold
                )

            def call(self, inputs, training=False):
                features    = self.feature_extractor(inputs, training=training)
                predictions = self.base_cnn(inputs,           training=training)
                return self.rejection(features, predictions)

            def get_config(self):
                return super().get_config()

        return {
            "CivicIssueClassifier": CivicIssueClassifier,
            "RejectionLayer":       RejectionLayer,
        }

    except ImportError:
        return {}


# ── Lazy singleton ──────────────────────────────────────────────────────────────
_model = None
_model_load_attempted = False


def _load_model():
    global _model, _model_load_attempted
    if _model_load_attempted:
        return _model
    _model_load_attempted = True

    search_paths = [
        os.path.join(os.path.dirname(__file__), "..", "ml",
                     "civic-sense-final.keras"),
        os.path.join(os.path.dirname(__file__), "..",
                     "civic-sense-final.keras"),
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
            "Classification will be unavailable. "
            "Place the .keras folder at backend/ml/"
        )
        return None

    try:
        import tensorflow as tf
        logger.info(f"Loading model from {model_path} ...")
        model = tf.keras.models.load_model(
            model_path,
            custom_objects=_get_custom_objects()
        )
        logger.info("Model loaded successfully.")
        _model = model
        return model

    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return None


# ── Image quality check ─────────────────────────────────────────────────────────
def _check_image_quality(img_bgr: np.ndarray) -> dict:
    """
    Runs quality checks on a BGR numpy array.
    Returns blur_score so the caller can decide whether to attempt enhancement.
    """
    if img_bgr is None:
        return {
            "accepted":   False,
            "blur_score": 0,
            "reasons":    ["Could not read image file."]
        }

    gray       = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    brightness = np.mean(gray)
    h, w       = img_bgr.shape[:2]

    reasons = []
    if brightness < 30:
        reasons.append("Image is too dark. Please ensure adequate lighting.")
    if h < 100 or w < 100:
        reasons.append("Image resolution is too low.")

    # Blur is checked separately so we can attempt salvage
    too_blurry = blur_score < BLUR_THRESHOLD

    return {
        "accepted":   len(reasons) == 0 and not too_blurry,
        "too_blurry": too_blurry,
        "blur_score": blur_score,
        "reasons":    reasons,
    }


# ── Image enhancer ─────────────────────────────────────────────────────────────
def _enhance_image(img_bgr: np.ndarray) -> tuple[np.ndarray, float]:
    """
    Attempts to salvage a blurry image using a multi-step enhancement pipeline:

      Step 1 — Denoise
        Reduces noise that can artificially lower the Laplacian blur score.
        Uses fastNlMeansDenoisingColored (best quality, slightly slower).

      Step 2 — Unsharp masking
        Classic sharpening technique:
          sharpened = original + amount * (original - blurred)
        Brings out edges without introducing ringing artefacts.

      Step 3 — CLAHE (Contrast Limited Adaptive Histogram Equalisation)
        Improves local contrast so the model can distinguish features
        more clearly even if some blur remains.

      Step 4 — Mild unsharp pass
        A second lighter sharpening pass to recover any detail
        lost during denoising.

    Returns (enhanced_bgr, new_blur_score)
    """
    enhanced = img_bgr.copy()

    # Step 1 — Denoise
    enhanced = cv2.fastNlMeansDenoisingColored(
        enhanced,
        None,
        h=6,           # luminance filter strength — lower = less denoising
        hColor=6,      # colour filter strength
        templateWindowSize=7,
        searchWindowSize=21
    )

    # Step 2 — Unsharp masking
    gaussian = cv2.GaussianBlur(enhanced, (0, 0), sigmaX=2.0)
    enhanced = cv2.addWeighted(
        enhanced, 1.5,      # original weight
        gaussian, -0.5,     # subtract blurred version
        0                   # bias
    )

    # Step 3 — CLAHE on L channel (LAB colour space preserves colour)
    lab     = cv2.cvtColor(enhanced, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe   = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l       = clahe.apply(l)
    lab     = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # Step 4 — Mild second unsharp pass
    gaussian2 = cv2.GaussianBlur(enhanced, (0, 0), sigmaX=1.0)
    enhanced  = cv2.addWeighted(enhanced, 1.2, gaussian2, -0.2, 0)

    # Measure blur score of result
    gray_enhanced = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
    new_blur_score = cv2.Laplacian(gray_enhanced, cv2.CV_64F).var()

    logger.info(f"Enhancement: blur score {img_bgr.mean():.1f} → {new_blur_score:.1f}")

    return enhanced, new_blur_score


# ── Preprocessing — matches training pipeline exactly ──────────────────────────
def _preprocess(img_bgr: np.ndarray) -> "np.ndarray":
    img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, INPUT_SIZE)
    return np.expand_dims(img, axis=0).astype(np.float32)


# ── Main public API ─────────────────────────────────────────────────────────────
def classify_image(image_bytes: bytes) -> dict:
    """
    Classify a civic issue image with full rejection pipeline.

    Returns on acceptance:
        {
            "accepted":         True,
            "category":         "Road_Issues_Pothole",
            "confidence":       0.94,
            "department":       "Roads & Traffic Department",
            "ood_distance":     12.43,
            "enhanced":         False,   # True if image was salvaged
            "model":            "efficientnetb0"
        }

    Returns on rejection:
        {
            "accepted":         False,
            "stage":            "quality_check" | "ood_check" |
                                "confidence_check" | "model_unavailable" |
                                "inference_error",
            "reasons":          ["Image is too blurry."],
            "model":            "efficientnetb0" | "unavailable"
        }
    """
    # ── Decode image bytes to BGR numpy array ──────────────────────────────────
    nparr   = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        return {
            "accepted": False,
            "stage":    "quality_check",
            "reasons":  ["Could not read image file."],
            "model":    "unavailable"
        }

    # ── Step 1 — Initial quality check ────────────────────────────────────────
    quality   = _check_image_quality(img_bgr)
    enhanced  = False

    if quality["too_blurry"]:
        logger.info(
            f"Blur score {quality['blur_score']:.1f} below threshold "
            f"{BLUR_THRESHOLD} — attempting enhancement"
        )

        # Attempt to salvage the blurry image
        img_enhanced, new_blur_score = _enhance_image(img_bgr)

        if new_blur_score >= BLUR_SALVAGE_THRESHOLD:
            # Enhancement worked — use enhanced image for inference
            logger.info(
                f"Enhancement succeeded — "
                f"new blur score {new_blur_score:.1f} >= {BLUR_SALVAGE_THRESHOLD}"
            )
            img_bgr  = img_enhanced
            enhanced = True
            # Re-run quality check on enhanced image to catch other issues
            quality  = _check_image_quality(img_bgr)
        else:
            # Enhancement didn't help enough — hard reject
            logger.info(
                f"Enhancement failed — "
                f"blur score {new_blur_score:.1f} still below {BLUR_SALVAGE_THRESHOLD}"
            )
            return {
                "accepted": False,
                "stage":    "quality_check",
                "reasons":  [
                    "Image is too blurry and could not be enhanced. "
                    "Please take a clearer photo."
                ],
                "model":    "unavailable"
            }

    # Check remaining quality issues (brightness, resolution)
    if not quality["accepted"]:
        return {
            "accepted": False,
            "stage":    "quality_check",
            "reasons":  quality["reasons"],
            "model":    "unavailable"
        }

    # ── Step 2 — Load model ────────────────────────────────────────────────────
    model = _load_model()
    if model is None:
        return {
            "accepted": False,
            "stage":    "model_unavailable",
            "reasons":  ["Classification model is not loaded. "
                         "Please contact support."],
            "model":    "unavailable"
        }

    # ── Step 3 — Preprocess and run model ─────────────────────────────────────
    try:
        arr    = _preprocess(img_bgr)
        result = model(arr)

        ood_rejected  = bool(result["ood_rejected"][0])
        conf_rejected = bool(result["conf_rejected"][0])
        confidence    = float(result["confidence"][0])
        ood_distance  = float(result["ood_distance"][0])
        class_idx     = int(result["predicted_class"][0])

        # ── Step 4 — OOD check ────────────────────────────────────────────────
        if ood_rejected:
            return {
                "accepted":     False,
                "stage":        "ood_check",
                "reasons":      ["Image does not appear to show a civic issue."],
                "ood_distance": ood_distance,
                "model":        "efficientnetb0"
            }

        # ── Step 5 — Confidence check ─────────────────────────────────────────
        if conf_rejected:
            return {
                "accepted":   False,
                "stage":      "confidence_check",
                "reasons":    ["Image does not clearly show a civic issue. "
                               "Please upload a clearer photo."],
                "confidence": confidence,
                "model":      "efficientnetb0"
            }

        # ── Step 6 — Accepted ─────────────────────────────────────────────────
        category = CLASS_NAMES[class_idx]
        return {
            "accepted":     True,
            "category":     category,
            "confidence":   confidence,
            "department":   DEPARTMENT_MAP.get(category, "General Department"),
            "ood_distance": ood_distance,
            "enhanced":     enhanced,   # lets frontend inform user image was enhanced
            "model":        "efficientnetb0"
        }

    except Exception as e:
        logger.error(f"Model inference failed: {e}")
        return {
            "accepted": False,
            "stage":    "inference_error",
            "reasons":  ["Classification failed. Please try again."],
            "model":    "unavailable"
        }


def get_department(category: str) -> str:
    return DEPARTMENT_MAP.get(category, "General Department")
