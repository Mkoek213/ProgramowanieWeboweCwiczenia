const CLIENT_ID = "sDD6DO6Qrd5kCfVv8ciltWfVP40aZAAl4vCra9JpOYw";

const API_URL = 'https://api.unsplash.com/search/photos';

let currentQuery = '';
let currentPage = 1;
let allImages = [];
let currentOffset = 0;
const imagesPerPage = 30;
const visibleImages = 8;

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const gallery = document.getElementById('gallery');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeBtn');
const imageInfo = document.getElementById('imageInfo');

async function searchImages(query, page = 1) {
    try {
        const response = await fetch(
            `${API_URL}?query=${query}&per_page=${imagesPerPage}&page=${page}&client_id=${CLIENT_ID}`
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching images:', error);
        gallery.innerHTML = '<div class="error">Błąd pobierania zdjęć. Sprawdź API key.</div>';
        return [];
    }
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    if (CLIENT_ID === 'YOUR_UNSPLASH_CLIENT_ID') {
        gallery.innerHTML = '<div class="error">Brak API key! Zobacz README.md</div>';
        return;
    }
    
    currentQuery = query;
    currentPage = 1;
    currentOffset = 0;
    allImages = [];
    
    gallery.innerHTML = '<div class="loading">Ładowanie...</div>';
    
    const images = await searchImages(query, currentPage);
    allImages = images;
    
    renderGallery();
    updateButtons();
}

function renderGallery() {
    gallery.innerHTML = '';
    
    if (allImages.length === 0) {
        gallery.innerHTML = '<div class="error">Nie znaleziono zdjęć</div>';
        return;
    }
    
    const endIndex = Math.min(currentOffset + visibleImages, allImages.length);
    
    for (let i = currentOffset; i < endIndex; i++) {
        const image = allImages[i];
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = image.urls.small;
        img.alt = image.alt_description || 'Unsplash image';
        img.loading = 'lazy';
        
        item.addEventListener('dblclick', () => {
            openLightbox(image);
        });
        
        item.appendChild(img);
        gallery.appendChild(item);
    }
}

function openLightbox(image) {
    lightboxImg.src = image.urls.regular;
    imageInfo.innerHTML = `
        Photo by <strong>${image.user.name}</strong><br>
        Image ${allImages.indexOf(image) + 1} of ${allImages.length}
    `;
    lightbox.classList.add('active');
}

function closeLightbox() {
    lightbox.classList.remove('active');
}

async function scrollNext() {
    if (currentOffset + visibleImages >= allImages.length) {
        currentPage++;
        const newImages = await searchImages(currentQuery, currentPage);
        
        if (newImages.length > 0) {
            allImages = [...allImages, ...newImages];
        }
    }
    
    if (currentOffset + 1 < allImages.length) {
        currentOffset++;
        renderGallery();
        updateButtons();
    }
}

function scrollPrev() {
    if (currentOffset > 0) {
        currentOffset--;
        renderGallery();
        updateButtons();
    }
}

function updateButtons() {
    prevBtn.disabled = currentOffset === 0;
    nextBtn.disabled = currentOffset + visibleImages >= allImages.length && allImages.length < imagesPerPage * currentPage;
}

searchBtn.addEventListener('click', performSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

prevBtn.addEventListener('click', scrollPrev);
nextBtn.addEventListener('click', scrollNext);

closeBtn.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

gallery.innerHTML = '<div class="loading">Wpisz słowo kluczowe i naciśnij Enter</div>';

