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

export interface AlarmAction {
  action: string;
  title: string;
}

/** Schedule a one-shot or repeating alarm */
export function scheduleAlarm(
  id: string,
  title: string,
  body: string,
  fireAt: number, // absolute timestamp (Date.now()-based)
  repeatMs?: number,
  url?: string,
  actions?: AlarmAction[]
) {
  postToSW({
    type: 'SCHEDULE',
    id,
    title,
    body,
    fireAt,
    repeatMs: repeatMs || 0,
    url: url || '/dashboard',
    actions: actions || null,
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

    const capsuleMessages = [
      'Já tomou sua cápsula hoje? Bora manter o foco no tratamento!',
      'Hora da sua cápsula LeveFit! Não pula hoje, hein 💪',
      'Lembrete rápido: tá na hora da sua cápsula ✨',
      'Sua cápsula tá te esperando! Toma agora pra seguir firme 🚀',
      'Psiu! Não esquece da cápsula de hoje, viu? 😄',
      'Bora? Toma sua cápsula e segue arrasando no tratamento!',
    ];
    const capsuleBody = capsuleMessages[Math.floor(Math.random() * capsuleMessages.length)];

    scheduleAlarm(
      'capsule-reminder',
      'Lembrete de Cápsula LeveFit',
      capsuleBody,
      fireAt,
      ONE_DAY,
      '/dashboard',
      [{ action: 'taken', title: 'TOMEI' }]
    );
  }

  // Schedule water reminders 24/7 (every X minutes, no time window)
  if (settings.waterReminder && settings.waterInterval >= 15) {
    const intervalMs = settings.waterInterval * 60 * 1000;
    // First fire after one interval from now, then repeat 24/7
    const firstFireAt = Date.now() + intervalMs;

    const waterMessages = [
      'Beba água para ter movimentos intestinais mais saudáveis!',
      'Hora de se hidratar! Um copo d\'água agora faz toda diferença.',
      'Tá hidratada(o)? Bora beber água e cuidar do seu corpo!',
      'Lembrete rápido: pausa pra um copo d\'água, vai?',
      'Seu corpo tá pedindo água! Bebe um pouquinho agora 💧',
      'Bora se hidratar? Um golinho de água ajuda demais!',
    ];
    const waterBody = waterMessages[Math.floor(Math.random() * waterMessages.length)];

    scheduleAlarm(
      'water-reminder',
      'Monitor de Ingestão de Água',
      waterBody,
      firstFireAt,
      intervalMs,
      '/dashboard',
      [{ action: 'drink', title: 'BEBER' }]
    );
  }
}
