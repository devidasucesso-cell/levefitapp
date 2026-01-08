import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, LogOut, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CodeVerification = () => {
  const { logout, profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, insira o código de acesso.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use atomic RPC function to prevent race conditions
      const { data, error } = await supabase.rpc('claim_access_code', {
        code_input: code.toUpperCase().trim(),
        claiming_user_id: user.id
      });

      if (error) {
        throw error;
      }

      const result = data as { success: boolean; error?: string; code_id?: string };

      if (!result.success) {
        let errorTitle = "Erro";
        let errorDescription = "Ocorreu um erro ao verificar o código.";

        switch (result.error) {
          case 'CODE_NOT_FOUND':
            errorTitle = "Código inválido";
            errorDescription = "O código inserido não existe.";
            break;
          case 'CODE_ALREADY_USED':
            errorTitle = "Código já utilizado";
            errorDescription = "Este código já foi usado por outro usuário.";
            break;
          case 'CODE_LOCKED':
            errorTitle = "Código em processamento";
            errorDescription = "Este código está sendo processado. Tente novamente em alguns segundos.";
            break;
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Código validado!",
        description: "Seu acesso foi liberado com sucesso.",
      });

      // Refresh profile then navigate to kit selection
      await refreshProfile();
      navigate('/kit-selection', { state: { fromCodeVerification: true }, replace: true });

    } catch (error: unknown) {
      console.error('Error verifying code:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mb-4 shadow-lg"
          >
            <KeyRound className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            LeveFit
          </h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-2"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Ativar Acesso
              </h2>
              <p className="text-muted-foreground">
                Olá{profile?.name ? `, ${profile.name}` : ''}! Insira o código de acesso fornecido para liberar o uso do aplicativo.
              </p>
            </motion.div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Acesso</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Digite seu código"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest font-mono uppercase"
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Ativar Código
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={logout}
                className="w-full"
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CodeVerification;