// Firebase Messaging Service Worker for Push Notifications
// This service worker handles background push notifications

// Handle push events - this works even when the app is closed
self.addEventListener('push', function(event) {
  console.log('[SW] Push event received');

  let notificationData = {
    title: 'LeveFit',
    body: 'Você tem um lembrete!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'levefit-notification-' + Date.now(),
    requireInteraction: true,
    vibrate: [200, 100, 200],
    silent: false, // Enable sound
    actions: [
      { action: 'open', title: 'Abrir App' },
      { action: 'dismiss', title: 'Dispensar' }
    ],
    data: { url: '/dashboard' }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW] Push data:', data);
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        tag: data.tag || notificationData.tag,
        data: { 
          url: data.url || data.data?.url || '/dashboard',
          ...data.data 
        },
      };
    } catch (e) {
      // Try parsing as text
      try {
        const text = event.data.text();
        console.log('[SW] Push text:', text);
        notificationData.body = text;
      } catch (e2) {
        console.error('[SW] Error parsing push data:', e2);
      }
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title, 
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      actions: notificationData.actions,
      data: notificationData.data,
      // Ensure notification shows even when app is in focus
      renotify: true,
    }
  );

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
      // If a window is already open, focus it and navigate
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
      // Otherwise, open a new window
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
      // Clear old caches if any
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
  // The subscription was changed, user needs to re-subscribe
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then(function(subscription) {
        console.log('[SW] Re-subscribed after change:', subscription.endpoint);
      })
  );
});
