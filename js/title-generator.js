document.getElementById('title-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const keywordsInput = document.getElementById('keywords');
    const errorMessage = document.getElementById('error-message');
    const titlesOutput = document.getElementById('titles-output');

    errorMessage.textContent = '';
    titlesOutput.innerHTML = '';

    const keywordsStr = keywordsInput.value;
    if (!keywordsStr) {
        errorMessage.textContent = 'Please enter at least two keywords.';
        return;
    }

    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k);

    if (keywords.length < 2) {
        errorMessage.textContent = 'Please enter at least two keywords.';
        return;
    }

    const titles = [
        `The Impact of ${keywords[0]} on ${keywords[1]}`,
        `A Study of ${keywords[0]} and ${keywords[1]}`,
        `An Analysis of the Relationship between ${keywords[0]} and ${keywords[1]}`
    ];

    let outputHtml = '<h3>Suggested Titles:</h3><ul>';
    titles.forEach(title => {
        outputHtml += `<li>${title}</li>`;
    });
    outputHtml += '</ul>';

    titlesOutput.innerHTML = outputHtml;
});
