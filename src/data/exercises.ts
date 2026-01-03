import { Exercise } from '@/types';

export const exercises: Exercise[] = [
  // FÁCIL
  { id: 'easy-1', name: 'Caminhada Leve', difficulty: 'easy', duration: '30 min', calories: 150, description: 'Caminhada em ritmo confortável para iniciantes', steps: ['Aqueça por 5 minutos', 'Caminhe em ritmo moderado por 20 min', 'Desacelere nos últimos 5 min'] },
  { id: 'easy-2', name: 'Alongamento Matinal', difficulty: 'easy', duration: '15 min', calories: 50, description: 'Sequência de alongamentos para despertar o corpo', steps: ['Alongue pescoço e ombros', 'Estique braços e pernas', 'Faça rotações suaves'] },
  { id: 'easy-3', name: 'Yoga para Iniciantes', difficulty: 'easy', duration: '20 min', calories: 80, description: 'Posturas básicas de yoga para flexibilidade', steps: ['Postura da montanha', 'Cachorro olhando para baixo', 'Postura da criança', 'Relaxamento final'] },
  { id: 'easy-4', name: 'Dança Livre', difficulty: 'easy', duration: '20 min', calories: 120, description: 'Dance suas músicas favoritas em casa', steps: ['Escolha músicas animadas', 'Movimente-se livremente', 'Divirta-se e relaxe'] },
  { id: 'easy-5', name: 'Subir Escadas', difficulty: 'easy', duration: '10 min', calories: 80, description: 'Suba e desça escadas em ritmo leve', steps: ['Comece devagar', 'Aumente gradualmente', 'Descanse quando necessário'] },
  { id: 'easy-6', name: 'Polichinelos Suaves', difficulty: 'easy', duration: '10 min', calories: 70, description: 'Polichinelos em ritmo lento', steps: ['Posição inicial', 'Salte abrindo pernas e braços', 'Volte à posição inicial'] },
  { id: 'easy-7', name: 'Bicicleta Estacionária', difficulty: 'easy', duration: '20 min', calories: 100, description: 'Pedale em ritmo confortável', steps: ['Ajuste o banco', 'Pedale em ritmo leve', 'Mantenha postura ereta'] },
  { id: 'easy-8', name: 'Hidroginástica', difficulty: 'easy', duration: '30 min', calories: 200, description: 'Exercícios na água para baixo impacto', steps: ['Entre na piscina', 'Faça movimentos de caminhada', 'Exercite braços e pernas'] },
  
  // MODERADO
  { id: 'mod-1', name: 'Corrida Leve', difficulty: 'moderate', duration: '25 min', calories: 280, description: 'Corrida em ritmo moderado', steps: ['Aqueça por 5 min caminhando', 'Corra por 15 min', 'Esfrie por 5 min'] },
  { id: 'mod-2', name: 'Circuito Funcional', difficulty: 'moderate', duration: '30 min', calories: 300, description: 'Série de exercícios funcionais', steps: ['10 agachamentos', '10 flexões', '10 abdominais', 'Repita 4x'] },
  { id: 'mod-3', name: 'Pular Corda', difficulty: 'moderate', duration: '15 min', calories: 200, description: 'Exercício cardiovascular intenso', steps: ['Comece devagar', 'Aumente o ritmo', 'Descanse entre séries'] },
  { id: 'mod-4', name: 'Spinning Moderado', difficulty: 'moderate', duration: '30 min', calories: 350, description: 'Ciclismo indoor em ritmo moderado', steps: ['Aqueça por 5 min', 'Alterne ritmo e resistência', 'Finalize desacelerando'] },
  { id: 'mod-5', name: 'Natação', difficulty: 'moderate', duration: '30 min', calories: 300, description: 'Nado livre em ritmo moderado', steps: ['Aqueça com braçadas leves', 'Nade em ritmo constante', 'Esfrie nos últimos minutos'] },
  { id: 'mod-6', name: 'Dança Aeróbica', difficulty: 'moderate', duration: '40 min', calories: 350, description: 'Aula de dança com coreografia', steps: ['Aqueça com movimentos simples', 'Siga a coreografia', 'Finalize com alongamento'] },
  { id: 'mod-7', name: 'Caminhada Rápida', difficulty: 'moderate', duration: '30 min', calories: 200, description: 'Caminhada em ritmo acelerado', steps: ['Comece em ritmo normal', 'Acelere gradualmente', 'Mantenha ritmo forte'] },
  { id: 'mod-8', name: 'Escada Aeróbica', difficulty: 'moderate', duration: '25 min', calories: 250, description: 'Step com movimentos variados', steps: ['Suba e desça o step', 'Adicione movimentos de braço', 'Varie os passos'] },
  
  // INTENSO
  { id: 'int-1', name: 'HIIT Cardio', difficulty: 'intense', duration: '20 min', calories: 400, description: 'Treino intervalado de alta intensidade', steps: ['30s de exercício intenso', '15s de descanso', 'Repita por 20 min'] },
  { id: 'int-2', name: 'Burpees', difficulty: 'intense', duration: '15 min', calories: 250, description: 'Exercício completo de alta intensidade', steps: ['Agache', 'Salte para posição de prancha', 'Faça uma flexão', 'Salte para cima'] },
  { id: 'int-3', name: 'Corrida Intensa', difficulty: 'intense', duration: '30 min', calories: 450, description: 'Corrida em ritmo forte', steps: ['Aqueça por 5 min', 'Corra forte por 20 min', 'Desacelere gradualmente'] },
  { id: 'int-4', name: 'CrossFit WOD', difficulty: 'intense', duration: '35 min', calories: 500, description: 'Treino do dia estilo CrossFit', steps: ['Aquecimento geral', 'WOD específico', 'Mobilidade final'] },
  { id: 'int-5', name: 'Tabata Training', difficulty: 'intense', duration: '20 min', calories: 350, description: 'Protocolo Tabata com 4 exercícios', steps: ['20s de exercício', '10s de descanso', '8 rounds por exercício'] },
  { id: 'int-6', name: 'Mountain Climbers', difficulty: 'intense', duration: '15 min', calories: 220, description: 'Escaladores em ritmo intenso', steps: ['Posição de prancha', 'Alterne joelhos ao peito', 'Mantenha ritmo acelerado'] },
  { id: 'int-7', name: 'Box Jump', difficulty: 'intense', duration: '20 min', calories: 300, description: 'Saltos sobre caixa', steps: ['Posicione-se frente à caixa', 'Salte com os dois pés', 'Desça controladamente'] },
  { id: 'int-8', name: 'Sprint Intervals', difficulty: 'intense', duration: '25 min', calories: 400, description: 'Corrida com sprints intervalados', steps: ['Corra em velocidade máxima por 30s', 'Caminhe por 60s', 'Repita 10x'] },
];

export const getExercisesByDifficulty = (difficulty: 'easy' | 'moderate' | 'intense'): Exercise[] =>
  exercises.filter(e => e.difficulty === difficulty);
