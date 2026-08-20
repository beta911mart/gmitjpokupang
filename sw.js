const CACHE_NAME = 'jpo-pwa-v1';

// Menginstal Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Terinstal');
    self.skipWaiting();
});

// Mengaktifkan Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Aktif');
    return self.clients.claim();
});

// Syarat wajib PWA: Harus memiliki event 'fetch'
self.addEventListener('fetch', (event) => {
    // Membiarkan aplikasi berjalan normal (mengambil dari jaringan)
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('Aplikasi sedang offline.');
        })
    );
});