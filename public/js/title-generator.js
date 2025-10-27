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
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
        if (!ok) {
            // Handle HTTP errors with a specific message from the server
            errorMessage.textContent = data.error || 'An unknown error occurred.';
            titlesOutput.innerHTML = '';
        } else if (data.error) {
            // Handle application-specific errors
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
        console.error('Fetch Error:', error);
        errorMessage.textContent = 'A network error occurred. Please try again.';
        titlesOutput.innerHTML = '';
    })
    .finally(() => {
        submitButton.disabled = false;
    });
});
