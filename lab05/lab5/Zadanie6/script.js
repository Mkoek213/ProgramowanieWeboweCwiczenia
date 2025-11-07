
const names = ['Grzegorz', 'Wiktoria', 'Mateusz', 'Ania', 'Sandra', 'Kasia', 'Izabela', 'Weronika'];

let  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 8, 9];


const countries = [
    { name: 'Nigeria', continent: 'Africa'},
    { name: 'Nepal', continent: 'Asia'},
    { name: 'Angola', continent: 'Africa'},
    { name: 'Poland', continent: 'Europe'},
    { name: 'Kenya', continent: 'Africa'},
    { name: 'Greece', continent: 'Europe'},
	{ name: 'France', continent: 'Europe'},
	{ name: 'China', continent: 'Asia'}
]

let people = [
    {"id":123, "name":"Rick Deckard", "email":"rick@bladerunner.org"},
    {"id":456, "name":"Roy Batty", "email":"roy@replicant.io"},
    {"id":789, "name":"J.F. Sebastian", "email":"j.f@tyler.com"},
    {"id":258, "name":"Pris", "email":"pris@replicant.io"}
];

let duplicateName = ['John', 'Paul', 'George', 'Ringo', 'Paul', 'Paul', 'Ringo'];

// Funkcja pomocnicza do wypisywania wyników na stronie
const renderSection = (title, items) => {
  const app = document.querySelector('#app');

  if (!app) {
    return;
  }

  const section = document.createElement('li');
  const heading = document.createElement('h2');
  heading.textContent = title;
  section.append(heading);

  const list = document.createElement('ul');
  list.classList.add('section-list');

  items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    list.append(listItem);
  });

  section.append(list);
  app.append(section);
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Na stronach internetowych wyświetlają się nazwy zawierające znak "r". (tablica names)
  const namesWithR = names.filter((name) => name.toLowerCase().includes('r'));
  renderSection('1. Imiona zawierające literę "r"', namesWithR);

  // 2. Operacje na tablicy numbers
  //    sprawdź czy tablica zawiera tylko elementy mniejsze niż 9
  //    sprawdź, czy tablica zawiera jakieś elementy mniejsze niż 6
  //    inkrementuj wszystkie elementy w tablicy numbers i utwórz tablicę tylko z nieparzystymi wartościami
  //    oblicz sumę wszystkich elementów
  const allLessThanNine = numbers.every((number) => number < 9);
  const anyLessThanSix = numbers.some((number) => number < 6);
  const incrementedNumbers = numbers.map((number) => number + 1);
  const oddNumbers = incrementedNumbers.filter((number) => number % 2 !== 0);
  const sumOfNumbers = incrementedNumbers.reduce((total, number) => total + number, 0);

  renderSection('2. Operacje na liczbach', [
    `Wszystkie elementy mniejsze niż 9: ${allLessThanNine ? 'tak' : 'nie'}`,
    `Czy jest element mniejszy niż 6: ${anyLessThanSix ? 'tak' : 'nie'}`,
    `Tablica po inkrementacji: ${incrementedNumbers.join(', ')}`,
    `Tylko liczby nieparzyste: ${oddNumbers.join(', ')}`,
    `Suma elementów: ${sumOfNumbers}`
  ]);

  // 3. Na stronie wyświetlają się kraje z Europy
  const europeanCountries = countries
    .filter((country) => country.continent === 'Europe')
    .map((country) => country.name);

  renderSection('3. Kraje z Europy', europeanCountries);

  // 4. Znajdź nazwiska wszystkich osób, które mają e-maile „replicant.io”
  const replicantNames = people
    .filter((person) => person.email.endsWith('replicant.io'))
    .map((person) => person.name);

  renderSection('4. Osoby z domeną replicant.io', replicantNames);

  // 5. Usuwanie zduplikowanych wartości z tablicy duplicateName
  const uniqueNames = [...new Set(duplicateName)];
  renderSection('5. Unikalne imiona', uniqueNames);
});