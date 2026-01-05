import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Leaf, QrCode, User, Smartphone, Copy, Check, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const QRLogin = () => {
  const [name, setName] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const accessCodes = [
    { code: 'LEVE2024', label: 'Código Leve', color: 'from-green-500 to-emerald-600' },
    { code: 'FIT2024', label: 'Código Fit', color: 'from-blue-500 to-cyan-600' },
    { code: 'SAUDE2024', label: 'Código Saúde', color: 'from-purple-500 to-pink-600' },
  ];

  const handleGenerateQR = (code: string) => {
    if (!name.trim()) {
      toast.error('Por favor, digite seu nome primeiro');
      return;
    }
    setSelectedCode(code);
    setShowQR(true);
  };

  const handleScanLogin = () => {
    if (name.trim() && selectedCode) {
      const result = login(name.trim(), selectedCode);
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Erro ao fazer login');
      }
    }
  };

  const generateQRData = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/login?name=${encodeURIComponent(name)}&code=${selectedCode}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateQRData());
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl gradient-hero flex items-center justify-center shadow-glow">
          <Leaf className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold font-display text-foreground">
          Leve<span className="text-primary">Fit</span>
        </h1>
        <p className="text-muted-foreground mt-2">Acesso via QR Code</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        {!showQR ? (
          <Card className="p-6 shadow-lg bg-card">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  Seu nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-0 h-12"
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-foreground">
                  <QrCode className="w-4 h-4 text-primary" />
                  Escolha seu código de acesso
                </Label>
                
                <div className="grid gap-3">
                  {accessCodes.map((item) => (
                    <motion.button
                      key={item.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGenerateQR(item.code)}
                      className={`w-full p-4 rounded-xl bg-gradient-to-r ${item.color} text-white font-semibold flex items-center justify-between shadow-lg hover:opacity-90 transition-opacity`}
                    >
                      <span>{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm opacity-80">{item.code}</span>
                        <Smartphone className="w-5 h-5" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login tradicional
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 shadow-lg bg-card text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Escaneie o QR Code
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use a câmera do seu celular para acessar o app
                </p>
              </div>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  <QRCodeSVG
                    value={generateQRData()}
                    size={200}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: '/placeholder.svg',
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{name}</strong> usando{' '}
                  <strong className="text-primary">{selectedCode}</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </Button>
                <Button
                  onClick={handleScanLogin}
                  className="flex-1 gradient-primary text-primary-foreground"
                >
                  Entrar Agora
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowQR(false)}
                className="w-full text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Escolher outro código
              </Button>
            </motion.div>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Acesse de qualquer dispositivo! 📱
        </p>
      </motion.div>
    </div>
  );
};

export default QRLogin;
