import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, CheckCircle, Circle, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import WaterReminder from '@/components/WaterReminder';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CalendarPage = () => {
  const { capsuleDays, markCapsuleTaken, isCapsuleTaken } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const capsuleDates = capsuleDays.map(d => parseISO(d));
  
  const isDateTaken = (date: Date) => {
    return capsuleDates.some(d => isSameDay(d, date));
  };

  const handleMarkToday = () => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      markCapsuleTaken(dateStr);
    }
  };

  const totalDays = capsuleDays.length;
  const isSelectedDateTaken = selectedDate && isDateTaken(selectedDate);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary p-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary-foreground">Calendário LeveFit</h1>
            <p className="text-primary-foreground/80 text-sm">Acompanhe seus dias de uso</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-foreground">{totalDays}</p>
            <p className="text-primary-foreground/80 text-sm">dias tomados</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md pointer-events-auto"
              modifiers={{
                taken: capsuleDates,
              }}
              modifiersStyles={{
                taken: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '50%',
                }
              }}
            />
          </Card>
        </motion.div>

        {/* Selected Date Info */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isSelectedDateTaken ? 'bg-success/20' : 'bg-muted'
                  }`}>
                    {isSelectedDateTaken ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSelectedDateTaken ? 'LeveFit tomado ✅' : 'Ainda não tomou'}
                    </p>
                  </div>
                </div>
                
                {!isSelectedDateTaken && isSameDay(selectedDate, new Date()) && (
                  <Button 
                    onClick={handleMarkToday}
                    className="gradient-primary text-primary-foreground"
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    Marcar
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-card">
            <h3 className="font-semibold mb-3 text-foreground">Legenda</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary" />
                <span className="text-sm text-muted-foreground">LeveFit tomado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <span className="text-sm text-muted-foreground">Não tomado</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <WaterReminder />
      <Navigation />
    </div>
  );
};

export default CalendarPage;
