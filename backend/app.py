from flask import Flask, request, jsonify
from flask_cors import CORS
from models import pipeline


app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text")
    if isinstance(text, dict):
        text = text.get("content", "")
    print(text)
    
    result = pipeline(data.get("title", ""), text, data.get("input", ""))
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)