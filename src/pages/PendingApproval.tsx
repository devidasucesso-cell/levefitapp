import { motion } from 'framer-motion';
import { Clock, Leaf, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const PendingApproval = () => {
  const { logout, profile } = useAuth();

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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg"
          >
            <Clock className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            LeveFit
          </h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full"
            >
              <Clock className="w-8 h-8 text-amber-600" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Aguardando Aprovação
              </h2>
              <p className="text-muted-foreground">
                Olá{profile?.name ? `, ${profile.name}` : ''}! Sua conta foi criada com sucesso.
              </p>
              <p className="text-muted-foreground">
                Um administrador precisa aprovar seu acesso antes que você possa usar o app.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-amber-50 p-3 rounded-lg">
                <Leaf className="h-4 w-4 text-green-500" />
                <span>Você será notificado quando for aprovado</span>
              </div>

              <Button
                variant="outline"
                onClick={logout}
                className="w-full"
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

export default PendingApproval;
