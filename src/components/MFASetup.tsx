import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, Copy, CheckCircle2, XCircle, Smartphone, Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useMFA } from '@/hooks/useMFA';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MFASetupProps {
  onComplete?: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const {
    isLoading,
    factors,
    enrollData,
    hasMFA,
    checkMFAStatus,
    startEnrollment,
    verifyEnrollment,
    unenrollFactor,
    cancelEnrollment,
  } = useMFA();

  const [code, setCode] = useState('');
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  useEffect(() => {
    if (code.length === 6 && enrollData) {
      handleVerify();
    }
  }, [code, enrollData]);

  const handleStartSetup = async () => {
    await startEnrollment('LeveFit Admin');
  };

  const handleVerify = async () => {
    if (!enrollData || code.length !== 6) return;
    
    const success = await verifyEnrollment(enrollData.id, code);
    if (success) {
      onComplete?.();
    } else {
      setCode('');
    }
  };

  const handleCopySecret = () => {
    if (enrollData?.totp?.secret) {
      navigator.clipboard.writeText(enrollData.totp.secret);
      setCopiedSecret(true);
      toast({
        title: 'Copiado!',
        description: 'Chave secreta copiada para a área de transferência.',
      });
      setTimeout(() => setCopiedSecret(false), 3000);
    }
  };

  const handleDisableMFA = async () => {
    if (factors.length > 0) {
      const success = await unenrollFactor(factors[0].id);
      if (success) {
        setShowDisableDialog(false);
      }
    }
  };

  // Show current MFA status
  if (hasMFA && !enrollData) {
    return (
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            MFA Ativado
          </CardTitle>
          <CardDescription>
            Sua conta está protegida com autenticação de dois fatores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Autenticação TOTP</p>
              <p className="text-xs text-green-600">Configurado em: {new Date(factors[0]?.created_at || '').toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setShowDisableDialog(true)}
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Desativar MFA
          </Button>

          <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Desativar MFA?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a remover a autenticação de dois fatores. Isso tornará sua conta admin menos segura.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisableMFA}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Desativar'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  // Show enrollment QR code
  if (enrollData) {
    return (
      <Card className="border-2 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Shield className="w-5 h-5" />
            Configurar MFA
          </CardTitle>
          <CardDescription>
            Escaneie o QR code com seu app autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-xl shadow-inner border">
              <img
                src={enrollData.totp.qr_code}
                alt="QR Code para MFA"
                className="w-48 h-48"
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4" />
                Use Google Authenticator, Authy ou similar
              </p>
              
              {/* Manual entry option */}
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Key className="w-4 h-4 text-muted-foreground" />
                <code className="text-xs font-mono flex-1 truncate">
                  {enrollData.totp.secret}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopySecret}
                  className="h-8 w-8 p-0"
                >
                  {copiedSecret ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Verification code input */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Digite o código de 6 dígitos:</p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <span className="text-muted-foreground">-</span>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={cancelEnrollment}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerify}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Verificar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show setup button
  return (
    <Card className="border-2 border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <Shield className="w-5 h-5" />
          Ativar MFA
        </CardTitle>
        <CardDescription>
          Adicione uma camada extra de segurança à sua conta de administrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            Recomendamos fortemente ativar o MFA para contas admin.
          </p>
        </div>

        <Button
          onClick={handleStartSetup}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Preparando...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Configurar Autenticação de Dois Fatores
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MFASetup;
