import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MFAFactor {
  id: string;
  factor_type: 'totp';
  status: 'verified' | 'unverified';
  friendly_name?: string;
  created_at: string;
  updated_at: string;
}

interface EnrollResponse {
  id: string;
  type: 'totp';
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export const useMFA = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [enrollData, setEnrollData] = useState<EnrollResponse | null>(null);

  // Check if user has MFA enabled
  const checkMFAStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      const verifiedFactors = data?.totp?.filter(f => f.status === 'verified') || [];
      setFactors(verifiedFactors as MFAFactor[]);
      
      return verifiedFactors.length > 0;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }, []);

  // Start MFA enrollment
  const startEnrollment = useCallback(async (friendlyName: string = 'LeveFit TOTP') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName,
      });

      if (error) throw error;

      setEnrollData(data as EnrollResponse);
      return data;
    } catch (error: any) {
      console.error('Error starting MFA enrollment:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível iniciar a configuração do MFA.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Verify and complete enrollment
  const verifyEnrollment = useCallback(async (factorId: string, code: string) => {
    setIsLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (error) throw error;

      setEnrollData(null);
      await checkMFAStatus();
      
      toast({
        title: 'MFA Ativado!',
        description: 'A autenticação de dois fatores foi configurada com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      toast({
        title: 'Código inválido',
        description: error.message || 'O código informado não é válido. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkMFAStatus, toast]);

  // Challenge and verify for login
  const challengeAndVerify = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) throw factorsError;
      
      const verifiedFactors = factorsData?.totp?.filter(f => f.status === 'verified') || [];
      
      if (verifiedFactors.length === 0) {
        throw new Error('Nenhum fator MFA encontrado');
      }

      const factorId = verifiedFactors[0].id;

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      toast({
        title: 'Código inválido',
        description: error.message || 'O código informado não é válido.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Unenroll (remove) MFA factor
  const unenrollFactor = useCallback(async (factorId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      await checkMFAStatus();
      
      toast({
        title: 'MFA Desativado',
        description: 'A autenticação de dois fatores foi removida.',
      });

      return true;
    } catch (error: any) {
      console.error('Error unenrolling MFA:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível desativar o MFA.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkMFAStatus, toast]);

  // Cancel enrollment
  const cancelEnrollment = useCallback(() => {
    setEnrollData(null);
  }, []);

  return {
    isLoading,
    factors,
    enrollData,
    hasMFA: factors.length > 0,
    checkMFAStatus,
    startEnrollment,
    verifyEnrollment,
    challengeAndVerify,
    unenrollFactor,
    cancelEnrollment,
  };
};
