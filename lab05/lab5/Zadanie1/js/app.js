const askNameButton = document.querySelector('#ask-name');
const nameOutput = document.querySelector('#name-output');

if (askNameButton && nameOutput) {
  askNameButton.addEventListener('click', () => {
    const userName = window.prompt('Jak masz na imię?');

    if (userName === null) {
      return;
    }

    const trimmedName = userName.trim();

    nameOutput.textContent = trimmedName || 'Anonim';
  });
}

