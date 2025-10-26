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
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            errorMessage.textContent = data.error;
            rationaleOutput.value = '';
        } else {
            rationaleOutput.value = data.rationale;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred while generating the rationale. Please try again.';
        rationaleOutput.value = '';
    })
    .finally(() => {
        submitButton.disabled = false;
    });
});
