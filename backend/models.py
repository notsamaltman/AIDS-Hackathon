import os
import joblib
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re
import requests
from bs4 import BeautifulSoup

load_dotenv()

# Lazy-loaded globals
vectorizer = None
clf = None
model = None
gemini_initialized = False

def init_models():
    """Lazy-load ML models and Gemini LLM"""
    global vectorizer, clf, model, gemini_initialized
    if vectorizer is None:
        vectorizer = joblib.load(os.path.join(os.path.dirname(__file__), "tfidf_vectorizer.joblib"))
    if clf is None:
        clf = joblib.load(os.path.join(os.path.dirname(__file__), "logistic_model.joblib"))
    if not gemini_initialized:
        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        gemini_initialized = True

# ---------------------------
# Existing helper functions
# ---------------------------

def search_google(query, num_results=3):
    SEARCH_API_KEY = os.environ.get("SEARCH_API")
    CX = os.environ.get("ENGINE_ID")
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": SEARCH_API_KEY,
        "cx": CX,
        "q": query,
        "num": num_results
    }
    response = requests.get(url, params=params)
    data = response.json()
    urls = [item["link"] for item in data.get("items", [])]
    return urls

def scrape_urls(urls, max_pages=5, timeout=5):
    if isinstance(urls, str):
        urls = [urls]
    scraped_data = {}
    for url in urls[:max_pages]:
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            paragraphs = soup.find_all("p")
            text = "\n".join([p.get_text().strip() for p in paragraphs if p.get_text().strip() != ""])
            if text:
                scraped_data[url] = text
        except Exception as e:
            print(f"[ERROR] Failed to fetch {url}: {e}")
    return scraped_data

def predict_tfidf(text):
    vec = vectorizer.transform([text])
    pred = int(clf.predict(vec)[0])
    return pred

def predict_model(title="", text="", latestcontext="", type=1):
    if isinstance(latestcontext, dict):
        combined_context = "\n\n".join([f"Source: {url}\n{text[:1500]}" for url, text in latestcontext.items()])
    else:
        combined_context = str(latestcontext)

    prompt = f"""
You are an advanced fact-checking AI assistant.

### TASK:
Determine whether the following claim or article is **FAKE**, **REAL**, or **UNCERTAIN** by analyzing it
and comparing it with the retrieved web context.

---

{title+text}

---

### RETRIEVED WEB CONTEXT:
{combined_context}

---

### INSTRUCTIONS:
1. Use the retrieved context to support or refute the claim.
2. If the web context is incomplete, irrelevant, or contradictory, lower your confidence score.
3. Judge the text’s factuality based on:
   - factual alignment with retrieved articles
   - tone or emotional manipulation
   - credibility of likely sources
4. If you cannot decide confidently, output "UNCERTAIN" with a low probability.

---

### REQUIRED OUTPUT FORMAT:
Return only a **valid JSON** object with no extra text or formatting:

{{
  "prediction": "FAKE" | "REAL" | "UNCERTAIN",
  "probability": float (0–1),
  "metrics": {{
    "languageComplexity": float (0–1),
    "emotionalTone": float (0–1),
    "factualDensity": float (0–1),
    "sourceCredibility": float (0–1)
  }},
  "agreelinks": [list of URLs or domains that support the claim],
  "contradictlinks": [list of URLs or domains that refute the claim],
  "reason": "Short explanation (1–3 sentences) referring to the retrieved context where possible."
}}
"""

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    if raw_text.startswith("```json"):
        raw_text = raw_text[len("```json"):].strip()
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3].strip()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            cleaned = match.group(0)
            data = json.loads(cleaned)
        else:
            data = {
                "prediction": "UNCERTAIN",
                "probability": 0.5,
                "metrics": {},
                "agreelinks": [],
                "contradictlinks": [],
                "reason": "Failed to parse model output."
            }

    return data

# ---------------------------
# Main pipeline
# ---------------------------

def pipeline(title="", text="", input_type=""):
    init_models()  # lazy-load all models/LLM

    if input_type == "url":
        scraped_data = scrape_urls(text)
        combined_text = "\n\n".join(scraped_data.values())
        pred = predict_tfidf(combined_text)
        urls = search_google(combined_text)
        labelContext = scrape_urls(urls)
        data = predict_model(text=combined_text, latestcontext=labelContext)
    else:
        combined_input = title + text
        pred = predict_tfidf(combined_input)
        urls = search_google(title)
        labelContext = scrape_urls(urls)
        data = predict_model(title, text, labelContext)

    result = {
        "label": data.get("prediction", "UNCERTAIN"),
        "probability": data.get("probability", 0)*0.9 + pred*0.1,
        "metrics": data.get("metrics", {}),
        "agreelinks": data.get("agreelinks", []),
        "contradictlinks": data.get("contradictlinks", []),
        "reasoning": data.get("reason", "")
    }

    return result
