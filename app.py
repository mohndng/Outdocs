from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/title', methods=['GET', 'POST'])
def title():
    if request.method == 'POST':
        keywords_str = request.form['keywords']
        if not keywords_str:
            return render_template('title.html', error="Please enter at least two keywords.")

        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()]

        if len(keywords) < 2:
            return render_template('title.html', error="Please enter at least two keywords.")

        titles = [
            f"The Impact of {keywords[0]} on {keywords[1]}",
            f"A Study of {keywords[0]} and {keywords[1]}",
            f"An Analysis of the Relationship between {keywords[0]} and {keywords[1]}"
        ]
        return render_template('title.html', titles=titles)
    return render_template('title.html')

@app.route('/rationale')
def rationale():
    return render_template('rationale.html')

@app.route('/literature-review')
def literature_review():
    return render_template('literature_review.html')

@app.route('/methodology')
def methodology():
    return render_template('methodology.html')

@app.route('/statement-of-the-problem')
def statement_of_the_problem():
    return render_template('statement_of_the_problem.html')

@app.route('/scope-and-delimitation')
def scope_and_delimitation():
    return render_template('scope_and_delimitation.html')

@app.route('/significance-of-the-study')
def significance_of_the_study():
    return render_template('significance_of_the_study.html')

@app.route('/definition-of-terms')
def definition_of_terms():
    return render_template('definition_of_terms.html')

if __name__ == '__main__':
    app.run(debug=True)
