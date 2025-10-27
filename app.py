from flask import Flask, render_template, request, jsonify
import requests
import os
import re
import json

app = Flask(__name__)

# --- CONFIGURATION ---
GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent"

# --- HELPER FUNCTION ---
def call_gemini_api(prompt):
    """A helper function to make direct calls to the Gemini API."""
    if not GEMINI_API_KEY:
        return None, "The AI model is not configured. Please set the GOOGLE_API_KEY."

    headers = {'Content-Type': 'application/json'}
    params = {'key': GEMINI_API_KEY}
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }

    try:
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        data = response.json()

        # Check for safety blocks or empty candidates in the response
        if not data.get('candidates'):
            feedback = data.get('promptFeedback', {})
            block_reason = feedback.get('blockReason', 'Unknown reason')
            return None, f"The AI response was blocked. Reason: {block_reason}. Please try rephrasing your input."

        return data, None
    except requests.exceptions.HTTPError as http_err:
        # Extract the specific error message from Google's response if possible
        error_details = response.json().get('error', {}).get('message', str(http_err))
        return None, f"API Error: {error_details}"
    except Exception as e:
        return None, f"An unexpected error occurred: {e}"

# --- API ROUTES ---
@app.route('/api/generate/title', methods=['POST'])
def generate_title_api():
    if not request.json or 'keywords' not in request.json:
        return jsonify({'error': 'Missing keywords in request.'}), 400

    keywords = request.json['keywords']
    if not keywords or not isinstance(keywords, list) or len(keywords) == 0:
        return jsonify({'error': 'Please provide a list of keywords.'}), 400

    prompt = f"Generate exactly 5 academic thesis titles for a study in the Philippines about: {', '.join(keywords)}. The titles should be formal and suitable for a university thesis. Return only a numbered list of the titles, with no introductory text, explanations, or conversational filler."

    data, error = call_gemini_api(prompt)
    if error:
        return jsonify({'error': error}), 500

    try:
        generated_text = data['candidates'][0]['content']['parts'][0]['text']
        potential_titles = generated_text.split('\n')
        cleaned_titles = []
        for title in potential_titles:
            cleaned_title = re.sub(r'^\s*\d+\.\s*|\*\s*', '', title).strip('\'"')
            if len(cleaned_title) > 20:
                 cleaned_titles.append(cleaned_title)

        if not cleaned_titles:
            return jsonify({'error': 'The AI returned an unexpected format. Please try again.'}), 500

        return jsonify({'titles': cleaned_titles})
    except (KeyError, IndexError) as e:
        return jsonify({'error': f'Failed to parse the AI response: {e}'}), 500

@app.route('/api/generate/rationale', methods=['POST'])
def generate_rationale_api():
    if not request.json or 'title' not in request.json:
        return jsonify({'error': 'Missing title in request.'}), 400

    thesis_title = request.json['title']
    if not thesis_title:
        return jsonify({'error': 'Please provide a thesis title.'}), 400

    prompt = f"Generate a compelling rationale for a thesis titled '{thesis_title}'. The rationale should be well-structured, academic in tone, and suitable for a Filipino university. Explain the problem, the gap in the current research, and the significance of the study. Return only the generated text for the rationale, with no introductory or conversational text."

    data, error = call_gemini_api(prompt)
    if error:
        return jsonify({'error': error}), 500

    try:
        generated_text = data['candidates'][0]['content']['parts'][0]['text']
        return jsonify({'rationale': generated_text.strip()})
    except (KeyError, IndexError) as e:
        return jsonify({'error': f'Failed to parse the AI response: {e}'}), 500

# --- FRONTEND ROUTES ---
@app.route('/')
def index():
    """Serves the main page."""
    return render_template('index.html')

@app.route('/about')
def about():
    """Serves the about page."""
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)
