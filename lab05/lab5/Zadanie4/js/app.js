const addButton = document.querySelector('#add-button');
const removeButton = document.querySelector('#remove-button');
const input = document.querySelector('#item-input');
const list = document.querySelector('#items');

const createListItem = (value) => {
  const li = document.createElement('li');
  li.textContent = value;
  return li;
};

if (addButton && removeButton && input && list) {
  addButton.addEventListener('click', () => {
    const value = input.value.trim();

    if (!value) {
      input.focus();
      return;
    }

    const newItem = createListItem(value);
    list.append(newItem);
    input.value = '';
    input.focus();
  });

  removeButton.addEventListener('click', () => {
    const firstItem = list.querySelector('li');

    if (firstItem) {
      firstItem.remove();
    }

    input.focus();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addButton.click();
    }
  });
}

