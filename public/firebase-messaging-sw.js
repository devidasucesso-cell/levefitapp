// Firebase Messaging Service Worker for Push Notifications
// Rich notifications style (Shopee-like) with images, actions, vibration

// Handle push events - this works even when the app is closed
self.addEventListener('push', function(event) {
  console.log('[SW] Push event received');

  let data = {
    title: 'LeveFit',
    body: 'Você tem um lembrete!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: null,
    tag: 'levefit-notification-' + Date.now(),
    url: '/dashboard',
    actions: null,
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push data:', JSON.stringify(payload));
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        image: payload.image || null,
        tag: payload.tag || data.tag,
        url: payload.url || payload.data?.url || data.url,
        actions: payload.actions || null,
      };
    } catch (e) {
      try {
        const text = event.data.text();
        console.log('[SW] Push text:', text);
        data.body = text;
      } catch (e2) {
        console.error('[SW] Error parsing push data:', e2);
      }
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: true,
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    silent: false,
    actions: data.actions || [
      { action: 'open', title: '✅ Abrir App' },
      { action: 'dismiss', title: '❌ Dispensar' }
    ],
    data: { url: data.url },
  };

  // Add large image if provided (Shopee-style banner)
  if (data.image) {
    notificationOptions.image = data.image;
  }

  const promiseChain = self.registration.showNotification(data.title, notificationOptions);
  event.waitUntil(promiseChain);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          return client.focus().then(function(focusedClient) {
            if ('navigate' in focusedClient) {
              return focusedClient.navigate(urlToOpen);
            }
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed');
});

// Install event - take control immediately
self.addEventListener('install', function(event) {
  console.log('[SW] Installing push notification service worker...');
  event.waitUntil(self.skipWaiting());
});

// Activate event - claim all clients immediately
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating push notification service worker...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('push-');
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    ])
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[SW] Push subscription changed');
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then(function(subscription) {
        console.log('[SW] Re-subscribed after change:', subscription.endpoint);
      })
  );
});
