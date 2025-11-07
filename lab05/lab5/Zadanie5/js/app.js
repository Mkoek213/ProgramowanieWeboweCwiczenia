const testButton = document.querySelector('#Button1');
const addHandlerButton = document.querySelector('#Button2');
const removeHandlerButton = document.querySelector('#Button3');
const counterOutput = document.querySelector('#counter');
const alertToggle = document.querySelector('#enable-second-function');

let counter = 0;
let isIncrementAttached = false;
let isAlertAttached = false;

const updateCounter = () => {
  if (counterOutput) {
    counterOutput.textContent = `Licznik: ${counter}`;
  }
};

const incrementCounter = () => {
  counter += 1;
  updateCounter();
};

const showAlert = () => {
  window.alert('Dziala');
};

const attachIncrementIfNeeded = () => {
  if (!testButton || isIncrementAttached) {
    return;
  }

  testButton.addEventListener('click', incrementCounter);
  isIncrementAttached = true;
};

const detachIncrement = () => {
  if (!testButton || !isIncrementAttached) {
    return;
  }

  testButton.removeEventListener('click', incrementCounter);
  isIncrementAttached = false;
};

const attachAlertIfNeeded = () => {
  if (!testButton || isAlertAttached) {
    return;
  }

  testButton.addEventListener('click', showAlert);
  isAlertAttached = true;
};

const detachAlert = () => {
  if (!testButton || !isAlertAttached) {
    return;
  }

  testButton.removeEventListener('click', showAlert);
  isAlertAttached = false;
};

const resetCounter = () => {
  counter = 0;
  updateCounter();
};

if (addHandlerButton) {
  addHandlerButton.addEventListener('click', () => {
    attachIncrementIfNeeded();

    if (alertToggle?.checked) {
      attachAlertIfNeeded();
    }
  });
}

if (removeHandlerButton) {
  removeHandlerButton.addEventListener('click', () => {
    detachIncrement();
    detachAlert();
    resetCounter();
  });
}

if (alertToggle) {
  alertToggle.addEventListener('change', (event) => {
    const checkbox = event.target;

    if (checkbox.checked) {
      if (isIncrementAttached) {
        attachAlertIfNeeded();
      }
    } else {
      detachAlert();
    }
  });
}

updateCounter();

