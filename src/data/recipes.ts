import { Recipe, IMCCategory } from '@/types';

const createRecipes = (category: IMCCategory, prefix: string): Recipe[] => {
  const baseRecipes: Omit<Recipe, 'id' | 'category'>[] = [
    // MANHÃ
    { name: 'Mingau de Aveia com Frutas', mealTime: 'morning', ingredients: ['1 xícara de aveia', '1 xícara de leite', '1 banana', 'Mel a gosto', 'Canela'], instructions: ['Cozinhe a aveia com o leite', 'Adicione a banana picada', 'Finalize com mel e canela'], calories: category === 'underweight' ? 450 : category === 'obese' ? 280 : 350, prepTime: '15 min' },
    { name: 'Panqueca de Banana', mealTime: 'morning', ingredients: ['2 bananas', '2 ovos', '3 colheres de aveia', 'Canela a gosto'], instructions: ['Amasse as bananas', 'Misture com ovos e aveia', 'Frite em frigideira antiaderente'], calories: category === 'underweight' ? 380 : category === 'obese' ? 220 : 300, prepTime: '10 min' },
    { name: 'Smoothie Bowl Tropical', mealTime: 'morning', ingredients: ['1 banana congelada', '1/2 manga', '100ml de leite de coco', 'Granola', 'Frutas frescas'], instructions: ['Bata a banana e manga com leite', 'Despeje em uma tigela', 'Decore com granola e frutas'], calories: category === 'underweight' ? 420 : category === 'obese' ? 250 : 330, prepTime: '8 min' },
    { name: 'Tapioca com Queijo e Tomate', mealTime: 'morning', ingredients: ['3 colheres de tapioca', 'Queijo cottage', 'Tomate cereja', 'Orégano'], instructions: ['Hidrate a tapioca', 'Espalhe na frigideira quente', 'Recheie com queijo e tomate'], calories: category === 'underweight' ? 350 : category === 'obese' ? 180 : 260, prepTime: '10 min' },
    { name: 'Omelete de Vegetais', mealTime: 'morning', ingredients: ['3 ovos', 'Espinafre', 'Tomate', 'Cebola', 'Queijo branco'], instructions: ['Bata os ovos', 'Adicione os vegetais picados', 'Frite até dourar'], calories: category === 'underweight' ? 400 : category === 'obese' ? 220 : 310, prepTime: '12 min' },
    { name: 'Iogurte com Granola e Mel', mealTime: 'morning', ingredients: ['200g de iogurte natural', 'Granola sem açúcar', 'Mel', 'Frutas vermelhas'], instructions: ['Coloque o iogurte na tigela', 'Adicione granola por cima', 'Finalize com mel e frutas'], calories: category === 'underweight' ? 380 : category === 'obese' ? 200 : 280, prepTime: '5 min' },
    { name: 'Pão Integral com Abacate', mealTime: 'morning', ingredients: ['2 fatias de pão integral', '1/2 abacate', 'Sal e pimenta', 'Ovo pochê'], instructions: ['Torre o pão', 'Amasse o abacate temperado', 'Coloque o ovo por cima'], calories: category === 'underweight' ? 450 : category === 'obese' ? 280 : 360, prepTime: '10 min' },
    
    // TARDE
    { name: 'Salada Caesar Light', mealTime: 'afternoon', ingredients: ['Alface romana', 'Frango grelhado', 'Croutons integrais', 'Parmesão', 'Molho caesar light'], instructions: ['Lave e rasgue a alface', 'Grelhe o frango temperado', 'Monte com croutons e molho'], calories: category === 'underweight' ? 520 : category === 'obese' ? 320 : 420, prepTime: '20 min' },
    { name: 'Wrap de Frango', mealTime: 'afternoon', ingredients: ['Wrap integral', 'Frango desfiado', 'Cream cheese light', 'Rúcula', 'Tomate seco'], instructions: ['Espalhe o cream cheese no wrap', 'Adicione frango e vegetais', 'Enrole bem apertado'], calories: category === 'underweight' ? 480 : category === 'obese' ? 300 : 380, prepTime: '15 min' },
    { name: 'Sopa de Legumes', mealTime: 'afternoon', ingredients: ['Cenoura', 'Abobrinha', 'Batata', 'Cebola', 'Alho', 'Frango desfiado'], instructions: ['Refogue cebola e alho', 'Adicione legumes e água', 'Cozinhe e finalize com frango'], calories: category === 'underweight' ? 400 : category === 'obese' ? 220 : 300, prepTime: '35 min' },
    { name: 'Bowl de Quinoa', mealTime: 'afternoon', ingredients: ['1 xícara de quinoa', 'Grão de bico', 'Pepino', 'Tomate', 'Hortelã', 'Azeite'], instructions: ['Cozinhe a quinoa', 'Misture com grão de bico e vegetais', 'Tempere com azeite e hortelã'], calories: category === 'underweight' ? 480 : category === 'obese' ? 280 : 380, prepTime: '25 min' },
    { name: 'Sanduíche Natural', mealTime: 'afternoon', ingredients: ['Pão integral', 'Peito de peru', 'Queijo branco', 'Alface', 'Tomate', 'Cenoura ralada'], instructions: ['Monte o sanduíche em camadas', 'Adicione todos os ingredientes', 'Corte ao meio'], calories: category === 'underweight' ? 420 : category === 'obese' ? 260 : 340, prepTime: '10 min' },
    { name: 'Salada de Atum', mealTime: 'afternoon', ingredients: ['1 lata de atum', 'Folhas verdes', 'Ovo cozido', 'Tomate', 'Azeitonas', 'Azeite'], instructions: ['Escorra o atum', 'Monte a salada com folhas', 'Adicione ovo e tempere'], calories: category === 'underweight' ? 450 : category === 'obese' ? 280 : 360, prepTime: '15 min' },
    { name: 'Risoto de Cogumelos', mealTime: 'afternoon', ingredients: ['1 xícara de arroz arbóreo', 'Cogumelos variados', 'Cebola', 'Vinho branco', 'Parmesão'], instructions: ['Refogue cebola e cogumelos', 'Adicione arroz e vinho', 'Cozinhe adicionando caldo aos poucos'], calories: category === 'underweight' ? 520 : category === 'obese' ? 320 : 420, prepTime: '40 min' },
    
    // NOITE
    { name: 'Peixe Grelhado com Legumes', mealTime: 'night', ingredients: ['Filé de tilápia', 'Brócolis', 'Cenoura', 'Azeite', 'Limão', 'Ervas'], instructions: ['Tempere o peixe com limão e ervas', 'Grelhe em frigideira', 'Sirva com legumes no vapor'], calories: category === 'underweight' ? 420 : category === 'obese' ? 250 : 330, prepTime: '25 min' },
    { name: 'Frango ao Curry', mealTime: 'night', ingredients: ['Peito de frango', 'Leite de coco light', 'Curry', 'Cebola', 'Arroz integral'], instructions: ['Refogue frango com cebola', 'Adicione curry e leite de coco', 'Sirva com arroz'], calories: category === 'underweight' ? 500 : category === 'obese' ? 320 : 400, prepTime: '30 min' },
    { name: 'Espaguete de Abobrinha', mealTime: 'night', ingredients: ['2 abobrinhas', 'Molho de tomate caseiro', 'Alho', 'Manjericão', 'Queijo parmesão'], instructions: ['Corte abobrinha em tiras finas', 'Refogue com alho', 'Adicione molho e finalize com queijo'], calories: category === 'underweight' ? 280 : category === 'obese' ? 150 : 220, prepTime: '20 min' },
    { name: 'Omelete Recheada', mealTime: 'night', ingredients: ['3 ovos', 'Queijo cottage', 'Espinafre', 'Tomate', 'Cebola roxa'], instructions: ['Bata os ovos', 'Frite e recheie com ingredientes', 'Dobre e sirva'], calories: category === 'underweight' ? 380 : category === 'obese' ? 220 : 300, prepTime: '12 min' },
    { name: 'Salmão com Aspargos', mealTime: 'night', ingredients: ['Filé de salmão', 'Aspargos', 'Limão', 'Azeite', 'Alho'], instructions: ['Tempere salmão com limão', 'Grelhe com aspargos', 'Finalize com azeite'], calories: category === 'underweight' ? 480 : category === 'obese' ? 300 : 380, prepTime: '25 min' },
    { name: 'Creme de Abóbora', mealTime: 'night', ingredients: ['500g de abóbora', 'Cebola', 'Alho', 'Gengibre', 'Creme de leite light'], instructions: ['Cozinhe abóbora com temperos', 'Bata no liquidificador', 'Adicione creme e sirva'], calories: category === 'underweight' ? 320 : category === 'obese' ? 180 : 250, prepTime: '30 min' },
    { name: 'Peito de Frango Recheado', mealTime: 'night', ingredients: ['Peito de frango', 'Ricota', 'Espinafre', 'Tomate seco', 'Ervas'], instructions: ['Abra o frango ao meio', 'Recheie com ingredientes', 'Asse até dourar'], calories: category === 'underweight' ? 450 : category === 'obese' ? 280 : 360, prepTime: '35 min' },
  ];

  return baseRecipes.map((recipe, index) => ({
    ...recipe,
    id: `${prefix}-${index + 1}`,
    category,
  }));
};

export const recipes: Recipe[] = [
  ...createRecipes('underweight', 'uw'),
  ...createRecipes('normal', 'nm'),
  ...createRecipes('overweight', 'ow'),
  ...createRecipes('obese', 'ob'),
];

export const getRecipesByCategory = (category: IMCCategory): Recipe[] => 
  recipes.filter(r => r.category === category);

export const getRecipesByMealTime = (category: IMCCategory, mealTime: 'morning' | 'afternoon' | 'night'): Recipe[] =>
  recipes.filter(r => r.category === category && r.mealTime === mealTime);

export const getCategoryDescription = (category: IMCCategory): string => {
  const descriptions = {
    underweight: 'Receitas nutritivas para ganho de peso saudável',
    normal: 'Receitas equilibradas para manutenção do peso',
    overweight: 'Receitas leves para auxiliar no emagrecimento',
    obese: 'Receitas saudáveis e com baixas calorias',
  };
  return descriptions[category];
};
