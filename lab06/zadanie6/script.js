(() => {
    const passwordInput = document.getElementById('passwordInput');
    const toggleBtn = document.getElementById('toggleVisibility');
    const eyeIcon = document.getElementById('eyeIcon');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const bgLayer = document.getElementById('bgLayer');
    const requirementsList = document.getElementById('requirementsList');

    let isPasswordVisible = false;


    toggleBtn.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        eyeIcon.src = isPasswordVisible ? 'img/eye_open.png' : 'img/eye_closed.png';
        eyeIcon.alt = isPasswordVisible ? 'Ukryj hasło' : 'Pokaż hasło';
    });

    const validators = {
        length: (pwd) => pwd.length >= 8,
        uppercase: (pwd) => /[A-Z]/.test(pwd),
        digit: (pwd) => /\d/.test(pwd),
        special: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
        noRepeat: (pwd) => {
            for (let i = 0; i < pwd.length - 2; i++) {
                if (pwd[i] === pwd[i + 1] && pwd[i] === pwd[i + 2]) {
                    return false;
                }
            }
            return true;
        },
        noSequence: (pwd) => {
            for (let i = 0; i < pwd.length - 2; i++) {
                const char1 = pwd.charCodeAt(i);
                const char2 = pwd.charCodeAt(i + 1);
                const char3 = pwd.charCodeAt(i + 2);

                if (char2 === char1 + 1 && char3 === char2 + 1) {
                    return false;
                }

                if (char2 === char1 - 1 && char3 === char2 - 1) {
                    return false;
                }
            }
            return true;
        }
    };

    function updateRequirements(password) {
        const requirements = requirementsList.querySelectorAll('li');
        const results = {};

        requirements.forEach(li => {
            const reqType = li.getAttribute('data-requirement');
            const isMet = validators[reqType](password);
            results[reqType] = isMet;

            const icon = li.querySelector('.requirement-icon');

            if (isMet) {
                li.classList.add('met');
                icon.src = 'img/ok.png';
                icon.alt = 'Spełnione';
            } else {
                li.classList.remove('met');
                icon.src = 'img/wrong.png';
                icon.alt = 'Nie spełnione';
            }
        });

        return results;
    }

    function calculateStrength(password, requirements) {
        if (!password) return 0;

        const metCount = Object.values(requirements).filter(Boolean).length;
        const totalCount = Object.keys(requirements).length;

        return metCount / totalCount;
    }

    function updateStrengthUI(strength, password) {
        strengthBar.className = 'strength-bar';
        strengthText.className = 'strength-text';

        if (!password) {
            strengthText.textContent = 'Wprowadź hasło';
            bgLayer.className = 'background-layer blur-high';
            return;
        }

        if (strength < 0.5) {
            strengthBar.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Hasło słabe';
            bgLayer.className = 'background-layer blur-high';
        } else if (strength < 1.0) {
            strengthBar.classList.add('medium');
            strengthText.classList.add('medium');
            strengthText.textContent = 'Hasło średnie';
            bgLayer.className = 'background-layer blur-medium';
        } else {
            strengthBar.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Hasło silne';
            bgLayer.className = 'background-layer blur-none';
        }
    }

    function evaluatePassword() {
        const password = passwordInput.value;
        const requirements = updateRequirements(password);
        const strength = calculateStrength(password, requirements);
        updateStrengthUI(strength, password);
    }

    passwordInput.addEventListener('input', evaluatePassword);

    updateStrengthUI(0, '');
})();
