from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
import re

app = Flask(__name__)

# --- CONFIGURATION ---
try:
    # Configure the Gemini API key from environment variables
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    # Initialize the Gemini Pro model
    model = genai.GenerativeModel('gemini-1.0-pro')
except Exception as e:
    # If the API key is not set or there's an issue, the model will be None
    print(f"Error configuring Generative AI: {e}")
    model = None

# --- API ROUTES ---
@app.route('/api/generate/title', methods=['POST'])
def generate_title_api():
    if not model:
        return jsonify({'error': 'The AI model is not configured. Please set the GOOGLE_API_KEY.'}), 500

    if not request.json or 'keywords' not in request.json:
        return jsonify({'error': 'Missing keywords in request.'}), 400

    keywords = request.json['keywords']
    if not keywords or not isinstance(keywords, list) or len(keywords) == 0:
        return jsonify({'error': 'Please provide a list of keywords.'}), 400

    # Create a precise prompt for the AI
    prompt = f"Generate exactly 5 academic thesis titles for a study in the Philippines about: {', '.join(keywords)}. The titles should be formal and suitable for a university thesis. Return only a numbered list of the titles, with no introductory text, explanations, or conversational filler."

    try:
        response = model.generate_content(prompt)
        generated_text = response.text

        # Clean the AI's response to extract just the titles
        potential_titles = generated_text.split('\n')
        cleaned_titles = []
        for title in potential_titles:
            # Remove list markers (e.g., "1. ", "* ") and surrounding quotes
            cleaned_title = re.sub(r'^\s*\d+\.\s*|\*\s*', '', title).strip('\'"')
            # Ensure the title is a meaningful length
            if len(cleaned_title) > 20:
                 cleaned_titles.append(cleaned_title)

        if not cleaned_titles:
            return jsonify({'error': 'The AI returned an unexpected format. Please try again.'}), 500

        return jsonify({'titles': cleaned_titles})
    except Exception as e:
        print(f"Error during AI generation: {e}")
        return jsonify({'error': f'An error occurred while communicating with the AI: {e}'}), 500

@app.route('/api/generate/rationale', methods=['POST'])
def generate_rationale_api():
    if not model:
        return jsonify({'error': 'The AI model is not configured. Please set the GOOGLE_API_KEY.'}), 500

    if not request.json or 'title' not in request.json:
        return jsonify({'error': 'Missing title in request.'}), 400

    thesis_title = request.json['title']
    if not thesis_title:
        return jsonify({'error': 'Please provide a thesis title.'}), 400

    # Create a precise prompt for the AI
    prompt = f"Generate a compelling rationale for a thesis titled '{thesis_title}'. The rationale should be well-structured, academic in tone, and suitable for a Filipino university. Explain the problem, the gap in the current research, and the significance of the study. Return only the generated text for the rationale, with no introductory or conversational text."

    try:
        response = model.generate_content(prompt)
        # Check if the response was blocked for safety reasons
        if response.prompt_feedback.block_reason:
            return jsonify({'error': f'The request was blocked by the AI for safety reasons: {response.prompt_feedback.block_reason}. Please rephrase your title.'}), 400

        return jsonify({'rationale': response.text.strip()})
    except Exception as e:
        print(f"Error during AI generation: {e}")
        return jsonify({'error': f'An error occurred while communicating with the AI: {e}'}), 500

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
    # This allows the app to be run locally with `python app.py`
    app.run(debug=True)
