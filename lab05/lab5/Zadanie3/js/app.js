document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#button');
  const image = document.querySelector('img');

  if (!button || !image) {
    return;
  }

  const slides = [
    { src: '1.jpg', className: 'image1'},
    { src: '2.jpg', className: 'image2'},
    { src: '3.jpg', className: 'image3'}
  ];

  let currentIndex = 0;

  button.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    const { src, className, alt } = slides[currentIndex];

    image.src = src;
    image.alt = alt;
    image.className = className;
  });
});

