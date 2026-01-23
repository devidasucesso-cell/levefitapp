import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_PUBLIC_KEY = 'BIJswByPtqkQMVr0BAso8dG3XA-4bn4hL5cn0sILvEXj9QEifo7_9cQj15dDu9v__hsWfnzRaA-JaswPxZ54xoI';

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface BrowserSupport {
  serviceWorker: boolean;
  pushManager: boolean;
  notification: boolean;
}

export interface ServiceWorkerStatus {
  registered: boolean;
  state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | 'none';
  scope: string | null;
  scriptURL: string | null;
}

export interface SubscriptionInfo {
  exists: boolean;
  endpoint: string | null;
  hasKeys: boolean;
}

export interface DBSubscription {
  id: string;
  endpoint: string;
  created_at: string;
}

export const usePushDiagnostics = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [browserSupport, setBrowserSupport] = useState<BrowserSupport>({
    serviceWorker: false,
    pushManager: false,
    notification: false,
  });
  
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    registered: false,
    state: 'none',
    scope: null,
    scriptURL: null,
  });
  
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [browserSubscription, setBrowserSubscription] = useState<SubscriptionInfo | null>(null);
  const [dbSubscription, setDbSubscription] = useState<DBSubscription | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const addLog = useCallback((level: LogEntry['level'], message: string, details?: any) => {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      details: details ? JSON.stringify(details, null, 2) : undefined,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const checkBrowserSupport = useCallback(() => {
    addLog('info', 'Verificando suporte do navegador...');
    
    const support: BrowserSupport = {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
    };
    
    setBrowserSupport(support);
    
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(isiOS);
    setIsStandalone(standalone);
    
    if (support.serviceWorker && support.pushManager && support.notification) {
      addLog('success', 'Navegador suporta todas as APIs necessárias');
    } else {
      addLog('warning', 'Navegador não suporta todas as APIs', support);
    }
    
    if (isiOS && !standalone) {
      addLog('warning', 'iOS detectado: app precisa estar instalado na tela inicial');
    }
    
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      addLog('info', `Permissão de notificação: ${Notification.permission}`);
    }
  }, [addLog]);

  const checkServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      addLog('error', 'Service Worker não suportado');
      return;
    }

    addLog('info', 'Verificando Service Worker...');
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        const sw = registration.active || registration.waiting || registration.installing;
        const state = sw?.state || 'none';
        
        setSwStatus({
          registered: true,
          state: state as ServiceWorkerStatus['state'],
          scope: registration.scope,
          scriptURL: sw?.scriptURL || null,
        });
        
        addLog('success', 'Service Worker registrado', {
          state,
          scope: registration.scope,
          scriptURL: sw?.scriptURL,
        });
      } else {
        setSwStatus({
          registered: false,
          state: 'none',
          scope: null,
          scriptURL: null,
        });
        addLog('warning', 'Service Worker não registrado');
      }
    } catch (error) {
      addLog('error', 'Erro ao verificar Service Worker', error);
    }
  }, [addLog]);

  const checkBrowserSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    addLog('info', 'Verificando subscription do navegador...');
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const hasP256dh = !!subscription.getKey('p256dh');
        const hasAuth = !!subscription.getKey('auth');
        
        setBrowserSubscription({
          exists: true,
          endpoint: subscription.endpoint,
          hasKeys: hasP256dh && hasAuth,
        });
        
        addLog('success', 'Subscription encontrada no navegador', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          hasP256dh,
          hasAuth,
        });
      } else {
        setBrowserSubscription({
          exists: false,
          endpoint: null,
          hasKeys: false,
        });
        addLog('warning', 'Nenhuma subscription no navegador');
      }
    } catch (error) {
      addLog('error', 'Erro ao verificar subscription', error);
    }
  }, [addLog]);

  const checkDBSubscription = useCallback(async () => {
    if (!user) {
      addLog('warning', 'Usuário não logado');
      return;
    }

    addLog('info', 'Verificando subscription no banco de dados...');
    
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, created_at')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        addLog('error', 'Erro ao consultar banco', error);
        return;
      }
      
      if (data) {
        setDbSubscription(data);
        addLog('success', 'Subscription encontrada no banco', {
          id: data.id,
          endpoint: data.endpoint.substring(0, 50) + '...',
          created_at: data.created_at,
        });
      } else {
        setDbSubscription(null);
        addLog('warning', 'Nenhuma subscription no banco de dados');
      }
    } catch (error) {
      addLog('error', 'Erro ao verificar banco', error);
    }
  }, [user, addLog]);

  const compareSubscriptions = useCallback(() => {
    if (!browserSubscription?.exists && !dbSubscription) {
      addLog('info', 'Nenhuma subscription em ambos os locais');
      return;
    }
    
    if (browserSubscription?.exists && dbSubscription) {
      if (browserSubscription.endpoint === dbSubscription.endpoint) {
        addLog('success', '✓ Subscriptions sincronizadas (navegador = banco)');
      } else {
        addLog('error', '✗ Subscriptions DESSINCRONIZADAS! Endpoints diferentes');
      }
    } else if (browserSubscription?.exists && !dbSubscription) {
      addLog('warning', 'Subscription existe no navegador mas NÃO no banco');
    } else if (!browserSubscription?.exists && dbSubscription) {
      addLog('warning', 'Subscription existe no banco mas NÃO no navegador');
    }
  }, [browserSubscription, dbSubscription, addLog]);

  const registerServiceWorker = useCallback(async () => {
    addLog('info', 'Registrando Service Worker...');
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      await navigator.serviceWorker.ready;
      addLog('success', 'Service Worker registrado com sucesso');
      await checkServiceWorker();
    } catch (error) {
      addLog('error', 'Falha ao registrar Service Worker', error);
    } finally {
      setIsLoading(false);
    }
  }, [addLog, checkServiceWorker]);

  const updateServiceWorker = useCallback(async () => {
    addLog('info', 'Atualizando Service Worker...');
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        addLog('success', 'Service Worker atualizado');
        await checkServiceWorker();
      } else {
        addLog('warning', 'Nenhum Service Worker para atualizar');
      }
    } catch (error) {
      addLog('error', 'Falha ao atualizar Service Worker', error);
    } finally {
      setIsLoading(false);
    }
  }, [addLog, checkServiceWorker]);

  const unregisterServiceWorker = useCallback(async () => {
    addLog('info', 'Desregistrando Service Worker...');
    setIsLoading(true);
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      addLog('success', 'Service Workers desregistrados');
      await checkServiceWorker();
    } catch (error) {
      addLog('error', 'Falha ao desregistrar Service Worker', error);
    } finally {
      setIsLoading(false);
    }
  }, [addLog, checkServiceWorker]);

  const requestPermission = useCallback(async () => {
    addLog('info', 'Solicitando permissão de notificação...');
    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        addLog('success', 'Permissão concedida!');
      } else if (permission === 'denied') {
        addLog('error', 'Permissão negada pelo usuário');
      } else {
        addLog('warning', 'Permissão não decidida (default)');
      }
    } catch (error) {
      addLog('error', 'Falha ao solicitar permissão', error);
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const createSubscription = useCallback(async () => {
    if (!user) {
      addLog('error', 'Usuário não logado');
      return;
    }

    addLog('info', 'Criando nova subscription...');
    setIsLoading(true);
    
    try {
      // Ensure SW is ready
      const registration = await navigator.serviceWorker.ready;
      
      // Unsubscribe existing
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        addLog('info', 'Subscription anterior removida');
      }
      
      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      
      addLog('success', 'Subscription criada no navegador');
      
      // Extract keys
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      if (!p256dhKey || !authKey) {
        throw new Error('Falha ao obter chaves da subscription');
      }
      
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));
      
      // Delete old DB entry
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      // Insert new
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
        });
      
      if (error) throw error;
      
      addLog('success', 'Subscription salva no banco de dados');
      
      // Refresh state
      await checkBrowserSubscription();
      await checkDBSubscription();
      compareSubscriptions();
      
    } catch (error) {
      addLog('error', 'Falha ao criar subscription', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, addLog, checkBrowserSubscription, checkDBSubscription, compareSubscriptions]);

  const deleteSubscription = useCallback(async () => {
    if (!user) {
      addLog('error', 'Usuário não logado');
      return;
    }

    addLog('info', 'Deletando subscription...');
    setIsLoading(true);
    
    try {
      // Unsubscribe from browser
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          addLog('success', 'Subscription removida do navegador');
        }
      }
      
      // Delete from DB
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      addLog('success', 'Subscription removida do banco de dados');
      
      // Refresh state
      await checkBrowserSubscription();
      await checkDBSubscription();
      
    } catch (error) {
      addLog('error', 'Falha ao deletar subscription', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, addLog, checkBrowserSubscription, checkDBSubscription]);

  const recreateSubscription = useCallback(async () => {
    if (!user) {
      addLog('error', 'Usuário não logado');
      return;
    }

    addLog('info', '=== Recriando subscription (VAPID refresh) ===');
    setIsLoading(true);
    
    try {
      // Step 1: Delete existing browser subscription
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          await existingSub.unsubscribe();
          addLog('success', '1. Subscription antiga removida do navegador');
        } else {
          addLog('info', '1. Nenhuma subscription anterior no navegador');
        }
      }
      
      // Step 2: Delete from DB
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      addLog('success', '2. Subscription antiga removida do banco');
      
      // Step 3: Create new subscription with current VAPID key
      const registration = await navigator.serviceWorker.ready;
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      addLog('success', '3. Nova subscription criada no navegador');
      
      // Step 4: Extract keys
      const p256dhKey = newSubscription.getKey('p256dh');
      const authKey = newSubscription.getKey('auth');
      
      if (!p256dhKey || !authKey) {
        throw new Error('Falha ao obter chaves da nova subscription');
      }
      
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));
      
      // Step 5: Save to DB
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: newSubscription.endpoint,
          p256dh,
          auth,
        });
      
      if (error) throw error;
      
      addLog('success', '4. Nova subscription salva no banco');
      addLog('success', '=== Subscription recriada com sucesso! ===');
      
      // Refresh state
      await checkBrowserSubscription();
      await checkDBSubscription();
      compareSubscriptions();
      
    } catch (error) {
      addLog('error', 'Falha ao recriar subscription', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, addLog, checkBrowserSubscription, checkDBSubscription, compareSubscriptions]);

  const sendTestNotification = useCallback(async (type: 'test' | 'capsule' | 'water' | 'daily_summary') => {
    if (!user) {
      addLog('error', 'Usuário não logado');
      return;
    }

    addLog('info', `Enviando notificação de teste: ${type}...`);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { type, userId: user.id },
      });
      
      if (error) {
        addLog('error', 'Erro na Edge Function', error);
        return;
      }
      
      addLog('success', 'Resposta da Edge Function', data);
      
      if (data?.sent === 0) {
        addLog('warning', 'Nenhuma notificação enviada - verifique a subscription');
      } else if (data?.sent > 0) {
        addLog('success', `${data.sent} notificação(ões) enviada(s)!`);
      }
    } catch (error) {
      addLog('error', 'Falha ao enviar notificação', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, addLog]);

  const refreshAll = useCallback(async () => {
    addLog('info', '=== Iniciando diagnóstico completo ===');
    setIsLoading(true);
    
    checkBrowserSupport();
    await checkServiceWorker();
    await checkBrowserSubscription();
    await checkDBSubscription();
    
    // Small delay to ensure state is updated
    setTimeout(() => {
      compareSubscriptions();
      addLog('info', '=== Diagnóstico completo ===');
      setIsLoading(false);
    }, 100);
  }, [checkBrowserSupport, checkServiceWorker, checkBrowserSubscription, checkDBSubscription, compareSubscriptions, addLog]);

  // Initial check on mount
  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user]);

  return {
    // State
    logs,
    isLoading,
    browserSupport,
    swStatus,
    permissionStatus,
    browserSubscription,
    dbSubscription,
    isIOS,
    isStandalone,
    vapidPublicKey: VAPID_PUBLIC_KEY,
    
    // Actions
    addLog,
    clearLogs,
    registerServiceWorker,
    updateServiceWorker,
    unregisterServiceWorker,
    requestPermission,
    createSubscription,
    deleteSubscription,
    recreateSubscription,
    sendTestNotification,
    refreshAll,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
