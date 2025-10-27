document.addEventListener('DOMContentLoaded', function () {
    const titleForm = document.getElementById('title-form');
    const rationaleForm = document.getElementById('rationale-form');
    const titlesOutput = document.getElementById('titles-output');
    const rationaleOutput = document.getElementById('rationale-output');
    const selectedTitleInput = document.getElementById('selected-title');

    titleForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const keywords = document.getElementById('keywords').value;
        titlesOutput.innerHTML = '<p>Generating titles...</p>';

        try {
            const response = await fetch('/api/generate/title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords: keywords.split(',') }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate titles.');
            }

            const data = await response.json();
            titlesOutput.innerHTML = '';
            data.titles.forEach(title => {
                const p = document.createElement('p');
                p.textContent = title;
                p.classList.add('title-option');
                p.onclick = () => {
                    selectedTitleInput.value = title;
                    document.querySelectorAll('.title-option').forEach(el => el.classList.remove('selected'));
                    p.classList.add('selected');
                };
                titlesOutput.appendChild(p);
            });

        } catch (error) {
            titlesOutput.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    rationaleForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const title = selectedTitleInput.value;
        if (!title) {
            rationaleOutput.innerHTML = '<p class="error">Please select a title first.</p>';
            return;
        }
        rationaleOutput.innerHTML = '<p>Generating rationale...</p>';

        try {
            const response = await fetch('/api/generate/rationale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate rationale.');
            }

            const data = await response.json();
            rationaleOutput.innerHTML = `<p>${data.rationale.replace(/\\n/g, '<br>')}</p>`;

        } catch (error) {
            rationaleOutput.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });
});
