from flask import Flask, request, jsonify
from flask_cors import CORS
from models import pipeline
import os
from waitress import serve  # production-ready WSGI server

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    title = data.get("title", "")
    input_type = data.get("input", "")
    result = pipeline(title, text, input_type)
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render requires PORT
    serve(app, host="0.0.0.0", port=port)
