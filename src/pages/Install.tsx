import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share, Plus, Download, Smartphone, Apple, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const navigate = useNavigate();
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
    
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="gradient-primary p-6 pb-8 rounded-b-3xl -mx-4 -mt-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold font-display text-primary-foreground">Instalação</h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Já instalado!</h2>
            <p className="text-muted-foreground">
              O Leve Fit já está instalado no seu dispositivo. Você pode acessá-lo pela tela inicial.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="gradient-primary text-primary-foreground mt-6"
            >
              Ir para o App
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary p-6 pb-12 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary-foreground">Instalar Leve Fit</h1>
            <p className="text-primary-foreground/80 text-sm">Use como um app nativo</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-2">
              <Smartphone className="w-10 h-10 text-primary-foreground" />
            </div>
            <p className="text-primary-foreground/80 text-sm">Funciona offline</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-2">
              <Download className="w-10 h-10 text-primary-foreground" />
            </div>
            <p className="text-primary-foreground/80 text-sm">Sem App Store</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-6 space-y-4">
        {/* iOS Instructions */}
        {isIOS && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                  <Apple className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Instalar no iPhone</h2>
                  <p className="text-sm text-muted-foreground">3 passos simples</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Abra no Safari</h3>
                    <p className="text-sm text-muted-foreground">
                      Certifique-se de estar usando o navegador Safari (não Chrome ou outro)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      Toque em Compartilhar 
                      <Share className="w-5 h-5 text-primary" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Toque no ícone de compartilhamento na barra inferior do Safari
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      "Adicionar à Tela de Início"
                      <Plus className="w-5 h-5 text-primary" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Role para baixo e toque em "Adicionar à Tela de Início"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                <p className="text-sm text-foreground text-center">
                  ✨ Após instalar, o app aparecerá na sua tela inicial como um app normal!
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Android Instructions */}
        {isAndroid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Instalar no Android</h2>
                  <p className="text-sm text-muted-foreground">Instalação rápida</p>
                </div>
              </div>

              {deferredPrompt ? (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full gradient-primary text-primary-foreground shadow-glow h-14 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Instalar Agora
                </Button>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Menu do navegador</h3>
                      <p className="text-sm text-muted-foreground">
                        Toque nos 3 pontos no canto superior direito do Chrome
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">"Adicionar à tela inicial"</h3>
                      <p className="text-sm text-muted-foreground">
                        Ou "Instalar aplicativo" se disponível
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-success/10 rounded-xl">
                <p className="text-sm text-foreground text-center">
                  📱 O app será instalado e funcionará como um aplicativo normal!
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Desktop Instructions */}
        {!isIOS && !isAndroid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Instalar no Computador</h2>
                  <p className="text-sm text-muted-foreground">Chrome, Edge ou Safari</p>
                </div>
              </div>

              {deferredPrompt ? (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full gradient-primary text-primary-foreground shadow-glow h-14 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Instalar Agora
                </Button>
              ) : (
                <p className="text-muted-foreground text-center">
                  Procure pelo ícone de instalação na barra de endereços do seu navegador, ou acesse pelo celular para melhor experiência.
                </p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-card">
            <h3 className="font-bold text-foreground mb-4">✨ Benefícios do App Instalado</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                Acesso rápido pela tela inicial
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                Funciona mesmo sem internet
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                Notificações de lembrete
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                Experiência em tela cheia
              </li>
            </ul>
          </Card>
        </motion.div>

        {/* Share Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <h3 className="font-bold text-foreground mb-2">📲 Compartilhe com amigos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Copie o link abaixo para enviar para outras pessoas testarem:
            </p>
            <div className="bg-card rounded-lg p-3 text-sm break-all text-muted-foreground border">
              {window.location.origin}
            </div>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                alert('Link copiado!');
              }}
            >
              Copiar Link
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Install;
