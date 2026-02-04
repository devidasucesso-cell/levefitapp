import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CodeVerification = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    const autoGenerateAndClaimCode = async () => {
      if (!user) {
        return;
      }

      try {
        // Call the auto-generate function
        const { data, error } = await supabase.rpc('auto_generate_and_claim_code', {
          claiming_user_id: user.id
        });

        if (error) {
          throw error;
        }

        const result = data as { success: boolean; code?: string; already_validated?: boolean };

        if (result.success) {
          if (result.already_validated) {
            // User already has validated code, go to next step
            navigate('/kit-selection', { replace: true });
            return;
          }

          if (result.code) {
            setGeneratedCode(result.code);
          }

          toast({
            title: "Acesso liberado!",
            description: "Seu código foi gerado e ativado automaticamente.",
          });

          // Refresh profile and navigate
          await refreshProfile();
          
          // Small delay to show the success state
          setTimeout(() => {
            navigate('/kit-selection', { state: { fromCodeVerification: true }, replace: true });
          }, 1500);
        }
      } catch (error: unknown) {
        console.error('Error auto-generating code:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao ativar seu acesso. Tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    autoGenerateAndClaimCode();
  }, [user, navigate, refreshProfile, toast]);

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
              className="text-center space-y-4"
            >
              {isLoading ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Ativando seu acesso...
                  </h2>
                  <p className="text-muted-foreground">
                    Olá{profile?.name ? `, ${profile.name}` : ''}! Aguarde enquanto geramos seu código de acesso automaticamente.
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Acesso Liberado!
                  </h2>
                  {generatedCode && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Seu código de acesso:</p>
                      <p className="text-lg font-mono font-bold text-emerald-700 tracking-widest">
                        {generatedCode}
                      </p>
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    Redirecionando...
                  </p>
                </>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CodeVerification;
