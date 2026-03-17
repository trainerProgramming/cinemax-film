# 🎬 CineMax — Streaming Film & TV Series

> Platform katalog streaming film dan TV series modern berbasis HTML, CSS, dan jQuery — mengkonsumsi data real-time dari **api.imdbapi.dev**.

![CineMax Banner](https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🎥 **Katalog Lengkap** | Menampilkan ribuan film & TV series dari API IMDB |
| 📑 **Tab Kategori** | Pisah tab: Semua / Film / TV Series |
| 🏷️ **Filter Genre** | 11 genre dinamis (Action, Drama, Sci-Fi, dll.) |
| 🔍 **Pencarian Real-time** | Debounced search 300ms |
| ↕️ **Sorting** | Urutkan by Rating, Tahun, atau Judul A-Z |
| 📄 **Pagination Cerdas** | Elipsis pagination, 12 item per halaman |
| 🪟 **Modal Detail** | Info lengkap, galeri gambar, dan daftar video/trailer |
| 💀 **Skeleton Loader** | Placeholder animasi saat data dimuat |
| 📱 **Responsive** | Optimal di desktop, tablet, dan mobile |
| 🎨 **Glassmorphism UI** | Desain modern dark mode premium |

---

## 📁 Struktur Proyek

```
proyek_js_jquery/
│
├── index.html          # Entry point — struktur HTML murni
│
├── css/
│   └── style.css       # Design system & semua styling kustom
│
├── js/
│   └── main.js         # Logika jQuery: fetch, filter, render, modal
│
├── img/
│   └── one_piece.jpg   # Gambar hero (opsional, bisa ganti URL)
│
└── README.md
```

---

## 🚀 Cara Menjalankan

Proyek ini adalah **static website** — tidak memerlukan build tool atau server khusus.

**1. Clone / download proyek:**
```bash
git clone <url-repo>
cd proyek_js_jquery
```

**2. Buka di browser:**
- Double-click `index.html`, **atau**
- Gunakan ekstensi **Live Server** di VS Code (direkomendasikan)

> ⚠️ Jika membuka via `file://` langsung, pastikan CORS tidak memblokir request API. Gunakan Live Server untuk hasil terbaik.

---

## 🔗 API yang Digunakan

Base URL: `https://api.imdbapi.dev/titles`

| Endpoint | Fungsi |
|---|---|
| `GET /titles` | Ambil daftar semua judul |
| `GET /titles/{id}` | Detail satu judul (plot, rating, dll.) |
| `GET /titles/{id}/images` | Galeri gambar |
| `GET /titles/{id}/videos` | Daftar video & trailer |

---

## 🛠️ Tech Stack

- **HTML5** — Struktur semantik
- **CSS3** — Custom design system dengan CSS Variables
- **JavaScript (jQuery 3.6)** — DOM manipulation & AJAX
- **Bootstrap 5.3** — Grid system & komponen UI
- **Font Awesome 6.4** — Icon library
- **Google Fonts (Poppins)** — Tipografi

> Semua dependensi di-load via **CDN** — tidak ada `npm install` yang diperlukan.

---

## 🎨 Design System

File `css/style.css` menggunakan CSS Custom Properties (variables) sebagai design token:

```css
:root {
    --bg-dark:    #090b10;   /* Background utama */
    --bg-card:    #111827;   /* Background card */
    --accent:     #66fcf1;   /* Warna utama (teal/cyan) */
    --accent2:    #45a29e;   /* Variasi accent */
    --text-main:  #e2e8f0;   /* Teks utama */
    --text-muted: #64748b;   /* Teks sekunder */
}
```

---

## 📸 Halaman & Section

| Section | ID | Deskripsi |
|---|---|---|
| Navbar | — | Sticky navbar + search bar |
| Hero | — | Featured content (One Piece) |
| Katalog | `#katalog` | Grid film + filter + pagination |
| About Us | `#about` | Cerita platform + stats |
| Why Us | `#why-us` | 6 feature card keunggulan |
| Footer | — | Links, sosial media, newsletter |

---

## 📋 Alur Filter (State)

```
fetchData()
    │
    ▼
allData[] ──► applyFilters()
                    │
                    ├─ Filter by Type (Semua / Film / TV Series)
                    ├─ Filter by Genre
                    ├─ Filter by Search Keyword
                    └─ sortData() ──► renderPage(1) ──► renderPagination()
```

---

## 👤 Author

**CineMax Project** — dibuat sebagai latihan jQuery & Bootstrap  
📅 2026 | 🇮🇩 Indonesia

---

## 📄 Lisensi

Data film disediakan oleh [api.imdbapi.dev](https://api.imdbapi.dev).  
Proyek ini dibuat untuk tujuan edukasi.
