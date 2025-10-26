from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
import re

app = Flask(__name__)

# Configure the Gemini API key
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    model = genai.GenerativeModel('models/gemini-pro-latest')
except Exception as e:
    print(f"Error configuring Generative AI: {e}")
    model = None

@app.route('/api/generate/title', methods=['POST'])
def generate_title_api():
    if not model:
        return jsonify({'error': 'Generative AI model not configured.'}), 500

    if not request.json or 'keywords' not in request.json:
        return jsonify({'error': 'Missing keywords'}), 400

    keywords = request.json['keywords']

    if not keywords or len(keywords) == 0:
        return jsonify({'error': 'Please provide at least one keyword.'}), 400

    # Create a prompt for the AI
    prompt = f"Generate exactly 5 academic thesis titles for a study in the Philippines about: {', '.join(keywords)}. The titles should be formal and suitable for a university thesis. Return only a numbered list of the titles, with no introductory text, explanations, or conversational filler."

    try:
        response = model.generate_content(prompt)
        # Assuming the response text contains a list of titles, separated by newlines.
        # We'll need to parse this.
        generated_text = response.text
        # Split by newline and filter for lines that seem to be titles (e.g., start with a number or are not just conversational)
        potential_titles = [line.strip() for line in generated_text.split('\n') if line.strip()]

        # Further clean the titles to remove numbering, asterisks, and quotes
        cleaned_titles = []
        for title in potential_titles:
            # Remove common list markers like "1. ", "* ", etc.
            cleaned_title = re.sub(r'^\s*\d+\.\s*|\*\s*', '', title)
            # Remove surrounding quotes
            cleaned_title = cleaned_title.strip('\'"')
            # A simple heuristic: if it's a reasonably long sentence, it's probably a title.
            if len(cleaned_title) > 20:
                 cleaned_titles.append(cleaned_title)

        # If after cleaning we have no titles, it might be an error or unexpected format.
        if not cleaned_titles:
            return jsonify({'error': 'Could not parse titles from the AI response.'}), 500

        return jsonify({'titles': cleaned_titles})
    except Exception as e:
        print(f"Error during AI generation: {e}")
        return jsonify({'error': 'Failed to generate titles from AI.'}), 500


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/title')
def title():
    return render_template('title.html')

@app.route('/rationale')
def rationale():
    return render_template('rationale.html')

@app.route('/statement-of-the-problem')
def statement_of_the_problem():
    return render_template('statement_of_the_problem.html')

@app.route('/scope-and-delimitation')
def scope_and_delimitation():
    return render_template('scope_and_delimitation.html')

@app.route('/significance-of-the-study')
def significance_of_the_study():
    return render_template('significance_of_the_study.html')

@app.route('/literature-review')
def literature_review():
    return render_template('literature_review.html')

@app.route('/methodology')
def methodology():
    return render_template('methodology.html')

@app.route('/definition-of-terms')
def definition_of_terms():
    return render_template('definition_of_terms.html')

if __name__ == '__main__':
    app.run(debug=True)
