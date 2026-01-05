import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Leaf, User, Key, AlertCircle, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (name.trim() && code.trim()) {
      const result = login(name.trim(), code.trim());
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl gradient-hero flex items-center justify-center shadow-glow">
          <Leaf className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold font-display text-foreground">
          Leve<span className="text-primary">Fit</span>
        </h1>
        <p className="text-muted-foreground mt-2">Sua jornada para uma vida mais saudável</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <Card className="p-6 shadow-lg bg-card">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-2 text-foreground">
                <Key className="w-4 h-4 text-primary" />
                Código de acesso
              </Label>
              <Input
                id="code"
                type="password"
                placeholder="Digite seu código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-secondary border-0 h-12"
              required
            />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity"
            >
              Entrar
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate('/qr-login')}
              className="w-full h-12 border-primary/20 hover:border-primary/40"
            >
              <QrCode className="w-5 h-5 mr-2 text-primary" />
              Acessar via QR Code
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Comece sua transformação hoje! 🌱
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
