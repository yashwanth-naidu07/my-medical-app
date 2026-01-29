self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('clinik-v1').then((cache) => {
      return cache.addAll([
        'index.html',
        'patient.html',
        'doctor.html',
        'https://unpkg.com/lucide@latest'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});