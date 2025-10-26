document.getElementById('title-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const keywordsInput = document.getElementById('keywords');
    const errorMessage = document.getElementById('error-message');
    const titlesOutput = document.getElementById('titles-output');
    const submitButton = this.querySelector('input[type="submit"]');

    errorMessage.textContent = '';
    titlesOutput.innerHTML = '<h3>Generating titles... Please wait.</h3>';
    submitButton.disabled = true;

    const keywordsStr = keywordsInput.value;
    if (!keywordsStr) {
        errorMessage.textContent = 'Please enter at least one keyword.';
        titlesOutput.innerHTML = '';
        submitButton.disabled = false;
        return;
    }

    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k);

    fetch('/api/generate/title', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keywords }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            errorMessage.textContent = data.error;
            titlesOutput.innerHTML = '';
        } else {
            let outputHtml = '<h3>Suggested Titles:</h3><ul>';
            data.titles.forEach(title => {
                outputHtml += `<li>${title}</li>`;
            });
            outputHtml += '</ul>';
            titlesOutput.innerHTML = outputHtml;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred while generating titles. Please try again.';
        titlesOutput.innerHTML = '';
    })
    .finally(() => {
        submitButton.disabled = false;
    });
});
