self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Logic to show the notification
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Health Alert', body: 'Urgent patient update!' };
    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
        vibrate: [200, 100, 200],
        tag: 'critical-alert',
        renotify: true
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});
// sw.js - This runs even when the window is closed
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Listen for messages from the main app to show a notification
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const options = {
            body: event.data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
            vibrate: [200, 100, 200],
            tag: 'emergency-alert', // Prevents duplicate stacks
            renotify: true,
            data: { url: '/' }
        };

        self.registration.showNotification(event.data.title, options);
    }
});

// Open the app when the user clicks the Windows toast
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('/');
        })
    );
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log('Service Worker registered:', reg))
    .catch(err => console.error('Service Worker registration failed:', err));
}
