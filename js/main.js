/**
 * CineMax — main.js
 * jQuery logic: fetch, filter, render, pagination, modal
 */

$(document).ready(function () {

    /* ─────────────────────────────────────────────
       CONSTANTS & STATE
    ───────────────────────────────────────────── */
    const BASE_URL = 'https://api.imdbapi.dev/titles';
    const GENRES   = ['Action','Drama','Comedy','Sci-Fi','Fantasy','Romance','Thriller','Horror','Animation','Documentary','Crime'];
    const PER_PAGE = 12;

    let allData      = [];
    let filteredData = [];
    let currentPage  = 1;
    let currentType  = 'all';   // 'all' | 'movie' | 'tvSeries'
    let currentGenre = 'all';
    let currentSort  = 'rating';

    /* ─────────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────────── */
    function getRating(item) {
        return (item.rating && item.rating.aggregateRating)
            ? parseFloat(item.rating.aggregateRating) : 0;
    }

    function typeLabel(type) {
        const map = {
            movie: 'Film', tvMovie: 'TV Movie',
            tvSeries: 'TV Series', tvMiniSeries: 'TV Series',
            tvShort: 'TV Short', videoGame: 'Game',
            short: 'Short', video: 'Video'
        };
        return map[type] || (type ? type : 'Unknown');
    }

    function typeClass(type) {
        return (type === 'movie' || type === 'tvMovie') ? 'movie' : 'tv';
    }

    function sortData(arr) {
        return [...arr].sort((a, b) => {
            if (currentSort === 'rating') return getRating(b) - getRating(a);
            if (currentSort === 'year')   return (b.startYear || 0) - (a.startYear || 0);
            if (currentSort === 'title')  return (a.primaryTitle || '').localeCompare(b.primaryTitle || '');
            return 0;
        });
    }

    /* ─────────────────────────────────────────────
       CARD TEMPLATE
    ───────────────────────────────────────────── */
    function createCard(item, idx) {
        const id     = item.id;
        const title  = item.primaryTitle || 'Tanpa Judul';
        const img    = (item.primaryImage && item.primaryImage.url)
            ? item.primaryImage.url : 'https://placehold.co/300x450?text=No+Image';
        const year   = item.startYear || '-';
        const type   = item.type || 'unknown';
        const rating = getRating(item) || 'N/A';
        const delay  = idx * 30;

        return `
        <div class="col-6 col-md-4 col-lg-3 col-xl-2 fadein" style="animation-delay:${delay}ms">
            <div class="movie-card" onclick="openDetail('${id}')">
                <div class="movie-card-img-wrap">
                    <span class="rating-badge"><i class="fa-solid fa-star"></i> ${rating}</span>
                    <span class="type-pin ${typeClass(type)}">${typeLabel(type)}</span>
                    <img src="${img}" alt="${title}"
                         onerror="this.src='https://placehold.co/300x450?text=No+Image'">
                    <div class="card-overlay">
                        <div class="overlay-play">
                            <i class="fa-solid fa-play" style="margin-left:3px;"></i>
                        </div>
                    </div>
                </div>
                <div class="card-body-custom">
                    <div class="card-title-custom">${title}</div>
                    <div class="card-meta"><span>${year}</span></div>
                </div>
            </div>
        </div>`;
    }

    /* ─────────────────────────────────────────────
       SKELETON CARDS (shown while loading)
    ───────────────────────────────────────────── */
    function showSkeletons() {
        let html = '';
        for (let i = 0; i < PER_PAGE; i++) {
            html += `<div class="col-6 col-md-4 col-lg-3 col-xl-2">
                        <div class="skeleton skeleton-card"></div>
                     </div>`;
        }
        $('#mainContainer').html(html);
    }

    /* ─────────────────────────────────────────────
       FETCH DATA
    ───────────────────────────────────────────── */
    function fetchData() {
        showSkeletons();
        $.get(BASE_URL)
            .done(function (response) {
                allData = response.titles || [];
                buildGenreFilters();
                applyFilters();
            })
            .fail(function () {
                $('#mainContainer').html(`
                    <div class="empty-state w-100">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <h5>Gagal Memuat Data</h5>
                        <p>Tidak dapat terhubung ke API. Coba lagi nanti.</p>
                    </div>`);
            });
    }

    /* ─────────────────────────────────────────────
       BUILD GENRE FILTERS
    ───────────────────────────────────────────── */
    function buildGenreFilters() {
        let html = '<button class="genre-btn active" data-genre="all">Semua Genre</button>';
        GENRES.forEach(g => {
            html += `<button class="genre-btn" data-genre="${g}">${g}</button>`;
        });
        $('#genreFilters').html(html);

        // Bind events after building
        $('#genreFilters').on('click', '.genre-btn', function () {
            $('#genreFilters .genre-btn').removeClass('active');
            $(this).addClass('active');
            currentGenre = $(this).data('genre');
            applyFilters();
        });
    }

    /* ─────────────────────────────────────────────
       APPLY FILTERS + SORT
    ───────────────────────────────────────────── */
    function applyFilters() {
        const keyword = $('#searchInput').val().toLowerCase().trim();

        filteredData = allData.filter(item => {
            // ── Type filter
            let typeOk = true;
            if (currentType === 'movie') {
                typeOk = (item.type === 'movie' || item.type === 'tvMovie');
            } else if (currentType === 'tvSeries') {
                typeOk = ['tvSeries', 'tvMiniSeries', 'tvShort'].includes(item.type);
            }

            // ── Genre filter
            let genreOk = true;
            if (currentGenre !== 'all') {
                const genres = Array.isArray(item.genres)
                    ? item.genres.map(g => g.toLowerCase()) : [];
                genreOk = genres.includes(currentGenre.toLowerCase());
            }

            // ── Search filter
            const searchOk = (item.primaryTitle || '').toLowerCase().includes(keyword);

            return typeOk && genreOk && searchOk;
        });

        filteredData = sortData(filteredData);
        renderPage(1);
    }

    /* ─────────────────────────────────────────────
       RENDER PAGE
    ───────────────────────────────────────────── */
    window.renderPage = function (page) {
        currentPage = page;
        $('#mainContainer').empty();

        const start     = (page - 1) * PER_PAGE;
        const pageItems = filteredData.slice(start, start + PER_PAGE);

        $('#resultCountNum').text(filteredData.length);

        if (pageItems.length === 0) {
            $('#mainContainer').html(`
                <div class="empty-state w-100">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h5>Tidak Ditemukan</h5>
                    <p>Coba kata kunci atau filter lain.</p>
                </div>`);
        } else {
            pageItems.forEach((item, idx) => {
                $('#mainContainer').append(createCard(item, idx));
            });
        }

        renderPagination();

        // Smooth scroll to catalog section
        $('html, body').animate({ scrollTop: $('#katalog').offset().top - 80 }, 200);
    };

    /* ─────────────────────────────────────────────
       RENDER PAGINATION
    ───────────────────────────────────────────── */
    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / PER_PAGE);
        if (totalPages <= 1) { $('#paginationContainer').html(''); return; }

        let html = '';

        // Prev button
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="renderPage(${currentPage - 1})">
                <i class="fa-solid fa-chevron-left"></i>
            </a></li>`;

        // Page numbers (smart window of 7)
        const startP = Math.max(1, currentPage - 3);
        const endP   = Math.min(totalPages, startP + 6);

        if (startP > 1) {
            html += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onclick="renderPage(1)">1</a></li>
                     <li class="page-item disabled"><span class="page-link">…</span></li>`;
        }
        for (let i = startP; i <= endP; i++) {
            html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="javascript:void(0)" onclick="renderPage(${i})">${i}</a>
                     </li>`;
        }
        if (endP < totalPages) {
            html += `<li class="page-item disabled"><span class="page-link">…</span></li>
                     <li class="page-item"><a class="page-link" href="javascript:void(0)" onclick="renderPage(${totalPages})">${totalPages}</a></li>`;
        }

        // Next button
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="renderPage(${currentPage + 1})">
                <i class="fa-solid fa-chevron-right"></i>
            </a></li>`;

        $('#paginationContainer').html(html);
    }

    /* ─────────────────────────────────────────────
       EVENT BINDINGS
    ───────────────────────────────────────────── */

    // Main type tabs
    $('#mainTabsWrapper').on('click', '.main-tab-btn', function () {
        $('#mainTabsWrapper .main-tab-btn').removeClass('active');
        $(this).addClass('active');
        currentType  = $(this).data('type');
        currentGenre = 'all';
        // Reset genre pills
        $('#genreFilters .genre-btn').removeClass('active');
        $('#genreFilters .genre-btn[data-genre="all"]').addClass('active');
        applyFilters();
    });

    // Search — debounced
    let searchTimer;
    $('#searchInput').on('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFilters, 300);
    });

    // Sort
    $('#sortSelect').on('change', function () {
        currentSort = $(this).val();
        applyFilters();
    });

    /* ─────────────────────────────────────────────
       MODAL — TAB SWITCHER
    ───────────────────────────────────────────── */
    $(document).on('click', '.modal-nav-tab', function () {
        $('.modal-nav-tab').removeClass('active');
        $(this).addClass('active');
        $('.modal-tab-content').addClass('d-none');
        $('#' + $(this).data('target')).removeClass('d-none');
    });

    /* ─────────────────────────────────────────────
       OPEN DETAIL MODAL
    ───────────────────────────────────────────── */
    window.openDetail = function (id) {
        if (!id) return;

        // ── Reset modal state
        $('.modal-nav-tab').first().trigger('click');
        $('#modalTitle').text('Memuat...');
        $('#modalImg').attr('src', '');
        $('#modalPlot').text('Memuat sinopsis...');
        $('#modalOriginalTitle, #modalRating, #modalYear, #modalType').text('-');
        $('#modalGenres').html('');
        $('#mainTabImagesPreview').html('<div class="spinner-border spinner-border-sm text-info" role="status"></div>');
        $('#mainTabVideosPreview').html('<div class="spinner-border spinner-border-sm text-info" role="status"></div>');
        $('#modalImagesContainer, #modalVideosContainer').empty();

        new bootstrap.Modal(document.getElementById('detailModal')).show();

        // ── 1. Detail
        $.get(`${BASE_URL}/${id}`)
            .done(function (res) {
                const d = res.title || res;
                $('#modalTitle').text(d.primaryTitle || 'Judul Tidak Diketahui');
                $('#modalOriginalTitle').text(d.originalTitle || '');
                $('#modalImg').attr('src',
                    (d.primaryImage && d.primaryImage.url)
                        ? d.primaryImage.url
                        : 'https://placehold.co/300x450?text=No+Image'
                );
                $('#modalYear').text(d.startYear || '-');
                $('#modalType').text(typeLabel(d.type));

                const rating = (d.rating && d.rating.aggregateRating)
                    ? d.rating.aggregateRating : 'N/A';
                $('#modalRating').html(
                    `<span style="color:#f5c518;font-weight:700;">${rating}</span>
                     <small style="color:var(--text-muted);"> /10</small>`
                );

                const genres = Array.isArray(d.genres) ? d.genres : [];
                $('#modalGenres').html(
                    genres.map(g => `<span class="genre-chip">${g}</span>`).join('')
                );
                $('#modalPlot').text(d.plot || 'Sinopsis tidak tersedia.');
            })
            .fail(function () {
                $('#modalTitle').text('Gagal memuat detail.');
            });

        // ── 2. Images
        $.get(`${BASE_URL}/${id}/images`)
            .done(function (res) {
                const images = res.images || res.data || (Array.isArray(res) ? res : []);
                $('#mainTabImagesPreview').empty();

                if (images.length > 0) {
                    images.slice(0, 20).forEach(img => {
                        const url = img.url || img;
                        $('#modalImagesContainer').append(
                            `<img src="${url}" class="gallery-img" alt="Gallery">`
                        );
                    });
                    images.slice(0, 3).forEach(img => {
                        const url = img.url || img;
                        $('#mainTabImagesPreview').append(
                            `<img src="${url}" class="preview-img" alt="Preview">`
                        );
                    });
                } else {
                    $('#mainTabImagesPreview').html('<small class="text-muted">Tidak ada gambar.</small>');
                    $('#modalImagesContainer').html('<p class="text-muted">Tidak ada galeri gambar.</p>');
                }
            });

        // ── 3. Videos
        $.get(`${BASE_URL}/${id}/videos`)
            .done(function (res) {
                const videos = res.videos || res.data || (Array.isArray(res) ? res : []);
                $('#mainTabVideosPreview').empty();

                if (videos.length > 0) {
                    videos.forEach(vid => {
                        const vidTitle = vid.name || 'Video Terkait';
                        const type     = vid.type || 'video';
                        const thumbUrl = (vid.primaryImage && vid.primaryImage.url)
                            ? vid.primaryImage.url
                            : 'https://placehold.co/300x170?text=No+Thumb';
                        const vidUrl   = `https://www.imdb.com/video/${vid.id}`;

                        $('#modalVideosContainer').append(`
                            <div class="col-md-6 col-lg-4">
                                <a href="${vidUrl}" target="_blank" class="text-decoration-none">
                                    <div class="video-card">
                                        <div class="video-thumb-wrap">
                                            <img src="${thumbUrl}" class="video-thumb" alt="Thumb">
                                            <div class="video-play-icon">
                                                <i class="fa-solid fa-circle-play"></i>
                                            </div>
                                        </div>
                                        <div class="video-card-body">
                                            <div class="video-title">${vidTitle}</div>
                                            <div class="video-type-badge">${type}</div>
                                        </div>
                                    </div>
                                </a>
                            </div>`);
                    });

                    // Preview card (first video)
                    const fv      = videos[0];
                    const pvThumb = (fv.primaryImage && fv.primaryImage.url)
                        ? fv.primaryImage.url : 'https://placehold.co/300x170?text=No+Thumb';
                    const pvUrl   = `https://www.imdb.com/video/${fv.id}`;

                    $('#mainTabVideosPreview').append(`
                        <a href="${pvUrl}" target="_blank"
                           class="text-decoration-none d-inline-block position-relative rounded overflow-hidden shadow">
                            <img src="${pvThumb}" class="img-fluid rounded border border-secondary"
                                 style="max-height:120px;object-fit:cover;" alt="Video Preview">
                            <div class="position-absolute top-50 start-50 translate-middle">
                                <i class="fa-solid fa-circle-play text-white fs-2"></i>
                            </div>
                            <div class="position-absolute bottom-0 w-100 bg-dark bg-opacity-75 p-1 text-center">
                                <small class="text-white d-block text-truncate px-1"
                                       style="max-width:200px;font-size:0.7rem;">
                                    ${fv.name || 'Watch Trailer'}
                                </small>
                            </div>
                        </a>`);
                } else {
                    $('#mainTabVideosPreview').html('<small class="text-muted">Tidak ada video.</small>');
                    $('#modalVideosContainer').html('<p class="text-muted">Tidak ada video tersedia.</p>');
                }
            });
    };

    /* ─────────────────────────────────────────────
       INIT
    ───────────────────────────────────────────── */
    fetchData();
});
