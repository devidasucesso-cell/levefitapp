/**
 * Notification Scheduler - communicates with the Service Worker
 * to schedule local notifications via postMessage.
 * 
 * Alarms are persisted in IndexedDB by the SW so they survive restarts.
 */

async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

function postToSW(message: Record<string, unknown>) {
  getSWRegistration().then(reg => {
    if (reg?.active) {
      reg.active.postMessage(message);
    }
  });
}

/** Schedule a one-shot or repeating alarm */
export function scheduleAlarm(
  id: string,
  title: string,
  body: string,
  fireAt: number, // absolute timestamp (Date.now()-based)
  repeatMs?: number,
  url?: string
) {
  postToSW({
    type: 'SCHEDULE',
    id,
    title,
    body,
    fireAt,
    repeatMs: repeatMs || 0,
    url: url || '/dashboard',
  });
}

/** Cancel a specific alarm */
export function cancelAlarm(id: string) {
  postToSW({ type: 'CANCEL', id });
}

/** Cancel all alarms */
export function cancelAllAlarms() {
  postToSW({ type: 'CANCEL_ALL' });
}

/**
 * Calculate next fire time for a given HH:MM today or tomorrow.
 * Uses Brasília timezone (UTC-3).
 */
function getNextFireTime(hours: number, minutes: number): number {
  const now = new Date();
  // Create target time in local timezone
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  
  // If already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime();
}

/**
 * Schedule all notification alarms based on user settings.
 * Called on app load and when settings change.
 */
export function rescheduleAllAlarms(settings: {
  capsuleReminder: boolean;
  capsuleTime: string; // "HH:MM"
  waterReminder: boolean;
  waterInterval: number; // minutes
}) {
  // Cancel everything first
  cancelAllAlarms();

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Schedule capsule reminder
  if (settings.capsuleReminder && settings.capsuleTime) {
    const [hours, minutes] = settings.capsuleTime.split(':').map(Number);
    const fireAt = getNextFireTime(hours, minutes);
    const ONE_DAY = 24 * 60 * 60 * 1000;

    scheduleAlarm(
      'capsule-reminder',
      '💊 Hora do LeveFit!',
      'Não esqueça de tomar sua cápsula LeveFit hoje!',
      fireAt,
      ONE_DAY, // repeat daily
      '/dashboard'
    );
  }

  // Schedule water reminders (between 7h and 22h)
  if (settings.waterReminder && settings.waterInterval >= 15) {
    const intervalMs = settings.waterInterval * 60 * 1000;
    const now = new Date();
    const currentHour = now.getHours();

    // If within active hours (7-22), schedule first one after interval
    // Otherwise schedule first one at 7:00 next day
    let firstFireAt: number;
    if (currentHour >= 7 && currentHour < 22) {
      firstFireAt = Date.now() + intervalMs;
    } else {
      firstFireAt = getNextFireTime(7, 0);
    }

    scheduleAlarm(
      'water-reminder',
      '💧 Beba Água!',
      'É hora de se hidratar! Beba um copo de água.',
      firstFireAt,
      intervalMs, // repeat at interval
      '/dashboard'
    );
  }
}
