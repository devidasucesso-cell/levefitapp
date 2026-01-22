import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  RefreshCw, 
  Settings2, 
  Bell, 
  Key, 
  TestTube, 
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Copy,
  Trash2,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePushDiagnostics, LogEntry } from '@/hooks/usePushDiagnostics';
import { useToast } from '@/hooks/use-toast';

const StatusBadge = ({ status, label }: { status: 'success' | 'warning' | 'error' | 'info'; label: string }) => {
  const variants = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  
  const icons = {
    success: <CheckCircle2 className="h-3 w-3" />,
    warning: <AlertCircle className="h-3 w-3" />,
    error: <XCircle className="h-3 w-3" />,
    info: <Info className="h-3 w-3" />,
  };
  
  return (
    <Badge variant="outline" className={`${variants[status]} flex items-center gap-1`}>
      {icons[status]}
      {label}
    </Badge>
  );
};

const LogLine = ({ entry }: { entry: LogEntry }) => {
  const colors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };
  
  const time = entry.timestamp.toLocaleTimeString('pt-BR');
  
  return (
    <div className="font-mono text-xs">
      <span className="text-muted-foreground">{time}</span>
      {' '}
      <span className={colors[entry.level]}>[{entry.level.toUpperCase()}]</span>
      {' '}
      <span className="text-foreground">{entry.message}</span>
      {entry.details && (
        <pre className="mt-1 text-muted-foreground pl-4 overflow-x-auto">{entry.details}</pre>
      )}
    </div>
  );
};

const PushDiagnostics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    logs,
    isLoading,
    browserSupport,
    swStatus,
    permissionStatus,
    browserSubscription,
    dbSubscription,
    isIOS,
    isStandalone,
    vapidPublicKey,
    clearLogs,
    registerServiceWorker,
    updateServiceWorker,
    unregisterServiceWorker,
    requestPermission,
    createSubscription,
    deleteSubscription,
    sendTestNotification,
    refreshAll,
  } = usePushDiagnostics();

  const copyLogs = () => {
    const text = logs.map(l => 
      `${l.timestamp.toISOString()} [${l.level}] ${l.message}${l.details ? '\n' + l.details : ''}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: 'Logs copiados!' });
  };

  const subscriptionsSynced = browserSubscription?.exists && dbSubscription && 
    browserSubscription.endpoint === dbSubscription.endpoint;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/settings')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Diagnóstico de Notificações</h1>
              <p className="text-sm text-muted-foreground">Debug push notifications</p>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refreshAll}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Service Worker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Service Worker</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Suporte:</div>
                <div>
                  <StatusBadge 
                    status={browserSupport.serviceWorker ? 'success' : 'error'} 
                    label={browserSupport.serviceWorker ? 'Sim' : 'Não'} 
                  />
                </div>
                
                <div className="text-muted-foreground">Registrado:</div>
                <div>
                  <StatusBadge 
                    status={swStatus.registered ? 'success' : 'warning'} 
                    label={swStatus.registered ? 'Sim' : 'Não'} 
                  />
                </div>
                
                <div className="text-muted-foreground">Estado:</div>
                <div>
                  <StatusBadge 
                    status={swStatus.state === 'activated' ? 'success' : swStatus.state === 'none' ? 'error' : 'warning'} 
                    label={swStatus.state} 
                  />
                </div>
                
                {swStatus.scope && (
                  <>
                    <div className="text-muted-foreground">Scope:</div>
                    <div className="text-xs font-mono truncate">{swStatus.scope}</div>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={registerServiceWorker} disabled={isLoading}>
                  Registrar
                </Button>
                <Button size="sm" variant="outline" onClick={updateServiceWorker} disabled={isLoading}>
                  Atualizar
                </Button>
                <Button size="sm" variant="destructive" onClick={unregisterServiceWorker} disabled={isLoading}>
                  Desregistrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Permission */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Permissão</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Status:</div>
                <div>
                  <StatusBadge 
                    status={permissionStatus === 'granted' ? 'success' : permissionStatus === 'denied' ? 'error' : 'warning'} 
                    label={permissionStatus} 
                  />
                </div>
                
                <div className="text-muted-foreground">Dispositivo:</div>
                <div className="flex items-center gap-1">
                  {isIOS ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                  <span className="text-xs">{isIOS ? 'iOS' : 'Desktop/Android'}</span>
                </div>
                
                {isIOS && (
                  <>
                    <div className="text-muted-foreground">Standalone:</div>
                    <div>
                      <StatusBadge 
                        status={isStandalone ? 'success' : 'warning'} 
                        label={isStandalone ? 'Sim (PWA)' : 'Não'} 
                      />
                    </div>
                  </>
                )}
                
                <div className="text-muted-foreground">PushManager:</div>
                <div>
                  <StatusBadge 
                    status={browserSupport.pushManager ? 'success' : 'error'} 
                    label={browserSupport.pushManager ? 'Sim' : 'Não'} 
                  />
                </div>
                
                <div className="text-muted-foreground">Notification API:</div>
                <div>
                  <StatusBadge 
                    status={browserSupport.notification ? 'success' : 'error'} 
                    label={browserSupport.notification ? 'Sim' : 'Não'} 
                  />
                </div>
              </div>
              
              {permissionStatus !== 'granted' && (
                <Button size="sm" onClick={requestPermission} disabled={isLoading || permissionStatus === 'denied'}>
                  {permissionStatus === 'denied' ? 'Bloqueado no navegador' : 'Solicitar Permissão'}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Subscription</CardTitle>
                </div>
                {subscriptionsSynced && (
                  <StatusBadge status="success" label="Sincronizado" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Navegador:</div>
                <div className="grid grid-cols-2 gap-2 text-sm pl-2">
                  <div className="text-muted-foreground">Existe:</div>
                  <div>
                    <StatusBadge 
                      status={browserSubscription?.exists ? 'success' : 'warning'} 
                      label={browserSubscription?.exists ? 'Sim' : 'Não'} 
                    />
                  </div>
                  
                  {browserSubscription?.exists && (
                    <>
                      <div className="text-muted-foreground">Chaves:</div>
                      <div>
                        <StatusBadge 
                          status={browserSubscription.hasKeys ? 'success' : 'error'} 
                          label={browserSubscription.hasKeys ? 'OK' : 'Faltando'} 
                        />
                      </div>
                      
                      <div className="text-muted-foreground">Endpoint:</div>
                      <div className="text-xs font-mono truncate col-span-2 pl-0">
                        {browserSubscription.endpoint?.substring(0, 40)}...
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Banco de Dados:</div>
                <div className="grid grid-cols-2 gap-2 text-sm pl-2">
                  <div className="text-muted-foreground">Existe:</div>
                  <div>
                    <StatusBadge 
                      status={dbSubscription ? 'success' : 'warning'} 
                      label={dbSubscription ? 'Sim' : 'Não'} 
                    />
                  </div>
                  
                  {dbSubscription && (
                    <>
                      <div className="text-muted-foreground">Criada:</div>
                      <div className="text-xs">
                        {new Date(dbSubscription.created_at).toLocaleString('pt-BR')}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {browserSubscription?.exists && dbSubscription && !subscriptionsSynced && (
                <div className="bg-destructive/10 text-destructive text-xs p-2 rounded">
                  ⚠️ Endpoints diferentes! Clique em "Nova Subscription" para corrigir.
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={createSubscription} disabled={isLoading}>
                  Nova Subscription
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteSubscription} disabled={isLoading}>
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* VAPID Keys */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Chaves VAPID</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Chave Pública:</div>
                <div className="text-xs font-mono truncate">{vapidPublicKey.substring(0, 20)}...</div>
                
                <div className="text-muted-foreground">Tamanho:</div>
                <div>
                  <StatusBadge 
                    status={vapidPublicKey.length === 87 ? 'success' : 'warning'} 
                    label={`${vapidPublicKey.length} chars`} 
                  />
                </div>
                
                <div className="text-muted-foreground">Formato:</div>
                <div>
                  <StatusBadge status="success" label="Base64URL" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Testar Notificações</CardTitle>
              </div>
              <CardDescription>Envie notificações de teste para validar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => sendTestNotification('test')} 
                  disabled={isLoading}
                >
                  🔔 Teste
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => sendTestNotification('capsule')} 
                  disabled={isLoading}
                >
                  💊 Cápsula
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => sendTestNotification('water')} 
                  disabled={isLoading}
                >
                  💧 Água
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => sendTestNotification('daily_summary')} 
                  disabled={isLoading}
                >
                  📊 Resumo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Console */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Console de Logs</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={copyLogs} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={clearLogs} className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full rounded-md border bg-muted/30 p-3">
                <div className="space-y-1">
                  {logs.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-8">
                      Nenhum log ainda. Clique em "Atualizar" para iniciar o diagnóstico.
                    </div>
                  ) : (
                    logs.map((entry, i) => <LogLine key={i} entry={entry} />)
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PushDiagnostics;
