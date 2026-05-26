import io
import os
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.layers import Dense
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# ==========================================
# MODEL CONFIG
# ==========================================

#used densenet121 for training
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "pneumonia_best_model.keras"
)

INPUT_SIZE = (224, 224)

# ==========================================
# LOAD MODEL
# ==========================================

print("Loading Pneumonia Detection Model...")

def load_pneumonia_model(model_path):
    original_dense_init = Dense.__init__

    def dense_init_without_quantization(self, *args, quantization_config=None, **kwargs):
        return original_dense_init(self, *args, **kwargs)

    Dense.__init__ = dense_init_without_quantization
    try:
        return load_model(model_path, compile=False)
    finally:
        Dense.__init__ = original_dense_init


model = load_pneumonia_model(MODEL_PATH)

print("Model loaded successfully!")

# Warmup prediction
model.predict(np.zeros((1, 224, 224, 3)), verbose=0)

# ==========================================
# IMAGE PREPROCESSING
# ==========================================

def preprocess_image(image_bytes):

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    img = img.resize(INPUT_SIZE)

    img_array = np.asarray(img).astype(np.float32) / 255.0

    img_array = np.expand_dims(img_array, axis=0)

    return img_array

# ==========================================
# PREDICTION ROUTE
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        if "file" not in request.files:
            return jsonify({
                "success": False,
                "error": "No file uploaded"
            }), 400

        file = request.files["file"]

        img = preprocess_image(file.read())

        preds = model.predict(img, verbose=0)

        prob = float(preds[0][0])

        label = "Pneumonia" if prob >= 0.5 else "Normal"

        confidence = prob if prob >= 0.5 else 1 - prob

        return jsonify({
            "success": True,
            "prediction": label,
            "confidence": round(confidence * 100, 2)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
