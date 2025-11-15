(() => {
    const CLIENT_ID = 'Mm89kvfEqSoVo6z1CfDD_M7wq6-y7t65zTcZAYZJV3U';
    const API_ENDPOINT = 'https://api.unsplash.com/search/photos';

    let queryText = '';
    let pageNum = 1;
    let imagesStore = [];
    let offset = 0;

    const IMAGES_PER_REQUEST = 30;
    const VISIBLE_COUNT = 8;

    const el = {
        input: document.getElementById('searchInput'),
        btnSearch: document.getElementById('searchBtn'),
        gallery: document.getElementById('gallery'),
        prev: document.getElementById('prevBtn'),
        next: document.getElementById('nextBtn'),
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightboxImg'),
        close: document.getElementById('closeBtn'),
        info: document.getElementById('imageInfo')
    };

    async function fetchPhotos(q, page = 1) {
        const params = new URLSearchParams({
            query: q,
            per_page: String(IMAGES_PER_REQUEST),
            page: String(page),
            client_id: CLIENT_ID
        });

        try {
            const res = await fetch(`${API_ENDPOINT}?${params.toString()}`);
            if (!res.ok) throw new Error('Network response was not OK');
            const payload = await res.json();
            return Array.isArray(payload.results) ? payload.results : [];
        } catch (err) {
            console.error('fetchPhotos error:', err);
            showMessage('Błąd pobierania zdjęć. Sprawdź API key i połączenie.');
            return [];
        }
    }

    function showMessage(text, isError = false) {
        el.gallery.innerHTML = `<div class="${isError ? 'error' : 'loading'}">${text}</div>`;
    }

    async function performSearch() {
        const q = el.input.value.trim();
        if (!q) return;

        queryText = q;
        pageNum = 1;
        offset = 0;
        imagesStore = [];

        if (!CLIENT_ID || CLIENT_ID === 'YOUR_UNSPLASH_CLIENT_ID') {
            showMessage('Brak API key! Zobacz README.md', true);
            return;
        }

        showMessage('Ładowanie...');
        const results = await fetchPhotos(queryText, pageNum);
        imagesStore = results.slice();
        renderGallery();
        updateControls();
    }

    function renderGallery() {
        el.gallery.innerHTML = '';

        if (!imagesStore.length) {
            showMessage('Nie znaleziono zdjęć', true);
            return;
        }

        const end = Math.min(offset + VISIBLE_COUNT, imagesStore.length);

        for (let i = offset; i < end; i++) {
            const imgData = imagesStore[i];
            const wrapper = document.createElement('div');
            wrapper.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = imgData.urls.small;
            img.alt = imgData.alt_description || 'Unsplash image';
            img.loading = 'lazy';

            wrapper.addEventListener('dblclick', () => openLightbox(imgData));

            wrapper.appendChild(img);
            el.gallery.appendChild(wrapper);
        }
    }

    function openLightbox(photo) {
        el.lightboxImg.src = photo.urls.regular;
        el.info.innerHTML = `Photo by <strong>${photo.user.name}</strong><br>Image ${imagesStore.indexOf(photo) + 1} of ${imagesStore.length}`;
        el.lightbox.classList.add('active');
        el.lightbox.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
        el.lightbox.classList.remove('active');
        el.lightbox.setAttribute('aria-hidden', 'true');
        el.lightboxImg.src = '';
    }

    async function next() {
        if (offset + VISIBLE_COUNT >= imagesStore.length) {
            pageNum++;
            const more = await fetchPhotos(queryText, pageNum);
            if (more.length) imagesStore = imagesStore.concat(more);
        }

        if (offset + 1 < imagesStore.length) {
            offset++;
            renderGallery();
            updateControls();
        }
    }

    function prev() {
        if (offset > 0) {
            offset--;
            renderGallery();
            updateControls();
        }
    }

    function updateControls() {
        el.prev.disabled = offset === 0;
        const noMoreLoaded = offset + VISIBLE_COUNT >= imagesStore.length;
        const couldRequestMore = imagesStore.length >= IMAGES_PER_REQUEST * pageNum;
        el.next.disabled = noMoreLoaded && !couldRequestMore;
    }

    el.btnSearch.addEventListener('click', performSearch);
    el.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(); });
    el.prev.addEventListener('click', prev);
    el.next.addEventListener('click', next);

    el.close.addEventListener('click', closeLightbox);
    el.lightbox.addEventListener('click', (e) => { if (e.target === el.lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.lightbox.classList.contains('active')) closeLightbox(); });

})();

