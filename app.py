import os
import json
import uuid
import numpy as np
import tensorflow as tf

from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

from tensorflow.keras.applications import resnet50
from tensorflow.keras.utils import load_img, img_to_array

# ======================================================
# PATH CONFIG (SAFE & PORTABLE)
# ======================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "trashbox_resnet50_final.keras")
LABELS_PATH = os.path.join(BASE_DIR, "class_names.json")

UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "gif"}
IMG_SIZE = (224, 224)

# ======================================================
# FLASK APP INIT
# ======================================================
app = Flask(__name__)
CORS(app)  # ✅ ENABLE CORS FOR REACT
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ======================================================
# LOAD MODEL & LABELS
# ======================================================
print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)

print("Loading class names...")
with open(LABELS_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)["class_names"]

print("✅ Model + labels loaded successfully.")
print("Classes:", class_names)

# ======================================================
# HELPER FUNCTIONS
# ======================================================
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def predict_image(img_path: str):
    """
    Load image, apply ResNet50 preprocessing,
    return predicted label, confidence, and top-3 predictions.
    """
    img = load_img(img_path, target_size=IMG_SIZE)
    x = img_to_array(img)
    x = np.expand_dims(x, axis=0).astype(np.float32)
    x = resnet50.preprocess_input(x)

    probs = model.predict(x, verbose=0)[0]
    idx = int(np.argmax(probs))

    label = class_names[idx]
    confidence = float(probs[idx])

    top3_idx = probs.argsort()[-3:][::-1]
    top3 = [(class_names[i], float(probs[i])) for i in top3_idx]

    return label, confidence, top3


# ======================================================
# ROUTES
# ======================================================
@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
    file.save(save_path)

    try:
        label, confidence, top3 = predict_image(save_path)

        return jsonify({
            "predicted_class": label,
            "confidence": confidence,
            "top3": [
                {"class": c, "confidence": conf}
                for c, conf in top3
            ]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
