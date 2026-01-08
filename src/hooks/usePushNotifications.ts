import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// VAPID Public Key - this is safe to expose in client code
// This key pair was generated using web-push library
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

type PermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('default');

  // Check browser support and current permission status
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermissionStatus(Notification.permission as PermissionStatus);
      } else {
        setPermissionStatus('unsupported');
      }
    };

    checkSupport();

    if (isSupported && user) {
      checkSubscription();
    }
  }, [user, isSupported]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      
      // Also verify subscription exists in database
      if (subscription && user) {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
          .maybeSingle();
        
        // If subscription exists locally but not in DB, update state
        if (!data) {
          setIsSubscribed(false);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    }
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    try {
      // Unregister old service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
          await registration.unregister();
        }
      }
    } catch (e) {
      console.warn('Error unregistering old service workers:', e);
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;
    return registration;
  };

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as PermissionStatus);
      
      if (permission === 'denied') {
        toast({
          title: 'Permissão bloqueada',
          description: 'As notificações foram bloqueadas. Você pode habilitá-las nas configurações do navegador.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (permission === 'default') {
        toast({
          title: 'Permissão não concedida',
          description: 'Você precisa permitir as notificações quando solicitado.',
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }, [isSupported, toast]);

  const subscribeUser = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para ativar notificações.',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      // If not subscribed, create new subscription
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // Extract keys from subscription
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      if (!p256dhKey || !authKey) {
        throw new Error('Failed to get subscription keys');
      }

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

      // Save subscription to database (upsert to handle existing subscriptions)
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Notificações ativadas! 🔔',
        description: 'Você receberá lembretes mesmo com o app fechado.',
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar as notificações. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, requestNotificationPermission]);

  const unsubscribeUser = useCallback(async () => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      setIsSubscribed(false);
      toast({
        title: 'Notificações desativadas',
        description: 'Você não receberá mais lembretes push.',
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar as notificações.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const sendTestNotification = useCallback(async () => {
    if (!user || !isSubscribed) {
      toast({
        title: 'Erro',
        description: 'Você precisa ativar as notificações primeiro.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { type: 'test', userId: user.id },
      });

      if (error) throw error;

      if (data?.sent === 0) {
        toast({
          title: 'Atenção',
          description: 'Nenhuma assinatura encontrada. Tente desativar e ativar novamente.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Teste enviado! 📬',
        description: 'Você deve receber uma notificação em instantes.',
      });

      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a notificação de teste.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, isSubscribed, toast]);

  // Get a user-friendly permission status message
  const getPermissionMessage = useCallback(() => {
    switch (permissionStatus) {
      case 'granted':
        return isSubscribed 
          ? 'Notificações ativas' 
          : 'Permissão concedida, clique para ativar';
      case 'denied':
        return 'Notificações bloqueadas nas configurações do navegador';
      case 'default':
        return 'Clique para ativar notificações';
      case 'unsupported':
        return 'Seu navegador não suporta notificações';
      default:
        return '';
    }
  }, [permissionStatus, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permissionStatus,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification,
    requestNotificationPermission,
    getPermissionMessage,
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