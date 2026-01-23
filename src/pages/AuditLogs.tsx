import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, User, Wallet, Calendar, Clock, RefreshCw, Filter, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  old_values: unknown;
  new_values: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_email?: string;
}

const AuditLogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch admin emails for each log
      const logsWithEmail = await Promise.all(
        (data || []).map(async (log) => {
          // Try to get admin email from profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', log.admin_user_id)
            .single();
          
          return {
            ...log,
            admin_email: profileData?.name || 'Admin desconhecido',
          };
        })
      );

      setLogs(logsWithEmail);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os logs de auditoria.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
    toast({
      title: 'Atualizado!',
      description: 'Logs atualizados com sucesso.',
    });
  };

  const toggleRowExpanded = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'UPDATE_BALANCE':
        return <Badge className="bg-amber-500/20 text-amber-700 border-amber-300">Saldo Alterado</Badge>;
      case 'ADMIN_UPDATE_PROFILE':
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-300">Perfil Alterado</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableBadge = (table: string) => {
    switch (table) {
      case 'wallets':
        return <Badge variant="outline" className="border-green-300 text-green-700"><Wallet className="w-3 h-3 mr-1" /> Carteira</Badge>;
      case 'profiles':
        return <Badge variant="outline" className="border-purple-300 text-purple-700"><User className="w-3 h-3 mr-1" /> Perfil</Badge>;
      default:
        return <Badge variant="outline">{table}</Badge>;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterTable !== 'all' && log.target_table !== filterTable) return false;
    return true;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueTables = [...new Set(logs.map(l => l.target_table))];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin')}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Logs de Auditoria
            </h1>
            <p className="text-white/60 text-sm">Histórico de ações administrativas</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">{logs.length}</p>
              <p className="text-xs text-white/60">Total de Logs</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {logs.filter(l => l.action === 'UPDATE_BALANCE').length}
              </p>
              <p className="text-xs text-white/60">Alterações de Saldo</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {logs.filter(l => l.action === 'ADMIN_UPDATE_PROFILE').length}
              </p>
              <p className="text-xs text-white/60">Alterações de Perfil</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTable} onValueChange={setFilterTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Tabela" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Tabelas</SelectItem>
                  {uniqueTables.map((table) => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Logs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {filteredLogs.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum log encontrado</p>
                <p className="text-sm">As ações administrativas aparecerão aqui.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Collapsible>
                    <Card className="overflow-hidden">
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleRowExpanded(log.id)}
                      >
                        <div className="p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              {getActionBadge(log.action)}
                              {getTableBadge(log.target_table)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{log.admin_email}</span>
                              <span>•</span>
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(log.created_at), "HH:mm", { locale: ptBR })}</span>
                            </div>
                          </div>
                          {expandedRows.has(log.id) ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2 border-t bg-secondary/30">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Old Values */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Valores Anteriores
                              </p>
                              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-sm">
                                {log.old_values ? (
                                  <pre className="text-xs overflow-auto whitespace-pre-wrap text-red-700 dark:text-red-400">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </div>
                            {/* New Values */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Novos Valores
                              </p>
                              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-sm">
                                {log.new_values ? (
                                  <pre className="text-xs overflow-auto whitespace-pre-wrap text-green-700 dark:text-green-400">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {log.target_id && (
                            <div className="mt-3 text-xs text-muted-foreground">
                              <span className="font-medium">ID do Registro:</span> {log.target_id}
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuditLogs;
