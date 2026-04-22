/**
 * Notification Scheduler - communicates with the Service Worker
 * to schedule local notifications via postMessage.
 *
 * Alarms are persisted in IndexedDB by the SW so they survive restarts.
 *
 * Offline / SW-unavailable fallback:
 *  - If the SW is not yet ready (or the browser is offline at boot), the latest
 *    settings are saved to localStorage as a "pending reschedule".
 *  - We listen for `controllerchange`, `online`, and `visibilitychange` to
 *    automatically replay the pending reschedule once conditions improve.
 */

const PENDING_KEY = 'levefit:pending-reschedule';

export interface ReminderSettings {
  capsuleReminder: boolean;
  capsuleTime: string;
  waterReminder: boolean;
  waterInterval: number;
}

function savePending(settings: ReminderSettings) {
  try {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ settings, savedAt: Date.now() })
    );
    console.warn('[Scheduler] SW indisponível — settings salvas como pendente.');
  } catch (e) {
    console.error('[Scheduler] Falha ao salvar pendência:', e);
  }
}

function readPending(): ReminderSettings | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.settings ?? null;
  } catch {
    return null;
  }
}

function clearPending() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* noop */ }
}

async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    // Race against a short timeout so offline boots don't hang
    const reg = await Promise.race<ServiceWorkerRegistration | null>([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    return reg;
  } catch {
    return null;
  }
}

/** Returns true if the message was successfully posted to an active SW. */
async function postToSW(message: Record<string, unknown>): Promise<boolean> {
  const reg = await getSWRegistration();
  if (reg?.active) {
    try {
      reg.active.postMessage(message);
      return true;
    } catch (e) {
      console.warn('[Scheduler] postMessage falhou:', e);
      return false;
    }
  }
  return false;
}

/**
 * Replay a pending reschedule when the SW/connection becomes available.
 * Safe to call multiple times — only acts when there's a pending entry.
 */
export async function flushPendingReschedule(): Promise<boolean> {
  const pending = readPending();
  if (!pending) return false;

  const reg = await getSWRegistration();
  if (!reg?.active) return false;

  console.log('[Scheduler] 🔁 Reprocessando reschedule pendente...');
  // Call the public function (defined later) — this will not re-enter the
  // pending branch because the SW is now active.
  rescheduleAllAlarms(pending);
  clearPending();
  return true;
}

// Wire up automatic recovery listeners (once per page load).
let recoveryWired = false;
function wireRecoveryListeners() {
  if (recoveryWired || typeof window === 'undefined') return;
  recoveryWired = true;

  const tryFlush = () => { flushPendingReschedule().catch(() => { /* noop */ }); };

  window.addEventListener('online', tryFlush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tryFlush();
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', tryFlush);
    // Also try once SW becomes ready
    navigator.serviceWorker.ready.then(tryFlush).catch(() => { /* noop */ });
  }
}
wireRecoveryListeners();

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

export interface AlarmStatus {
  id: string;
  fireAt: number;
  repeatMs: number;
  hasActiveTimer: boolean;
  title: string;
}

export interface SWAlarmsStatus {
  alarms: AlarmStatus[];
  activeTimerIds: string[];
  now: number;
}

/** Ask the SW for the current alarm state (via MessageChannel). */
export async function getAlarmsStatus(timeoutMs = 2000): Promise<SWAlarmsStatus | null> {
  const reg = await getSWRegistration();
  if (!reg?.active) return null;

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve(null), timeoutMs);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      resolve(event.data as SWAlarmsStatus);
    };
    reg.active!.postMessage({ type: 'GET_STATUS' }, [channel.port2]);
  });
}

/**
 * Verify that critical alarms (water, capsule) are persisted, have an active
 * timer, and a future fireAt. Returns a health report and re-schedules if broken.
 */
export async function verifyAlarmsHealth(settings: {
  capsuleReminder: boolean;
  capsuleTime: string;
  waterReminder: boolean;
  waterInterval: number;
}): Promise<{
  healthy: boolean;
  issues: string[];
  status: SWAlarmsStatus | null;
}> {
  const issues: string[] = [];
  const status = await getAlarmsStatus();

  if (!status) {
    issues.push('SW não respondeu ao GET_STATUS');
    // Try to reschedule anyway
    rescheduleAllAlarms(settings);
    return { healthy: false, issues, status: null };
  }

  const checkAlarm = (id: string, expectedRepeatMs: number) => {
    const alarm = status.alarms.find((a) => a.id === id);
    if (!alarm) {
      issues.push(`Alarme '${id}' ausente do IndexedDB`);
      return;
    }
    if (!alarm.hasActiveTimer) {
      issues.push(`Alarme '${id}' sem setTimeout ativo no SW`);
    }
    if (alarm.fireAt <= status.now) {
      issues.push(`Alarme '${id}' com fireAt no passado (${alarm.fireAt} <= ${status.now})`);
    }
    if (expectedRepeatMs > 0 && alarm.repeatMs !== expectedRepeatMs) {
      issues.push(`Alarme '${id}' com repeatMs incorreto: ${alarm.repeatMs} (esperado ${expectedRepeatMs})`);
    }
  };

  if (settings.waterReminder && settings.waterInterval >= 15) {
    checkAlarm('water-reminder', settings.waterInterval * 60 * 1000);
  }
  if (settings.capsuleReminder && settings.capsuleTime) {
    checkAlarm('capsule-reminder', 24 * 60 * 60 * 1000);
  }

  const healthy = issues.length === 0;
  if (!healthy) {
    console.warn('[Scheduler] Alarmes em estado inválido, reagendando:', issues);
    rescheduleAllAlarms(settings);
  } else {
    console.log('[Scheduler] ✅ Alarmes saudáveis:', status.alarms.map((a) => ({
      id: a.id,
      próximoDisparoEm: Math.round((a.fireAt - status.now) / 1000) + 's',
      repete: Math.round(a.repeatMs / 60000) + 'min',
    })));
  }

  return { healthy, issues, status };
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
export function rescheduleAllAlarms(settings: ReminderSettings) {
  // If we're offline OR the SW isn't ready yet, save settings as pending
  // and bail out. Recovery listeners will replay this when conditions improve.
  const swReady = !!navigator.serviceWorker?.controller;
  const online = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;

  if (!swReady || !online) {
    savePending(settings);
    // Still try to flush asynchronously — the SW might become ready in a moment.
    setTimeout(() => { flushPendingReschedule().catch(() => {}); }, 1500);
    return;
  }

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
