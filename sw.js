// Naikkan versi untuk memaksa browser memperbarui cache di HP jemaat
const CACHE_NAME = 'jpo-pwa-v3'; 

// Daftar file yang wajib di-download saat pertama kali buka aplikasi
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/javascript.js',
    '/jpo.ico',
    '/download.png',
    '/manifest.json'
];

// 1. Menginstal Service Worker & Menyimpan Aset ke Cache
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Terinstal dan menyimpan cache');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // CATATAN: self.skipWaiting() dihapus dari sini agar popup pembaruan bisa muncul
});

// 2. Mengaktifkan Service Worker & Membersihkan Cache Lama
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Aktif');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Hapus cache versi sebelumnya agar HP tidak penuh dan memuat bug lama
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. Syarat wajib PWA: Event 'fetch' dengan strategi Offline-First
self.addEventListener('fetch', (event) => {
    // Abaikan request yang tidak lazim (misal dari ekstensi browser)
    if (!(event.request.url.indexOf('http') === 0)) return;

    // A. STRATEGI KHUSUS API (Google Apps Script) -> Jaringan Pertama
    if (event.request.url.includes('script.google.com')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(JSON.stringify({ status: "error", message: "Offline" }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // B. STRATEGI FILE STATIS (HTML, CSS, JS) -> Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(event.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }).catch(() => {});
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                return new Response('Anda sedang offline. Pastikan tersambung internet untuk unduhan pertama.');
            });
        })
    );
});

// 4. PEMICU UPDATE POPUP: Menerima perintah dari aplikasi untuk menggunakan versi terbaru
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
