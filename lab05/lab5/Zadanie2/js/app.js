const toggleButton = document.querySelector('#button');
const message = document.querySelector('#message');

if (toggleButton && message) {
  toggleButton.addEventListener('click', () => {
    const isHidden = message.classList.contains('hide');

    if (isHidden) {
      message.classList.remove('hide');
      message.classList.add('reveal');
    } else {
      message.classList.remove('reveal');
      message.classList.add('hide');
    }
  });
}