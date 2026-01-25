import { Exercise, ExerciseCategory, IMCCategory } from '@/types';

export const exerciseCategoryLabels: Record<ExerciseCategory, { label: string; icon: string }> = {
  caminhada: { label: 'Caminhada', icon: '🚶' },
  corrida: { label: 'Corrida', icon: '🏃' },
  danca: { label: 'Dança', icon: '💃' },
  yoga_pilates: { label: 'Yoga & Pilates', icon: '🧘' },
  natacao_aquatico: { label: 'Natação & Aquático', icon: '🏊' },
  ciclismo: { label: 'Ciclismo', icon: '🚴' },
  esportes: { label: 'Esportes', icon: '⚽' },
  funcional: { label: 'Funcional & HIIT', icon: '💪' },
  alongamento: { label: 'Alongamento & Relaxamento', icon: '🌿' },
  musculacao: { label: 'Musculação', icon: '🏋️' },
  outros: { label: 'Outros', icon: '✨' },
};

// Mapeamento de exercícios recomendados por categoria de IMC
// underweight: exercícios de baixo impacto, yoga, alongamento
// normal: todos os níveis com destaque para moderados
// overweight: baixo a moderado impacto (proteger articulações)
// obese: fáceis, aquáticos, baixo impacto

// Imagens por categoria de exercício
const exerciseImages = {
  caminhada: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop',
  corrida: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop',
  danca: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=400&h=300&fit=crop',
  yoga_pilates: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  natacao_aquatico: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
  ciclismo: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop',
  esportes: 'https://images.unsplash.com/photo-1461896836934- voices?w=400&h=300&fit=crop',
  funcional: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  alongamento: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
  musculacao: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop',
  outros: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
};

export const exercises: Exercise[] = [
  // ============= FÁCIL =============
  // Caminhada - Ideal para todos
  { id: 'easy-1', name: 'Caminhada Leve', difficulty: 'easy', category: 'caminhada', duration: '30 min', calories: 150, description: 'Caminhada em ritmo confortável para iniciantes', steps: ['Aqueça por 5 minutos', 'Caminhe em ritmo moderado por 20 min', 'Desacelere nos últimos 5 min'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop' },
  { id: 'easy-14', name: 'Caminhada na Praia', difficulty: 'easy', category: 'caminhada', duration: '40 min', calories: 180, description: 'Caminhe na areia para maior resistência', steps: ['Comece pela areia dura', 'Gradualmente vá para areia fofa', 'Termine com os pés na água'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop' },
  { id: 'easy-16', name: 'Passeio com Cachorro', difficulty: 'easy', category: 'caminhada', duration: '30 min', calories: 120, description: 'Caminhe com seu pet no parque', steps: ['Coloque a guia', 'Caminhe em ritmo leve', 'Faça paradas para brincadeiras'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=400&h=300&fit=crop' },
  { id: 'easy-19', name: 'Caminhada no Shopping', difficulty: 'easy', category: 'caminhada', duration: '35 min', calories: 130, description: 'Caminhe pelos corredores do shopping', steps: ['Use escadas ao invés de escadas rolantes', 'Mantenha ritmo constante', 'Faça várias voltas'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1519566335946-e6f65f0f4fdf?w=400&h=300&fit=crop' },
  { id: 'easy-27', name: 'Caminhada Indoor', difficulty: 'easy', category: 'caminhada', duration: '20 min', calories: 90, description: 'Caminhe dentro de casa', steps: ['Caminhe de cômodo em cômodo', 'Use o corredor', 'Mantenha ritmo constante'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop' },
  { id: 'easy-11', name: 'Marcha Estacionária', difficulty: 'easy', category: 'caminhada', duration: '15 min', calories: 70, description: 'Marche no lugar elevando os joelhos', steps: ['Postura ereta', 'Eleve joelhos alternadamente', 'Balance os braços'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop' },
  
  // Yoga & Pilates - Ideal para underweight, normal e overweight
  { id: 'easy-3', name: 'Yoga para Iniciantes', difficulty: 'easy', category: 'yoga_pilates', duration: '20 min', calories: 80, description: 'Posturas básicas de yoga para flexibilidade', steps: ['Postura da montanha', 'Cachorro olhando para baixo', 'Postura da criança', 'Relaxamento final'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
  { id: 'easy-9', name: 'Tai Chi', difficulty: 'easy', category: 'yoga_pilates', duration: '25 min', calories: 90, description: 'Movimentos lentos e fluidos para equilíbrio', steps: ['Postura inicial centrada', 'Movimentos circulares com braços', 'Transferência de peso suave'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop' },
  { id: 'easy-10', name: 'Pilates Básico', difficulty: 'easy', category: 'yoga_pilates', duration: '20 min', calories: 85, description: 'Fortalecimento do core com movimentos controlados', steps: ['Respiração diafragmática', 'Elevação de pernas alternadas', 'Pontes de glúteo'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
  { id: 'easy-17', name: 'Yoga Restaurativo', difficulty: 'easy', category: 'yoga_pilates', duration: '30 min', calories: 60, description: 'Yoga suave para recuperação e relaxamento', steps: ['Postura do cadáver', 'Pernas na parede', 'Torção suave deitado'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=300&fit=crop' },
  { id: 'easy-21', name: 'Bola de Pilates', difficulty: 'easy', category: 'yoga_pilates', duration: '20 min', calories: 70, description: 'Exercícios com bola suíça', steps: ['Sente na bola', 'Faça pequenos saltos', 'Movimentos de equilíbrio'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1591384640699-9a85bd036da2?w=400&h=300&fit=crop' },
  { id: 'easy-29', name: 'Yoga na Cadeira', difficulty: 'easy', category: 'yoga_pilates', duration: '20 min', calories: 55, description: 'Posturas de yoga sentado', steps: ['Torção sentada', 'Alongamento lateral', 'Flexão para frente'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?w=400&h=300&fit=crop' },
  
  // Alongamento & Relaxamento - Ideal para todos
  { id: 'easy-2', name: 'Alongamento Matinal', difficulty: 'easy', category: 'alongamento', duration: '15 min', calories: 50, description: 'Sequência de alongamentos para despertar o corpo', steps: ['Alongue pescoço e ombros', 'Estique braços e pernas', 'Faça rotações suaves'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1566241832378-917a0f30db2d?w=400&h=300&fit=crop' },
  { id: 'easy-12', name: 'Alongamento de Escritório', difficulty: 'easy', category: 'alongamento', duration: '10 min', calories: 30, description: 'Alongamentos para quem trabalha sentado', steps: ['Alongue pescoço', 'Estique braços acima da cabeça', 'Rotação de punhos'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=300&fit=crop' },
  { id: 'easy-13', name: 'Respiração Profunda', difficulty: 'easy', category: 'alongamento', duration: '10 min', calories: 20, description: 'Exercícios de respiração para relaxamento', steps: ['Inspire contando até 4', 'Segure por 4 segundos', 'Expire lentamente por 6'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop' },
  { id: 'easy-26', name: 'Movimento de Ombros', difficulty: 'easy', category: 'alongamento', duration: '10 min', calories: 30, description: 'Rotações e elevações de ombros', steps: ['Eleve os ombros', 'Faça rotações para frente', 'Rotações para trás'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
  { id: 'easy-34', name: 'Alongamento de Quadril', difficulty: 'easy', category: 'alongamento', duration: '15 min', calories: 40, description: 'Abra os quadris com alongamentos', steps: ['Postura do pombo', 'Borboleta sentada', 'Joelho ao peito'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=300&fit=crop' },
  { id: 'easy-32', name: 'Meditação em Movimento', difficulty: 'easy', category: 'alongamento', duration: '15 min', calories: 40, description: 'Caminhe lentamente com atenção plena', steps: ['Passos conscientes', 'Observe a respiração', 'Foque nos sentidos'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop' },
  
  // Dança - Variado por impacto
  { id: 'easy-4', name: 'Dança Livre', difficulty: 'easy', category: 'danca', duration: '20 min', calories: 120, description: 'Dance suas músicas favoritas em casa', steps: ['Escolha músicas animadas', 'Movimente-se livremente', 'Divirta-se e relaxe'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=400&h=300&fit=crop' },
  { id: 'easy-56', name: 'Hula Hoop', difficulty: 'easy', category: 'danca', duration: '15 min', calories: 80, description: 'Gire o bambolê na cintura', steps: ['Posicione na cintura', 'Movimente o quadril', 'Mantenha o ritmo'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&h=300&fit=crop' },
  
  // Natação & Aquático - Excelente para overweight e obese (baixo impacto)
  { id: 'easy-8', name: 'Hidroginástica', difficulty: 'easy', category: 'natacao_aquatico', duration: '30 min', calories: 200, description: 'Exercícios na água para baixo impacto', steps: ['Entre na piscina', 'Faça movimentos de caminhada', 'Exercite braços e pernas'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop' },
  { id: 'easy-20', name: 'Aqua Aeróbica Leve', difficulty: 'easy', category: 'natacao_aquatico', duration: '30 min', calories: 180, description: 'Aeróbica na piscina com baixo impacto', steps: ['Caminhada na água', 'Movimentos de braço', 'Saltos leves'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=400&h=300&fit=crop' },
  { id: 'easy-35', name: 'Natação Leve', difficulty: 'easy', category: 'natacao_aquatico', duration: '20 min', calories: 150, description: 'Nade em ritmo confortável', steps: ['Aqueça com braçadas leves', 'Nado de costas relaxado', 'Flutuação'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400&h=300&fit=crop' },
  { id: 'easy-45', name: 'Canoagem Leve', difficulty: 'easy', category: 'natacao_aquatico', duration: '30 min', calories: 170, description: 'Remar em águas calmas', steps: ['Entre no caiaque devagar', 'Remadas suaves', 'Aprecie a paisagem'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop' },
  
  // Ciclismo
  { id: 'easy-7', name: 'Bicicleta Estacionária', difficulty: 'easy', category: 'ciclismo', duration: '20 min', calories: 100, description: 'Pedale em ritmo confortável', steps: ['Ajuste o banco', 'Pedale em ritmo leve', 'Mantenha postura ereta'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop' },
  
  // Funcional
  { id: 'easy-5', name: 'Subir Escadas', difficulty: 'easy', category: 'funcional', duration: '10 min', calories: 80, description: 'Suba e desça escadas em ritmo leve', steps: ['Comece devagar', 'Aumente gradualmente', 'Descanse quando necessário'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=400&h=300&fit=crop' },
  { id: 'easy-6', name: 'Polichinelos Suaves', difficulty: 'easy', category: 'funcional', duration: '10 min', calories: 70, description: 'Polichinelos em ritmo lento', steps: ['Posição inicial', 'Salte abrindo pernas e braços', 'Volte à posição inicial'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop' },
  { id: 'easy-18', name: 'Exercícios na Cadeira', difficulty: 'easy', category: 'funcional', duration: '15 min', calories: 50, description: 'Exercícios sentado para mobilidade', steps: ['Elevação de pernas', 'Rotação de tronco', 'Flexão de braços'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1579126038374-6064e9370f0f?w=400&h=300&fit=crop' },
  { id: 'easy-22', name: 'Flexão na Parede', difficulty: 'easy', category: 'funcional', duration: '10 min', calories: 40, description: 'Flexões apoiadas na parede', steps: ['Mãos na parede', 'Flexione os braços', 'Empurre de volta'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop' },
  { id: 'easy-23', name: 'Agachamento com Apoio', difficulty: 'easy', category: 'funcional', duration: '10 min', calories: 50, description: 'Agachamentos segurando em uma cadeira', steps: ['Segure na cadeira', 'Desça lentamente', 'Suba controladamente'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=300&fit=crop' },
  { id: 'easy-25', name: 'Elevação de Panturrilha', difficulty: 'easy', category: 'funcional', duration: '10 min', calories: 40, description: 'Fique na ponta dos pés repetidamente', steps: ['Segure em uma parede', 'Eleve os calcanhares', 'Desça lentamente'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop' },
  { id: 'easy-33', name: 'Exercício com Faixa Elástica', difficulty: 'easy', category: 'funcional', duration: '15 min', calories: 55, description: 'Resistência leve com elásticos', steps: ['Estique o elástico', 'Faça remadas', 'Rotação externa'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop' },
  
  // Esportes
  { id: 'easy-40', name: 'Frisbee', difficulty: 'easy', category: 'esportes', duration: '25 min', calories: 100, description: 'Jogue frisbee no parque', steps: ['Lance para um parceiro', 'Corra para pegar', 'Varie as distâncias'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1527933053326-89d1746b76b9?w=400&h=300&fit=crop' },
  { id: 'easy-41', name: 'Vôlei de Praia Leve', difficulty: 'easy', category: 'esportes', duration: '30 min', calories: 180, description: 'Vôlei casual na areia', steps: ['Toque leve na bola', 'Movimente-se na areia', 'Jogue em grupo'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop' },
  { id: 'easy-42', name: 'Pingue Pongue', difficulty: 'easy', category: 'esportes', duration: '30 min', calories: 150, description: 'Partida de tênis de mesa', steps: ['Postura adequada', 'Rebata a bola', 'Movimente-se lateralmente'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
  { id: 'easy-43', name: 'Badminton Casual', difficulty: 'easy', category: 'esportes', duration: '25 min', calories: 140, description: 'Jogue badminton em ritmo leve', steps: ['Segure a raquete corretamente', 'Rebata a peteca', 'Movimente-se suavemente'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop' },
  { id: 'easy-51', name: 'Patinação Leve', difficulty: 'easy', category: 'esportes', duration: '25 min', calories: 160, description: 'Patine em ritmo confortável', steps: ['Use proteção', 'Deslize suavemente', 'Pratique freadas'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1593554218481-83f00e21f7a0?w=400&h=300&fit=crop' },
  
  // Outros
  { id: 'easy-15', name: 'Jardinagem', difficulty: 'easy', category: 'outros', duration: '45 min', calories: 150, description: 'Atividades de jardinagem como exercício', steps: ['Plante e regue', 'Arranque ervas daninhas', 'Cave e revolva a terra'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' },
  { id: 'easy-28', name: 'Limpeza de Casa', difficulty: 'easy', category: 'outros', duration: '40 min', calories: 150, description: 'Atividades domésticas como exercício', steps: ['Varrer e passar pano', 'Limpar janelas', 'Organizar gavetas'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop' },
  { id: 'easy-31', name: 'Brincadeira com Crianças', difficulty: 'easy', category: 'outros', duration: '30 min', calories: 140, description: 'Brinque ativamente com crianças', steps: ['Corra atrás delas', 'Jogue bola', 'Pule corda juntos'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop' },

  // ============= MODERADO =============
  // Corrida
  { id: 'mod-1', name: 'Corrida Leve', difficulty: 'moderate', category: 'corrida', duration: '25 min', calories: 280, description: 'Corrida em ritmo moderado', steps: ['Aqueça por 5 min caminhando', 'Corra por 15 min', 'Esfrie por 5 min'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop' },
  { id: 'mod-7', name: 'Caminhada Rápida', difficulty: 'moderate', category: 'caminhada', duration: '30 min', calories: 200, description: 'Caminhada em ritmo acelerado', steps: ['Comece em ritmo normal', 'Acelere gradualmente', 'Mantenha ritmo forte'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop' },
  
  // Funcional & HIIT
  { id: 'mod-2', name: 'Circuito Funcional', difficulty: 'moderate', category: 'funcional', duration: '30 min', calories: 300, description: 'Série de exercícios funcionais', steps: ['10 agachamentos', '10 flexões', '10 abdominais', 'Repita 4x'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  { id: 'mod-3', name: 'Pular Corda', difficulty: 'moderate', category: 'funcional', duration: '15 min', calories: 200, description: 'Exercício cardiovascular intenso', steps: ['Comece devagar', 'Aumente o ritmo', 'Descanse entre séries'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop' },
  { id: 'mod-8', name: 'Escada Aeróbica', difficulty: 'moderate', category: 'funcional', duration: '25 min', calories: 250, description: 'Step com movimentos variados', steps: ['Suba e desça o step', 'Adicione movimentos de braço', 'Varie os passos'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop' },
  { id: 'mod-9', name: 'Kickboxing Básico', difficulty: 'moderate', category: 'funcional', duration: '30 min', calories: 320, description: 'Socos e chutes no ar', steps: ['Postura de luta', 'Combinações de socos', 'Chutes laterais e frontais'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop' },
  { id: 'mod-22', name: 'Boxe Fitness', difficulty: 'moderate', category: 'funcional', duration: '30 min', calories: 350, description: 'Treino de boxe sem contato', steps: ['Postura básica', 'Combinações de socos', 'Esquivas e defesas'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=400&h=300&fit=crop' },
  { id: 'mod-23', name: 'Jump', difficulty: 'moderate', category: 'funcional', duration: '25 min', calories: 280, description: 'Exercícios em mini trampolim', steps: ['Saltos básicos', 'Corrida no lugar', 'Saltos laterais'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop' },
  { id: 'mod-25', name: 'TRX Básico', difficulty: 'moderate', category: 'funcional', duration: '25 min', calories: 250, description: 'Exercícios com fitas de suspensão', steps: ['Remada TRX', 'Agachamento TRX', 'Prancha TRX'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400&h=300&fit=crop' },
  { id: 'mod-26', name: 'Kettlebell Swing', difficulty: 'moderate', category: 'funcional', duration: '20 min', calories: 280, description: 'Balanço com kettlebell', steps: ['Postura correta', 'Impulso de quadril', 'Braços relaxados'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'mod-27', name: 'Medicine Ball', difficulty: 'moderate', category: 'funcional', duration: '25 min', calories: 250, description: 'Treino com bola medicinal', steps: ['Arremessos na parede', 'Agachamento com bola', 'Rotação de tronco'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&h=300&fit=crop' },
  { id: 'mod-28', name: 'Corda Naval Básico', difficulty: 'moderate', category: 'funcional', duration: '15 min', calories: 200, description: 'Ondulações com corda grossa', steps: ['Segure as pontas', 'Faça ondas alternadas', 'Ondas duplas'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop' },
  { id: 'mod-29', name: 'Aulas de Step', difficulty: 'moderate', category: 'funcional', duration: '40 min', calories: 350, description: 'Aeróbica com step', steps: ['Passos básicos', 'Coreografias simples', 'Variações laterais'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
  { id: 'mod-31', name: 'Aero Combat', difficulty: 'moderate', category: 'funcional', duration: '45 min', calories: 400, description: 'Artes marciais aeróbicas', steps: ['Socos e chutes', 'Joelhadas e cotoveladas', 'Combinações rápidas'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop' },
  
  // Dança
  { id: 'mod-6', name: 'Dança Aeróbica', difficulty: 'moderate', category: 'danca', duration: '40 min', calories: 350, description: 'Aula de dança com coreografia', steps: ['Aqueça com movimentos simples', 'Siga a coreografia', 'Finalize com alongamento'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=400&h=300&fit=crop' },
  { id: 'mod-10', name: 'Zumba', difficulty: 'moderate', category: 'danca', duration: '45 min', calories: 400, description: 'Dança latina aeróbica', steps: ['Siga o instrutor', 'Movimentos de salsa', 'Ritmos variados'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
  { id: 'mod-51', name: 'Aulas de Salsa', difficulty: 'moderate', category: 'danca', duration: '60 min', calories: 350, description: 'Dança latina em dupla', steps: ['Passos básicos', 'Giros', 'Coreografias'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop' },
  { id: 'mod-52', name: 'Dança do Ventre', difficulty: 'moderate', category: 'danca', duration: '45 min', calories: 280, description: 'Movimentos ondulados do tronco', steps: ['Ondulações', 'Shimmy', 'Movimentos de braço'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=400&h=300&fit=crop' },
  
  // Ciclismo
  { id: 'mod-4', name: 'Spinning Moderado', difficulty: 'moderate', category: 'ciclismo', duration: '30 min', calories: 350, description: 'Ciclismo indoor em ritmo moderado', steps: ['Aqueça por 5 min', 'Alterne ritmo e resistência', 'Finalize desacelerando'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop' },
  { id: 'mod-16', name: 'Ciclismo Outdoor', difficulty: 'moderate', category: 'ciclismo', duration: '40 min', calories: 380, description: 'Pedale ao ar livre', steps: ['Verifique a bicicleta', 'Escolha uma rota plana', 'Mantenha ritmo constante'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&h=300&fit=crop' },
  { id: 'mod-32', name: 'Bike Spinning', difficulty: 'moderate', category: 'ciclismo', duration: '35 min', calories: 380, description: 'Ciclismo indoor intensificado', steps: ['Aquecimento pedalando', 'Subidas simuladas', 'Sprints curtos'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=400&h=300&fit=crop' },
  { id: 'mod-41', name: 'Mountain Bike', difficulty: 'moderate', category: 'ciclismo', duration: '50 min', calories: 420, description: 'Ciclismo em trilhas', steps: ['Verifique equipamentos', 'Trilha moderada', 'Desça com cuidado'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400&h=300&fit=crop' },
  
  // Natação & Aquático - Excelente para todos por ser baixo impacto
  { id: 'mod-5', name: 'Natação', difficulty: 'moderate', category: 'natacao_aquatico', duration: '30 min', calories: 300, description: 'Nado livre em ritmo moderado', steps: ['Aqueça com braçadas leves', 'Nade em ritmo constante', 'Esfrie nos últimos minutos'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop' },
  { id: 'mod-11', name: 'Remo Indoor', difficulty: 'moderate', category: 'natacao_aquatico', duration: '20 min', calories: 250, description: 'Simulador de remo', steps: ['Posicione-se corretamente', 'Reme em ritmo constante', 'Mantenha postura'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  { id: 'mod-24', name: 'Aqua Running', difficulty: 'moderate', category: 'natacao_aquatico', duration: '30 min', calories: 300, description: 'Corrida dentro da piscina', steps: ['Use colete flutuador', 'Corra na parte funda', 'Mantenha postura'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=400&h=300&fit=crop' },
  { id: 'mod-36', name: 'Surf', difficulty: 'moderate', category: 'natacao_aquatico', duration: '45 min', calories: 350, description: 'Surfe ondas pequenas a médias', steps: ['Reme para fora', 'Fique de pé na prancha', 'Equilibre-se na onda'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&fit=crop' },
  { id: 'mod-37', name: 'Stand Up Paddle', difficulty: 'moderate', category: 'natacao_aquatico', duration: '40 min', calories: 300, description: 'Remar de pé em prancha', steps: ['Equilibre-se de pé', 'Reme alternando lados', 'Mantenha o core firme'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1526188717906-ab4a2f949f8f?w=400&h=300&fit=crop' },
  { id: 'mod-40', name: 'Caiaque Intermediário', difficulty: 'moderate', category: 'natacao_aquatico', duration: '40 min', calories: 300, description: 'Remar em águas mais agitadas', steps: ['Técnica de remada', 'Manobras básicas', 'Remadas mais fortes'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop' },
  
  // Yoga & Pilates
  { id: 'mod-14', name: 'Pilates Intermediário', difficulty: 'moderate', category: 'yoga_pilates', duration: '40 min', calories: 200, description: 'Pilates com exercícios mais desafiadores', steps: ['Hundred', 'Roll up', 'Teaser modificado'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
  { id: 'mod-15', name: 'Yoga Vinyasa', difficulty: 'moderate', category: 'yoga_pilates', duration: '45 min', calories: 280, description: 'Yoga com fluxo contínuo', steps: ['Saudação ao sol', 'Sequência guerreiro', 'Posturas de equilíbrio'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
  { id: 'mod-30', name: 'Power Yoga', difficulty: 'moderate', category: 'yoga_pilates', duration: '50 min', calories: 320, description: 'Yoga mais intenso e dinâmico', steps: ['Posturas desafiadoras', 'Transições rápidas', 'Força e flexibilidade'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop' },
  { id: 'mod-49', name: 'Aerial Yoga', difficulty: 'moderate', category: 'yoga_pilates', duration: '45 min', calories: 250, description: 'Yoga em tecido suspenso', steps: ['Posturas invertidas', 'Alongamentos suspensos', 'Balanço relaxante'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=400&h=300&fit=crop' },
  
  // Esportes
  { id: 'mod-17', name: 'Trilha Leve', difficulty: 'moderate', category: 'caminhada', duration: '60 min', calories: 350, description: 'Caminhada em trilha natural', steps: ['Use calçado adequado', 'Leve água', 'Aprecie a natureza'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop' },
  { id: 'mod-18', name: 'Tênis', difficulty: 'moderate', category: 'esportes', duration: '45 min', calories: 400, description: 'Partida de tênis recreativo', steps: ['Aqueça rebatendo', 'Jogue sets leves', 'Movimente-se pela quadra'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop' },
  { id: 'mod-19', name: 'Basquete', difficulty: 'moderate', category: 'esportes', duration: '30 min', calories: 320, description: 'Jogue basquete com amigos', steps: ['Drible e passe', 'Arremesse ao cesto', 'Jogue em equipe'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop' },
  { id: 'mod-20', name: 'Futsal', difficulty: 'moderate', category: 'esportes', duration: '40 min', calories: 380, description: 'Partida de futsal', steps: ['Aqueça com passes', 'Movimente-se pela quadra', 'Jogue em equipe'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop' },
  { id: 'mod-21', name: 'Vôlei', difficulty: 'moderate', category: 'esportes', duration: '45 min', calories: 300, description: 'Jogo de vôlei recreativo', steps: ['Toque e manchete', 'Cortadas leves', 'Movimentação em quadra'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop' },
  { id: 'mod-33', name: 'Escalada Indoor', difficulty: 'moderate', category: 'esportes', duration: '30 min', calories: 300, description: 'Parede de escalada rotas médias', steps: ['Escolha rotas intermediárias', 'Foque na técnica', 'Descanse entre rotas'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=300&fit=crop' },
  { id: 'mod-34', name: 'Squash', difficulty: 'moderate', category: 'esportes', duration: '30 min', calories: 350, description: 'Partida de squash', steps: ['Rebata contra a parede', 'Movimente-se rapidamente', 'Jogo com parceiro'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop' },
  { id: 'mod-35', name: 'Patinação Velocidade', difficulty: 'moderate', category: 'esportes', duration: '30 min', calories: 280, description: 'Patine em ritmo mais rápido', steps: ['Patine forte', 'Pratique curvas', 'Mantenha velocidade'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1593554218481-83f00e21f7a0?w=400&h=300&fit=crop' },
  { id: 'mod-45', name: 'Handebol', difficulty: 'moderate', category: 'esportes', duration: '40 min', calories: 380, description: 'Jogo de handebol', steps: ['Passes rápidos', 'Arremessos ao gol', 'Movimentação constante'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop' },
  { id: 'mod-47', name: 'Frisbee Ultimate', difficulty: 'moderate', category: 'esportes', duration: '45 min', calories: 380, description: 'Esporte com frisbee em equipe', steps: ['Passe o disco', 'Corra para receber', 'Defesa e ataque'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1527933053326-89d1746b76b9?w=400&h=300&fit=crop' },
  
  // Musculação
  { id: 'mod-12', name: 'Elíptico', difficulty: 'moderate', category: 'funcional', duration: '25 min', calories: 270, description: 'Exercício no elíptico', steps: ['Ajuste a resistência', 'Pedale continuamente', 'Varie a velocidade'], recommendedFor: ['underweight', 'normal', 'overweight', 'obese'], image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop' },
  { id: 'mod-13', name: 'Body Pump', difficulty: 'moderate', category: 'musculacao', duration: '45 min', calories: 400, description: 'Musculação com peso leve e repetições', steps: ['Escolha pesos leves', 'Alta repetição', 'Trabalhe todos grupos'], recommendedFor: ['underweight', 'normal', 'overweight'], image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop' },
  { id: 'mod-48', name: 'Pole Dance Fitness', difficulty: 'moderate', category: 'funcional', duration: '45 min', calories: 350, description: 'Exercícios na barra vertical', steps: ['Giros básicos', 'Subidas', 'Poses de força'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
  { id: 'mod-50', name: 'Bungee Fitness', difficulty: 'moderate', category: 'funcional', duration: '30 min', calories: 400, description: 'Exercícios com elástico aéreo', steps: ['Saltos assistidos', 'Corrida suspensa', 'Acrobacias leves'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop' },

  // ============= INTENSO =============
  // Funcional & HIIT - Geralmente para normal/underweight
  { id: 'int-1', name: 'HIIT Cardio', difficulty: 'intense', category: 'funcional', duration: '20 min', calories: 400, description: 'Treino intervalado de alta intensidade', steps: ['30s de exercício intenso', '15s de descanso', 'Repita por 20 min'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  { id: 'int-2', name: 'Burpees', difficulty: 'intense', category: 'funcional', duration: '15 min', calories: 250, description: 'Exercício completo de alta intensidade', steps: ['Agache', 'Salte para posição de prancha', 'Faça uma flexão', 'Salte para cima'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop' },
  { id: 'int-4', name: 'CrossFit WOD', difficulty: 'intense', category: 'funcional', duration: '35 min', calories: 500, description: 'Treino do dia estilo CrossFit', steps: ['Aquecimento geral', 'WOD específico', 'Mobilidade final'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400&h=300&fit=crop' },
  { id: 'int-5', name: 'Tabata Training', difficulty: 'intense', category: 'funcional', duration: '20 min', calories: 350, description: 'Protocolo Tabata com 4 exercícios', steps: ['20s de exercício', '10s de descanso', '8 rounds por exercício'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop' },
  { id: 'int-6', name: 'Mountain Climbers', difficulty: 'intense', category: 'funcional', duration: '15 min', calories: 220, description: 'Escaladores em ritmo intenso', steps: ['Posição de prancha', 'Alterne joelhos ao peito', 'Mantenha ritmo acelerado'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop' },
  { id: 'int-7', name: 'Box Jump', difficulty: 'intense', category: 'funcional', duration: '20 min', calories: 300, description: 'Saltos sobre caixa', steps: ['Posicione-se frente à caixa', 'Salte com os dois pés', 'Desça controladamente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-16', name: 'Battle Ropes', difficulty: 'intense', category: 'funcional', duration: '15 min', calories: 300, description: 'Ondulações intensas com corda naval', steps: ['Ondas rápidas alternadas', 'Ondas duplas', 'Slams laterais'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop' },
  { id: 'int-17', name: 'Sled Push', difficulty: 'intense', category: 'funcional', duration: '15 min', calories: 280, description: 'Empurrar trenó pesado', steps: ['Posição baixa', 'Empurre com pernas', 'Mantenha velocidade'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  { id: 'int-18', name: 'Tire Flip', difficulty: 'intense', category: 'funcional', duration: '15 min', calories: 290, description: 'Virar pneu de trator', steps: ['Agarre por baixo', 'Levante com pernas', 'Empurre para virar'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop' },
  { id: 'int-19', name: 'Wall Ball', difficulty: 'intense', category: 'funcional', duration: '12 min', calories: 200, description: 'Arremesso de bola na parede', steps: ['Agache com bola', 'Suba explosivo', 'Arremesse no alvo'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&h=300&fit=crop' },
  { id: 'int-22', name: 'Devil Press', difficulty: 'intense', category: 'funcional', duration: '15 min', calories: 300, description: 'Burpee com halteres', steps: ['Desça com halteres', 'Faça burpee', 'Snatch duplo'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400&h=300&fit=crop' },
  { id: 'int-24', name: 'Turkish Get Up', difficulty: 'intense', category: 'funcional', duration: '20 min', calories: 250, description: 'Levante do chão com kettlebell', steps: ['Deite com peso acima', 'Levante em etapas', 'Retorne ao chão'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-25', name: 'Plyo Push Ups', difficulty: 'intense', category: 'funcional', duration: '10 min', calories: 180, description: 'Flexões explosivas com palma', steps: ['Desça devagar', 'Suba explosivo', 'Bata palmas'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop' },
  { id: 'int-26', name: 'Tuck Jump', difficulty: 'intense', category: 'funcional', duration: '10 min', calories: 200, description: 'Saltos agrupando joelhos', steps: ['Salte alto', 'Agrupe os joelhos', 'Aterrisse suave'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop' },
  { id: 'int-27', name: 'Broad Jump', difficulty: 'intense', category: 'funcional', duration: '12 min', calories: 180, description: 'Saltos horizontais explosivos', steps: ['Agache para impulso', 'Salte para frente', 'Aterrisse e repita'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop' },
  { id: 'int-48', name: 'EMOM Complexo', difficulty: 'intense', category: 'funcional', duration: '30 min', calories: 450, description: 'A cada minuto no minuto', steps: ['Exercício a cada minuto', 'Complete as reps', 'Descanse o restante'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  { id: 'int-49', name: 'AMRAP Intenso', difficulty: 'intense', category: 'funcional', duration: '20 min', calories: 380, description: 'Máximas rodadas possíveis', steps: ['Ciclo de 3-4 exercícios', 'Sem pausa', 'Máximo de rounds'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-50', name: 'Chipper WOD', difficulty: 'intense', category: 'funcional', duration: '35 min', calories: 500, description: 'Completar lista de exercícios', steps: ['Lista de exercícios', 'Complete todos', 'Menor tempo possível'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400&h=300&fit=crop' },
  { id: 'int-51', name: 'Hero WOD Murph', difficulty: 'intense', category: 'funcional', duration: '45 min', calories: 600, description: 'WOD memorial militar', steps: ['1 milha corrida', '100 pull ups, 200 push ups, 300 squats', '1 milha corrida'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop' },
  { id: 'int-52', name: 'Fran', difficulty: 'intense', category: 'funcional', duration: '10 min', calories: 200, description: 'Benchmark CrossFit clássico', steps: ['21-15-9 thrusters', '21-15-9 pull ups', 'Menor tempo'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  
  // Corrida
  { id: 'int-3', name: 'Corrida Intensa', difficulty: 'intense', category: 'corrida', duration: '30 min', calories: 450, description: 'Corrida em ritmo forte', steps: ['Aqueça por 5 min', 'Corra forte por 20 min', 'Desacelere gradualmente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop' },
  { id: 'int-8', name: 'Sprint Intervals', difficulty: 'intense', category: 'corrida', duration: '25 min', calories: 400, description: 'Corrida com sprints intervalados', steps: ['Corra em velocidade máxima por 30s', 'Caminhe por 60s', 'Repita 10x'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop' },
  { id: 'int-15', name: 'Double Unders', difficulty: 'intense', category: 'funcional', duration: '12 min', calories: 220, description: 'Duas passagens de corda por salto', steps: ['Salte mais alto', 'Gire a corda rápido', 'Mantenha ritmo'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop' },
  
  // Ciclismo
  { id: 'int-20', name: 'Assault Bike', difficulty: 'intense', category: 'ciclismo', duration: '20 min', calories: 400, description: 'Bicicleta de ar em alta intensidade', steps: ['Pedale forte', 'Use os braços', 'Mantenha ritmo máximo'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop' },
  
  // Natação & Aquático
  { id: 'int-21', name: 'Rowing Sprint', difficulty: 'intense', category: 'natacao_aquatico', duration: '15 min', calories: 280, description: 'Remo em máxima intensidade', steps: ['Remadas explosivas', 'Intervalos curtos', 'Recuperação ativa'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop' },
  { id: 'int-35', name: 'Ski Erg Sprint', difficulty: 'intense', category: 'funcional', duration: '15 min', calories: 280, description: 'Simulador de esqui intenso', steps: ['Puxe com força', 'Movimento explosivo', 'Intervalos curtos'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  
  // Musculação
  { id: 'int-9', name: 'Thrusters', difficulty: 'intense', category: 'musculacao', duration: '15 min', calories: 280, description: 'Agachamento com desenvolvimento', steps: ['Segure pesos', 'Agache profundo', 'Suba empurrando acima'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop' },
  { id: 'int-10', name: 'Clean and Jerk', difficulty: 'intense', category: 'musculacao', duration: '25 min', calories: 350, description: 'Levantamento olímpico completo', steps: ['Puxe do chão', 'Receba no ombro', 'Empurre acima da cabeça'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-11', name: 'Snatch', difficulty: 'intense', category: 'musculacao', duration: '25 min', calories: 340, description: 'Arranque olímpico', steps: ['Pegada larga', 'Puxe explosivo', 'Receba em cima'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop' },
  { id: 'int-12', name: 'Muscle Up', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 250, description: 'Subida na barra com transição', steps: ['Puxada explosiva', 'Rotação de punho', 'Extensão acima da barra'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400&h=300&fit=crop' },
  { id: 'int-13', name: 'Handstand Push Up', difficulty: 'intense', category: 'musculacao', duration: '15 min', calories: 200, description: 'Flexão em parada de mão', steps: ['Suba na parede', 'Desça a cabeça', 'Empurre para cima'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
  { id: 'int-14', name: 'Pistol Squat', difficulty: 'intense', category: 'musculacao', duration: '15 min', calories: 180, description: 'Agachamento unilateral', steps: ['Uma perna estendida', 'Desça controladamente', 'Suba sem apoio'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=300&fit=crop' },
  { id: 'int-23', name: 'Farmers Walk Pesado', difficulty: 'intense', category: 'musculacao', duration: '12 min', calories: 220, description: 'Caminhada com pesos pesados', steps: ['Segure pesos pesados', 'Caminhe rápido', 'Mantenha postura'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop' },
  { id: 'int-28', name: 'Power Clean', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 300, description: 'Levantamento de potência', steps: ['Barra do chão', 'Puxada explosiva', 'Receba em agachamento parcial'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-29', name: 'Front Squat Pesado', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 280, description: 'Agachamento frontal com carga', steps: ['Barra no ombro', 'Desça profundo', 'Suba mantendo peito alto'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=300&fit=crop' },
  { id: 'int-30', name: 'Deadlift Pesado', difficulty: 'intense', category: 'musculacao', duration: '25 min', calories: 350, description: 'Levantamento terra com carga máxima', steps: ['Barra junto às canelas', 'Levante com quadril', 'Estenda completamente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop' },
  { id: 'int-31', name: 'Overhead Squat', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 280, description: 'Agachamento com barra acima', steps: ['Barra acima da cabeça', 'Desça mantendo braços', 'Suba controladamente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-32', name: 'Rope Climb', difficulty: 'intense', category: 'musculacao', duration: '15 min', calories: 250, description: 'Subida na corda', steps: ['Técnica de pés', 'Puxe com braços', 'Desça controladamente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400&h=300&fit=crop' },
  { id: 'int-36', name: 'Ring Muscle Up', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 280, description: 'Muscle up nas argolas', steps: ['Balanço controlado', 'Puxada e transição', 'Extensão acima'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  { id: 'int-37', name: 'Strict Press Pesado', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 250, description: 'Desenvolvimento militar pesado', steps: ['Barra no peito', 'Empurre acima', 'Desça controladamente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop' },
  { id: 'int-38', name: 'Bench Press Pesado', difficulty: 'intense', category: 'musculacao', duration: '25 min', calories: 300, description: 'Supino com carga máxima', steps: ['Deite no banco', 'Desça a barra ao peito', 'Empurre explosivamente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop' },
  { id: 'int-39', name: 'Weighted Pull Ups', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 280, description: 'Barra fixa com peso', steps: ['Coloque cinto de peso', 'Puxe até o queixo', 'Desça controladamente'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400&h=300&fit=crop' },
  { id: 'int-40', name: 'Weighted Dips', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 260, description: 'Paralelas com peso', steps: ['Coloque peso no cinto', 'Desça flexionando', 'Suba com força'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
  { id: 'int-41', name: 'Sandbag Training', difficulty: 'intense', category: 'musculacao', duration: '25 min', calories: 350, description: 'Treino com saco de areia', steps: ['Cleans com saco', 'Carregadas', 'Arremessos'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-42', name: 'Atlas Stones', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 320, description: 'Levantamento de pedras atlas', steps: ['Envolva a pedra', 'Levante ao colo', 'Coloque na plataforma'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop' },
  { id: 'int-43', name: 'Yoke Walk', difficulty: 'intense', category: 'musculacao', duration: '15 min', calories: 280, description: 'Caminhada com estrutura pesada', steps: ['Posicione nos ombros', 'Caminhe rápido', 'Mantenha estabilidade'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop' },
  { id: 'int-44', name: 'Log Press', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 300, description: 'Desenvolvimento com tronco', steps: ['Clean do tronco', 'Posicione no peito', 'Empurre acima'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop' },
  { id: 'int-45', name: 'Axle Bar Deadlift', difficulty: 'intense', category: 'musculacao', duration: '20 min', calories: 320, description: 'Terra com barra grossa', steps: ['Pegada mista ou hook', 'Levante do chão', 'Travamento completo'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop' },
  { id: 'int-46', name: 'Kipping Pull Up', difficulty: 'intense', category: 'musculacao', duration: '15 min', calories: 220, description: 'Barra com balanço', steps: ['Balanço tipo arco', 'Puxe explosivamente', 'Use momentum'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400&h=300&fit=crop' },
  { id: 'int-47', name: 'Butterfly Pull Up', difficulty: 'intense', category: 'musculacao', duration: '15 min', calories: 240, description: 'Barra fixa contínua rápida', steps: ['Movimento circular', 'Ritmo constante', 'Respiração adequada'], recommendedFor: ['underweight', 'normal'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
];

export const getExercisesByDifficulty = (difficulty: 'easy' | 'moderate' | 'intense'): Exercise[] =>
  exercises.filter(e => e.difficulty === difficulty);

export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] =>
  exercises.filter(e => e.category === category);

export const getExercisesByDifficultyAndCategory = (
  difficulty: 'easy' | 'moderate' | 'intense', 
  category?: ExerciseCategory
): Exercise[] => {
  let result = exercises.filter(e => e.difficulty === difficulty);
  if (category) {
    result = result.filter(e => e.category === category);
  }
  return result;
};

export const getCategoriesForDifficulty = (difficulty: 'easy' | 'moderate' | 'intense'): ExerciseCategory[] => {
  const exercisesForDifficulty = exercises.filter(e => e.difficulty === difficulty);
  const categories = [...new Set(exercisesForDifficulty.map(e => e.category))];
  return categories;
};

// Novas funções para filtrar por IMC

export const getExercisesForIMCCategory = (imcCategory: IMCCategory): Exercise[] => {
  return exercises.filter(e => 
    e.recommendedFor?.includes(imcCategory) ?? true
  );
};

export const getRecommendedExercises = (
  imcCategory: IMCCategory,
  difficulty?: 'easy' | 'moderate' | 'intense'
): Exercise[] => {
  let result = exercises.filter(e => 
    e.recommendedFor?.includes(imcCategory) ?? false
  );
  if (difficulty) {
    result = result.filter(e => e.difficulty === difficulty);
  }
  return result;
};

export const getRecommendedExercisesForDifficultyAndCategory = (
  imcCategory: IMCCategory,
  difficulty: 'easy' | 'moderate' | 'intense',
  category?: ExerciseCategory
): Exercise[] => {
  let result = exercises.filter(e => 
    e.difficulty === difficulty && 
    (e.recommendedFor?.includes(imcCategory) ?? false)
  );
  if (category) {
    result = result.filter(e => e.category === category);
  }
  return result;
};

export const getCategoriesForDifficultyAndIMC = (
  difficulty: 'easy' | 'moderate' | 'intense',
  imcCategory: IMCCategory
): ExerciseCategory[] => {
  const exercisesForDifficultyAndIMC = exercises.filter(e => 
    e.difficulty === difficulty && 
    (e.recommendedFor?.includes(imcCategory) ?? false)
  );
  const categories = [...new Set(exercisesForDifficultyAndIMC.map(e => e.category))];
  return categories;
};

// Descrições de recomendação por IMC
export const getIMCExerciseRecommendation = (imcCategory: IMCCategory): { title: string; description: string; tip: string } => {
  switch (imcCategory) {
    case 'underweight':
      return {
        title: 'Exercícios para Ganho de Massa',
        description: 'Foque em exercícios de baixo impacto e fortalecimento muscular.',
        tip: 'Yoga, pilates e musculação leve são ideais para você.'
      };
    case 'normal':
      return {
        title: 'Mantenha seu Ritmo',
        description: 'Você tem flexibilidade para praticar diversos tipos de exercícios.',
        tip: 'Varie entre cardio e força para manter o condicionamento.'
      };
    case 'overweight':
      return {
        title: 'Exercícios de Baixo Impacto',
        description: 'Priorize exercícios que protejam suas articulações.',
        tip: 'Natação, hidroginástica e caminhada são excelentes opções.'
      };
    case 'obese':
      return {
        title: 'Comece Devagar e Seguro',
        description: 'Exercícios aquáticos e sentados são os mais seguros para começar.',
        tip: 'Hidroginástica e exercícios na cadeira reduzem impacto nas articulações.'
      };
    default:
      return {
        title: 'Exercícios Personalizados',
        description: 'Complete seu perfil para receber recomendações personalizadas.',
        tip: 'Atualize seu peso e altura para melhores sugestões.'
      };
  }
};
