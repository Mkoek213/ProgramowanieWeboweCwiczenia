const toggleButton = document.querySelector('#button');
const message = document.querySelector('#message');

if (toggleButton && message) {
  toggleButton.addEventListener('click', () => {
    const isHidden = message.classList.toggle('hide');
    message.classList.toggle('reveal', !isHidden);
  });
}