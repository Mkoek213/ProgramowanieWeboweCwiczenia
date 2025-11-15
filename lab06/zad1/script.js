class MultiStepForm {
    constructor() {
        this.currentStep = 1;
        this.formData = {};

        this.formSteps = document.querySelectorAll('.form-step');
        this.stepIndicators = document.querySelectorAll('.step');
        this.submitButton = document.querySelector('.btn-submit');
        this.summaryStep = document.querySelector('.summary-step');
        this.allInputs = document.querySelectorAll('input');

        this.handleInput = this.handleInput.bind(this);
        this.handleNavClick = this.handleNavClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    init() {
        this.allInputs.forEach(input => {
            input.addEventListener('input', this.handleInput);
        });

        document.body.addEventListener('click', this.handleNavClick);

        if (this.submitButton) {
            this.submitButton.addEventListener('click', this.handleSubmit);
        }

        this.showStep(this.currentStep);
        this.updateStepIndicators();
        this.updateButtonStates();
    }

    handleInput(e) {
        this.validateInput(e.target);
        this.updateButtonStates();
    }

    handleNavClick(e) {
        if (e.target.classList.contains('btn-next')) {
            this.nextStep();
        } else if (e.target.classList.contains('btn-prev')) {
            this.prevStep();
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.showSummary();
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateStepIndicators();
            this.updateButtonStates();
        }
    }

    prevStep() {
        this.currentStep--;
        this.showStep(this.currentStep);
        this.updateStepIndicators();
        this.updateButtonStates();
    }

    showStep(step) {
        this.formSteps.forEach(formStep => {
            formStep.classList.remove('active');
        });
        
        const targetStep = document.querySelector(`.form-step[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }

    updateStepIndicators() {
        this.stepIndicators.forEach(indicator => {
            const stepNum = parseInt(indicator.getAttribute('data-step'));
            if (stepNum <= this.currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = false;

        if (!value) {
            input.classList.remove('valid', 'invalid');
            return false;
        }

        switch (input.type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case 'tel':
                isValid = /^\d{9,15}$/.test(value.replace(/\s/g, ''));
                break;
            case 'date':
                isValid = value !== '';
                break;
            case 'password':
                isValid = value.length >= 6;
                break;
            case 'text':
                if (input.id === 'pesel') {
                    isValid = /^\d{11}$/.test(value);
                } else {
                    isValid = value.length >= 2;
                }
                break;
            default:
                isValid = value !== '';
        }

        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
        return isValid;
    }

    validateCurrentStep() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentFormStep.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    updateButtonStates() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentFormStep) return;

        const nextButton = currentFormStep.querySelector('.btn-next');
        const submitBtn = currentFormStep.querySelector('.btn-submit');
        
        const isStepValid = this.validateCurrentStep();

        if (nextButton) {
            nextButton.disabled = !isStepValid;
        }
        
        if (submitBtn) {
            submitBtn.disabled = !isStepValid;
        }
    }

    saveCurrentStepData() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentFormStep.querySelectorAll('input');
        
        inputs.forEach(input => {
            this.formData[input.name] = input.value;
        });
    }

    showSummary() {
        document.getElementById('summary-imie').textContent = this.formData.imie || '';
        document.getElementById('summary-nazwisko').textContent = this.formData.nazwisko || '';
        document.getElementById('summary-email').textContent = this.formData.email || '';
        document.getElementById('summary-phone').textContent = this.formData.phone || '';
        document.getElementById('summary-haslo').textContent = '*** ukryte ***';
        document.getElementById('summary-data').textContent = this.formData.data || '';
        document.getElementById('summary-adres').textContent = this.formData.adres || '';
        document.getElementById('summary-pesel').textContent = this.formData.pesel || '';

        this.formSteps.forEach(step => step.classList.remove('active'));
        
        if (this.summaryStep) {
            this.summaryStep.classList.add('active');
        }

        this.stepIndicators.forEach(indicator => {
            indicator.classList.add('active');
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = new MultiStepForm();
    form.init();
});