from flask import Flask, request, jsonify
from flask_cors import CORS
from models import predict


app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    if "text" not in data:
        return jsonify({"error": "Missing 'text' in request"}), 400

    result = predict(data["title"], data["text"])
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)