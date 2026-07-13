const API_URL = "https://model-site-alpha.vercel.app";
document.addEventListener('DOMContentLoaded', () => {
    const ageGate = document.getElementById('age-gate');
    const btnYes = document.querySelector('.btn-yes') || document.querySelector('#age-gate button');
    const btnNo = document.querySelector('.btn-no');

    if (localStorage.getItem('age-verified') === 'true' && ageGate) {
        ageGate.style.display = 'none';
    }

    btnYes?.addEventListener('click', () => {
        localStorage.setItem('age-verified', 'true');
        ageGate.style.display = 'none';
    });

    btnNo?.addEventListener('click', () => {
        window.location.href = 'https://www.google.com';
    });

    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.querySelector('.locked')) {
                document.querySelector('.pricing')?.scrollIntoView({behavior:'smooth'});
            }
        });
    });

    document.querySelectorAll('.pricing .card button').forEach(button => {
        button.addEventListener('click', async () => {
            if (!button.textContent.includes('Upgrade') && !button.textContent.includes('Elite')) return;

            const response = await fetch(`${API_URL}/api/paypal/create-subscription`, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({plan: button.textContent})
            });

            const data = await response.json();
            if (data.approval_url) window.location.href = data.approval_url;
        });
    });
});
