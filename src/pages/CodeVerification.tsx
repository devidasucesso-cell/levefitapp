import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CodeVerification = () => {
  const { user, refreshProfile, updateProfile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCode, setHasCode] = useState<boolean | null>(null); // New state for "Do you have a code?"
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!code) return;
    
    setLoading(true);
    try {
      // Check if code exists and is unused
      // First, try to find the code to give better error messages
      const { data: codeData, error: fetchError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!codeData) {
        toast({
          title: 'Código inválido',
          description: 'Verifique se digitou corretamente.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (codeData.is_used) {
        toast({
          title: 'Código já utilizado',
          description: 'Este código já foi resgatado.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Try to claim the code
      const { error: updateError } = await supabase
        .from('access_codes')
        .update({ 
          is_used: true, 
          used_by: user?.id,
          used_at: new Date().toISOString()
        })
        .eq('code', code)
        .eq('is_used', false); // Optimistic lock

      if (updateError) throw updateError;

      // Update profile to mark code as validated
      await updateProfile({ code_validated: true });
      
      // Refresh profile to update context
      await refreshProfile();

      toast({
        title: 'Código validado! 🎉',
        description: 'Bem-vindo ao LeveFit Premium.',
      });
      
      navigate('/kit-selection');
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível validar o código. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNoCode = async () => {
    setLoading(true);
    try {
      // User doesn't have a code, proceed as Free user
      // We ensure code_validated is false (which is default, but good to be explicit logic-wise)
      await updateProfile({ code_validated: false });
      
      // We might want to ensure profile is ready
      await refreshProfile();
      
      // If user has not selected a kit yet, we might want to ask them or just default to null/free
      // For now, redirect to dashboard. Dashboard will handle Free/Premium view
      navigate('/dashboard');
      
      toast({
        title: 'Acesso Gratuito Iniciado',
        description: 'Você tem acesso limitado ao app.',
      });
    } catch (error) {
      console.error('Error entering as free user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Ask if user has code
  if (hasCode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground">Código de Acesso</h1>
            <p className="text-muted-foreground mt-2">
              Você possui um código de acesso Premium?
            </p>
          </div>

          <Card className="p-6 space-y-4 bg-card border-2 border-border/50">
            <Button 
              className="w-full h-14 text-lg gradient-primary text-primary-foreground shadow-lg hover:scale-[1.02] transition-transform"
              onClick={() => setHasCode(true)}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Sim, tenho um código
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-14 text-lg border-2 hover:bg-secondary/50"
              onClick={handleNoCode}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Não, quero entrar sem código"}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Step 2: Enter code (if hasCode is true)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">Validar Acesso</h1>
          <p className="text-muted-foreground mt-2">
            Digite seu código de acesso exclusivo para liberar o app.
          </p>
        </div>

        <Card className="p-6 bg-card border-2 border-border/50">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">
                Código de acesso
              </label>
              <Input
                type="text"
                placeholder="Ex: LEVE2024"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center text-2xl font-mono tracking-widest h-14 uppercase"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={!code || loading}
              className="w-full h-12 text-lg gradient-primary text-primary-foreground shadow-glow"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Validar Código
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={() => setHasCode(null)}
            >
              Voltar
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CodeVerification;