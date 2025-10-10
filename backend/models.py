import joblib
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re
import requests
from bs4 import BeautifulSoup
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SEARCH_API_KEY = os.getenv("SEARCH_API")
CX = os.getenv("ENGINE_ID")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

# Load models
vectorizer = joblib.load("tfidf_vectorizer.joblib")
clf = joblib.load("logistic_model.joblib")

def pipeline(title, text):
    pred = predict_tfidf(title+text)
    data = predict_model(text)

    # Combine TF-IDF word scores with LLM verdict
    result = {
        "label": data.get("prediction", "UNCERTAIN"),
        "probability": data.get("probability", 0)*0.9 + pred*0.1,
        "metrics": data.get("metrics", {}),
        "agreelinks": data.get("agreelinks"),
        "contradictlnks":data.get("contradictlnks"),
        "reasoning": data.get("reason"),
    }

    return result

def search_google(query, num_results=3):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": SEARCH_API_KEY,
        "cx": CX,   
        "q": query,
        "num": num_results
    }
    response = requests.get(url, params=params)
    data = response.json()
    
    # Extract URLs from results
    urls = [item["link"] for item in data.get("items", [])]
    return urls

def scrape_urls(urls, max_pages=5, timeout=5):
    """
    Returns:
        dict: Dictionary where keys are URLs and values are scraped text.
    """
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
            else:
                print(f"[WARNING] No content found at {url}")

        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to fetch {url}: {e}")
        except Exception as e:
            print(f"[ERROR] Failed to scrape {url}: {e}")

    return scraped_data

def predict_tfidf(text):
    vec = vectorizer.transform([text])
    pred = int(clf.predict(vec)[0])
    return pred

def predict_model(title, text, latestcontext):
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
    return data