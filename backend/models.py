import joblib
import numpy as np
from openai import OpenAI
import json
import re

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="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",
)

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

    response = client.chat.completions.create(
    model="gpt-5",
    messages=[{"role": "user", "content": prompt}],
    temperature=0
)
    raw_content = response.choices[0].message.content

    # Remove ```json or ``` at the start and ``` at the end
    cleaned = re.sub(r'^```json\s*|\s*```$', '', raw_content.strip(), flags=re.DOTALL)

    try:
        llm_result = json.loads(cleaned)
    except json.JSONDecodeError:
        print("Invalid JSON from LLM:", cleaned)
        # fallback to default structure
        llm_result = {
            "prediction": None,
            "probability": 0,
            "metrics": {
                "languageComplexity": 0,
                "emotionalTone": 0,
                "factualDensity": 0,
                "sourceCredibility": 0
            },
            "agreelinks": [],
            "contradictlnks": [],
            "reason": ""
        }

    # Combine TF-IDF word scores with LLM verdict
    result = {
        "label": llm_result.get("prediction", "UNCERTAIN"),
        "probability": llm_result.get("probability", 0),
        "metrics": llm_result.get("metrics", {}),
        "word_scores": word_scores,
        "reasoning": llm_result.get("reason"),
    }

    return result
    

    