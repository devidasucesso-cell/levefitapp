// Firebase Messaging Service Worker for Push Notifications
// Rich notifications style (Shopee-like) with images, actions, vibration
// + Local scheduling via postMessage with IndexedDB persistence

// ===== IndexedDB helpers for alarm persistence =====
const DB_NAME = 'levefit-alarms';
const STORE_NAME = 'alarms';

function openDB() {
  return new Promise(function(resolve, reject) {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = function(event) { resolve(event.target.result); };
    request.onerror = function(event) { reject(event.target.error); };
  });
}

function saveAlarm(alarm) {
  return openDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(alarm);
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function(e) { reject(e.target.error); };
    });
  });
}

function deleteAlarm(id) {
  return openDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function(e) { reject(e.target.error); };
    });
  });
}

function clearAllAlarms() {
  return openDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function(e) { reject(e.target.error); };
    });
  });
}

function getAllAlarms() {
  return openDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = function() { resolve(request.result); };
      request.onerror = function(e) { reject(e.target.error); };
    });
  });
}

// ===== In-memory timer map =====
const activeTimers = {};

function scheduleAlarmTimer(alarm) {
  // Cancel existing timer for this id
  if (activeTimers[alarm.id]) {
    clearTimeout(activeTimers[alarm.id]);
    delete activeTimers[alarm.id];
  }

  const now = Date.now();
  let fireAt = alarm.fireAt; // absolute timestamp

  // If fireAt is in the past, skip (or calculate next repeat)
  if (fireAt <= now) {
    if (alarm.repeatMs && alarm.repeatMs > 0) {
      // Fast-forward to next future fire time
      const elapsed = now - fireAt;
      const periods = Math.ceil(elapsed / alarm.repeatMs);
      fireAt = fireAt + periods * alarm.repeatMs;
    } else {
      // One-shot that already passed, remove it
      deleteAlarm(alarm.id).catch(function() {});
      return;
    }
  }

  const delay = fireAt - now;
  // Cap at ~24h to avoid JS timer overflow issues, re-schedule later
  const maxDelay = 24 * 60 * 60 * 1000;
  const actualDelay = Math.min(delay, maxDelay);

  activeTimers[alarm.id] = setTimeout(function() {
    delete activeTimers[alarm.id];

    if (delay > maxDelay) {
      // Re-schedule with remaining time
      alarm.fireAt = fireAt;
      scheduleAlarmTimer(alarm);
      return;
    }

    // Fire the notification
    self.registration.showNotification(alarm.title, {
      body: alarm.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'alarm-' + alarm.id,
      requireInteraction: true,
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      silent: false,
      actions: alarm.actions && alarm.actions.length > 0 ? alarm.actions : [
        { action: 'open', title: 'ABRIR' },
        { action: 'dismiss', title: 'DISPENSAR' }
      ],
      data: { url: alarm.url || '/dashboard', alarmId: alarm.id },
    });

    // Handle repeat
    if (alarm.repeatMs && alarm.repeatMs > 0) {
      alarm.fireAt = Date.now() + alarm.repeatMs;
      saveAlarm(alarm).catch(function() {});
      scheduleAlarmTimer(alarm);
    } else {
      // One-shot, remove from DB
      deleteAlarm(alarm.id).catch(function() {});
    }
  }, actualDelay);
}

// Re-hydrate alarms from IndexedDB
function rehydrateAlarms() {
  getAllAlarms().then(function(alarms) {
    console.log('[SW] Rehydrating', alarms.length, 'alarms from IndexedDB');
    alarms.forEach(function(alarm) {
      scheduleAlarmTimer(alarm);
    });
  }).catch(function(err) {
    console.error('[SW] Error rehydrating alarms:', err);
  });
}

// ===== Message listener for local scheduling =====
self.addEventListener('message', function(event) {
  const data = event.data;
  if (!data || !data.type) return;

  console.log('[SW] Message received:', data.type);

  switch (data.type) {
    case 'SCHEDULE': {
      var alarm = {
        id: data.id,
        title: data.title,
        body: data.body,
        fireAt: data.fireAt, // absolute timestamp
        repeatMs: data.repeatMs || 0,
        url: data.url || '/dashboard',
        actions: data.actions || null,
      };
      saveAlarm(alarm).then(function() {
        scheduleAlarmTimer(alarm);
        console.log('[SW] Alarm scheduled:', alarm.id, 'fires at', new Date(alarm.fireAt).toLocaleString());
      }).catch(function(err) {
        console.error('[SW] Error saving alarm:', err);
      });
      break;
    }
    case 'CANCEL': {
      if (activeTimers[data.id]) {
        clearTimeout(activeTimers[data.id]);
        delete activeTimers[data.id];
      }
      deleteAlarm(data.id).then(function() {
        console.log('[SW] Alarm cancelled:', data.id);
      }).catch(function() {});
      break;
    }
    case 'CANCEL_ALL': {
      Object.keys(activeTimers).forEach(function(id) {
        clearTimeout(activeTimers[id]);
      });
      Object.keys(activeTimers).forEach(function(id) { delete activeTimers[id]; });
      clearAllAlarms().then(function() {
        console.log('[SW] All alarms cancelled');
      }).catch(function() {});
      break;
    }
    case 'GET_STATUS': {
      // Reply via MessageChannel port with current alarm state
      getAllAlarms().then(function(alarms) {
        const status = {
          alarms: alarms.map(function(a) {
            return {
              id: a.id,
              fireAt: a.fireAt,
              repeatMs: a.repeatMs,
              hasActiveTimer: !!activeTimers[a.id],
              title: a.title,
            };
          }),
          activeTimerIds: Object.keys(activeTimers),
          now: Date.now(),
        };
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage(status);
        }
      }).catch(function(err) {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ error: String(err) });
        }
      });
      break;
    }
  }
});

// ===== Push event handler (server push) =====
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

  let urlToOpen = event.notification.data?.url || '/dashboard';

  // Route action buttons to specific dashboard intents
  if (event.action === 'drink') {
    urlToOpen = '/dashboard?action=water';
  } else if (event.action === 'taken') {
    urlToOpen = '/dashboard?action=capsule';
  }

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

// Activate event - claim all clients + rehydrate alarms
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating push notification service worker...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      rehydrateAlarms(),
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
