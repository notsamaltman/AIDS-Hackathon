import joblib
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re
import os

load_dotenv()
API_KEY = os.getenv("MY_API_KEY")

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

# Load models
vectorizer = joblib.load(r"c:\Users\Deepak\Documents\AIDS-Hackathon\backend\tfidf_vectorizer.joblib")
clf = joblib.load(r"c:\Users\Deepak\Documents\AIDS-Hackathon\backend\logistic_model.joblib")

def predict(text):
    vec = vectorizer.transform([text])
    prob = clf.predict_proba(vec)[0]
    pred = int(clf.predict(vec)[0])

    # Word-level contribution scores
    feature_names = vectorizer.get_feature_names_out()
    word_scores = {}
    words = text.lower().split()
    for w in words:
        if w in feature_names:
            idx = np.where(feature_names == w)[0][0]
            word_scores[w] = prob[1] * vec[0, idx]

    prompt = f"""
You are a fact-checking assistant. Analyze the following text:
{text}

1. Overall verdict: FAKE / REAL / UNCERTAIN
2. Probability of being fake (0-1)
3. Metrics (0-1):
   - languageComplexity
   - emotionalTone
   - factualDensity
   - sourceCredibility
4. please Provide some links for articles or news agreeing or contradicting to the claim 
5. Provide some reasoning for your decision

Return the output strictly as JSON like:
{{
  "prediction": "FAKE",
  "probability": 0.87,
  "metrics": {{
    "languageComplexity": 0.65,
    "emotionalTone": 0.2,
    "factualDensity": 0.75,
    "sourceCredibility": 0.6
  }},
  "agreelinks": ['example.com'],
  "contradictlnks": ['123.com'],
  "reason": "this is the reason"
}}
"""

    response = model.generate_content(prompt)

    raw_text = response.text
    print(raw_text)

    # Remove the prefix 'json"""' and the trailing '"""'
    if raw_text.startswith('```json'):
        raw_text = raw_text[len('```json'):]
    if raw_text.endswith('```'):
        raw_text = raw_text[:-3]

    # Now parse it as JSON
    data = json.loads(raw_text)
    print(data)

    # Combine TF-IDF word scores with LLM verdict
    result = {
        "label": data.get("prediction", "UNCERTAIN"),
        "probability": data.get("probability", 0)*0.9 + pred*0.1,
        "metrics": data.get("metrics", {}),
        "word_scores": word_scores,
        "agreelinks": data.get("agreelinks"),
        "contradictlnks":data.get("contradictlnks"),
        "reasoning": data.get("reason"),
    }

    return result
    

    