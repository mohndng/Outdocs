document.getElementById('rationale-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const titleInput = document.getElementById('thesis-title');
    const errorMessage = document.getElementById('error-message');
    const rationaleOutput = document.getElementById('rationale-output');
    const submitButton = this.querySelector('input[type="submit"]');

    errorMessage.textContent = '';
    rationaleOutput.value = 'Generating rationale... Please wait.';
    submitButton.disabled = true;

    const thesisTitle = titleInput.value;
    if (!thesisTitle) {
        errorMessage.textContent = 'Please enter a thesis title.';
        rationaleOutput.value = '';
        submitButton.disabled = false;
        return;
    }

    fetch('/api/generate/rationale', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: thesisTitle }),
    })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
        if (!ok) {
            // Handle HTTP errors with a specific message from the server
            errorMessage.textContent = data.error || 'An unknown error occurred.';
            rationaleOutput.value = '';
        } else if (data.error) {
            // Handle application-specific errors
            errorMessage.textContent = data.error;
            rationaleOutput.value = '';
        } else {
            rationaleOutput.value = data.rationale;
        }
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        errorMessage.textContent = 'A network error occurred. Please try again.';
        rationaleOutput.value = '';
    })
    .finally(() => {
        submitButton.disabled = false;
    });
});
