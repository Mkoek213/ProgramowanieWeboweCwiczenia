const USERS_URL = 'user.json';

const createContactDetails = (user) => {
  const details = document.createElement('p');
  details.className = 'contact-details hidden';
  details.innerHTML = `
    <span>Ulica: ${user.Address?.Street ?? 'brak danych'}</span>
    <span>Miasto: ${user.Address?.City ?? 'brak danych'}</span>
    <span>Kraj: ${user.Address?.Country ?? user.Address?.State ?? 'brak danych'}</span>
    <span>Email: <a href="mailto:${user.email}">${user.email}</a></span>
    <span>Telefon: <a href="tel:${user.phone}">${user.phone}</a></span>
  `;

  return details;
};

const createUserCard = (user) => {
  const card = document.createElement('article');
  card.className = 'user-card';

  const header = document.createElement('div');
  header.className = 'user-header';

  const name = document.createElement('h2');
  name.className = 'user-name';
  name.textContent = `${user.firstName} ${user.lastName}`;

  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'toggle';
  toggleLabel.textContent = 'Pokaż dane kontaktowe';

  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.setAttribute('aria-label', 'Pokaż dane kontaktowe');

  toggleLabel.prepend(toggleInput);

  header.append(name, toggleLabel);
  card.append(header);

  const contactDetails = createContactDetails(user);
  card.append(contactDetails);

  toggleInput.addEventListener('change', () => {
    const show = toggleInput.checked;

    toggleLabel.lastChild.textContent = show
      ? 'Ukryj dane kontaktowe'
      : 'Pokaż dane kontaktowe';

    contactDetails.classList.toggle('hidden', !show);
  });

  return card;
};

const renderUsers = (users) => {
  const container = document.querySelector('#users');

  if (!container) {
    return;
  }

  users.forEach((user) => {
    const card = createUserCard(user);
    container.append(card);
  });
};

const loadUsers = async () => {
  try {
    const response = await fetch(USERS_URL);

    if (!response.ok) {
      throw new Error(`Nie udało się pobrać użytkowników: ${response.status}`);
    }

    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
});

