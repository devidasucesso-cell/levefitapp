import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// VAPID Public Key - this is safe to expose in client code
const VAPID_PUBLIC_KEY = 'BLBz4T_GnpH8xUuw2qQlZGv5yBhH5F1yoKr_t5C5J9rRlJj8u0v8G9H6LpO3RnHK9hT0mN5vF7oJ8lK9zXaYpQM';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported && user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
    return registration;
  };

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
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permissão negada',
          description: 'Você precisa permitir notificações para receber lembretes.',
          variant: 'destructive',
        });
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Extract keys from subscription
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)));

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
        }, {
          onConflict: 'user_id,endpoint',
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Notificações ativadas!',
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
  }, [user, toast]);

  const unsubscribeUser = useCallback(async () => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

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

      toast({
        title: 'Teste enviado!',
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

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification,
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