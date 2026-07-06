document.addEventListener('DOMContentLoaded', () => {
    const ageGate = document.getElementById('age-gate');
    const btnYes = document.querySelector('.btn-yes');
    const btnNo = document.querySelector('.btn-no');

    // Check if age is already verified
    if (localStorage.getItem('age-verified') === 'true') {
        if (ageGate) ageGate.style.display = 'none';
    }

    if (btnYes) {
        btnYes.addEventListener('click', () => {
            localStorage.setItem('age-verified', 'true');
            ageGate.style.opacity = '0';
            setTimeout(() => {
                ageGate.style.display = 'none';
            }, 500);
        });
    }

    if (btnNo) {
        btnNo.addEventListener('click', () => {
            window.location.href = 'https://www.google.com';
        });
    }

    // Handle locked content clicks
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.querySelector('.locked')) {
                alert('This content is exclusive to Pro members. Please upgrade your plan to unlock.');
                const pricingSection = document.querySelector('.pricing');
                if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
