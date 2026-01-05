import { Recipe, IMCCategory } from '@/types';

// ============= RECEITAS PARA ABAIXO DO PESO (Ganho de massa) =============
const underweightRecipes: Recipe[] = [
  // MANHÃ - Receitas calóricas e nutritivas para ganho de peso
  { id: 'uw-1', name: 'Vitamina Hipercalórica de Banana', category: 'underweight', mealTime: 'morning', ingredients: ['2 bananas maduras', '300ml de leite integral', '3 colheres de aveia', '2 colheres de pasta de amendoim', '1 colher de mel', 'Whey protein (opcional)'], instructions: ['Bata todos os ingredientes no liquidificador', 'Adicione gelo se preferir gelado', 'Sirva imediatamente'], calories: 650, prepTime: '5 min' },
  { id: 'uw-2', name: 'Panqueca Proteica com Manteiga', category: 'underweight', mealTime: 'morning', ingredients: ['2 ovos inteiros', '1 banana', '4 colheres de aveia', '2 colheres de whey', '1 colher de manteiga', 'Mel para cobrir'], instructions: ['Bata tudo no liquidificador', 'Frite em manteiga até dourar', 'Cubra com mel e frutas'], calories: 580, prepTime: '12 min' },
  { id: 'uw-3', name: 'Mingau de Aveia Cremoso', category: 'underweight', mealTime: 'morning', ingredients: ['1 xícara de aveia', '2 xícaras de leite integral', '2 colheres de leite condensado', '1 banana picada', 'Castanhas picadas', 'Canela'], instructions: ['Cozinhe aveia com leite em fogo médio', 'Adicione leite condensado', 'Finalize com banana e castanhas'], calories: 620, prepTime: '15 min' },
  { id: 'uw-4', name: 'Torrada Francesa Recheada', category: 'underweight', mealTime: 'morning', ingredients: ['4 fatias de pão de forma', '2 ovos', '100ml de leite', 'Cream cheese', 'Geleia de frutas', 'Manteiga'], instructions: ['Misture ovos e leite', 'Passe o pão na mistura', 'Frite na manteiga e recheie com cream cheese'], calories: 550, prepTime: '15 min' },
  { id: 'uw-5', name: 'Bowl de Açaí Energético', category: 'underweight', mealTime: 'morning', ingredients: ['200g de açaí', '1 banana', 'Granola', 'Leite condensado', 'Paçoca', 'Leite em pó'], instructions: ['Bata o açaí com banana', 'Cubra com granola e paçoca', 'Finalize com leite condensado'], calories: 680, prepTime: '8 min' },
  { id: 'uw-6', name: 'Omelete Recheada Completa', category: 'underweight', mealTime: 'morning', ingredients: ['4 ovos', 'Queijo muçarela', 'Presunto', 'Tomate', 'Cebola', 'Manteiga'], instructions: ['Bata os ovos e frite na manteiga', 'Adicione queijo, presunto e vegetais', 'Dobre e sirva com pão'], calories: 520, prepTime: '10 min' },
  { id: 'uw-7', name: 'Waffle com Pasta de Amendoim', category: 'underweight', mealTime: 'morning', ingredients: ['Massa de waffle', '3 colheres de pasta de amendoim', 'Banana fatiada', 'Mel', 'Granola', 'Chocolate amargo'], instructions: ['Prepare o waffle na máquina', 'Espalhe pasta de amendoim', 'Decore com banana e chocolate'], calories: 600, prepTime: '12 min' },
  
  // TARDE - Almoços substanciais
  { id: 'uw-8', name: 'Macarrão à Bolonhesa Reforçado', category: 'underweight', mealTime: 'afternoon', ingredients: ['200g de macarrão', '200g de carne moída', 'Molho de tomate', 'Queijo parmesão', 'Azeite', 'Cebola e alho'], instructions: ['Cozinhe o macarrão al dente', 'Prepare o molho com carne', 'Misture e cubra com queijo'], calories: 750, prepTime: '30 min' },
  { id: 'uw-9', name: 'Arroz com Feijão e Bife Acebolado', category: 'underweight', mealTime: 'afternoon', ingredients: ['Arroz branco', 'Feijão carioca', '200g de bife', 'Cebola', 'Batata frita', 'Ovo frito'], instructions: ['Prepare arroz e feijão', 'Grelhe o bife com cebola', 'Monte o prato completo'], calories: 850, prepTime: '40 min' },
  { id: 'uw-10', name: 'Lasanha de Carne', category: 'underweight', mealTime: 'afternoon', ingredients: ['Massa de lasanha', 'Carne moída', 'Molho branco', 'Molho de tomate', 'Queijo muçarela', 'Presunto'], instructions: ['Monte em camadas na forma', 'Intercale molhos e recheios', 'Asse por 40 minutos'], calories: 800, prepTime: '60 min' },
  { id: 'uw-11', name: 'Strogonoff de Frango com Batata', category: 'underweight', mealTime: 'afternoon', ingredients: ['400g de frango', 'Creme de leite', 'Champignon', 'Ketchup', 'Mostarda', 'Batata palha'], instructions: ['Refogue o frango em cubos', 'Adicione creme e temperos', 'Sirva com arroz e batata palha'], calories: 720, prepTime: '35 min' },
  { id: 'uw-12', name: 'Feijoada Light', category: 'underweight', mealTime: 'afternoon', ingredients: ['Feijão preto', 'Carne seca', 'Linguiça', 'Bacon', 'Couve', 'Farofa'], instructions: ['Cozinhe o feijão com carnes', 'Prepare couve refogada', 'Sirva com arroz e farofa'], calories: 900, prepTime: '120 min' },
  { id: 'uw-13', name: 'Escondidinho de Carne Seca', category: 'underweight', mealTime: 'afternoon', ingredients: ['Purê de mandioca', 'Carne seca desfiada', 'Queijo coalho', 'Manteiga', 'Cebola', 'Pimenta'], instructions: ['Prepare o purê cremoso', 'Refogue a carne seca', 'Monte e gratine no forno'], calories: 780, prepTime: '50 min' },
  { id: 'uw-14', name: 'Risoto de Camarão', category: 'underweight', mealTime: 'afternoon', ingredients: ['Arroz arbóreo', 'Camarões', 'Vinho branco', 'Manteiga', 'Parmesão', 'Caldo de peixe'], instructions: ['Refogue o arroz na manteiga', 'Adicione vinho e caldo aos poucos', 'Finalize com camarões'], calories: 700, prepTime: '45 min' },
  
  // NOITE - Jantares nutritivos
  { id: 'uw-15', name: 'Pizza Caseira de Frango', category: 'underweight', mealTime: 'night', ingredients: ['Massa de pizza', 'Frango desfiado', 'Catupiry', 'Milho', 'Muçarela', 'Orégano'], instructions: ['Abra a massa na forma', 'Adicione recheios', 'Asse até dourar'], calories: 680, prepTime: '40 min' },
  { id: 'uw-16', name: 'Hambúrguer Artesanal', category: 'underweight', mealTime: 'night', ingredients: ['Pão brioche', 'Hambúrguer 180g', 'Queijo cheddar', 'Bacon', 'Alface', 'Tomate'], instructions: ['Grelhe o hambúrguer', 'Monte com todos ingredientes', 'Sirva com batata'], calories: 750, prepTime: '25 min' },
  { id: 'uw-17', name: 'Frango à Parmegiana', category: 'underweight', mealTime: 'night', ingredients: ['Peito de frango', 'Farinha de rosca', 'Molho de tomate', 'Queijo muçarela', 'Presunto', 'Arroz'], instructions: ['Empane e frite o frango', 'Cubra com molho e queijo', 'Gratine e sirva'], calories: 720, prepTime: '35 min' },
  { id: 'uw-18', name: 'Massa ao Molho Alfredo', category: 'underweight', mealTime: 'night', ingredients: ['Fettuccine', 'Creme de leite', 'Manteiga', 'Parmesão', 'Bacon', 'Alho'], instructions: ['Cozinhe a massa', 'Prepare molho com creme e queijo', 'Misture com bacon crocante'], calories: 700, prepTime: '25 min' },
  { id: 'uw-19', name: 'Nhoque de Batata Gratinado', category: 'underweight', mealTime: 'night', ingredients: ['Nhoque de batata', 'Molho branco', 'Queijo gruyère', 'Manteiga', 'Noz moscada', 'Salsinha'], instructions: ['Cozinhe o nhoque', 'Cubra com molho branco', 'Gratine com queijo'], calories: 650, prepTime: '30 min' },
  { id: 'uw-20', name: 'Costela ao Molho Barbecue', category: 'underweight', mealTime: 'night', ingredients: ['Costela bovina', 'Molho barbecue', 'Mel', 'Cebola caramelizada', 'Batata assada', 'Ervas'], instructions: ['Asse a costela lentamente', 'Pincele molho barbecue', 'Sirva com batatas'], calories: 850, prepTime: '180 min' },
  { id: 'uw-21', name: 'Espaguete à Carbonara', category: 'underweight', mealTime: 'night', ingredients: ['Espaguete', 'Bacon', 'Gemas', 'Parmesão', 'Pimenta preta', 'Azeite'], instructions: ['Cozinhe a massa al dente', 'Frite o bacon', 'Misture com gemas e queijo'], calories: 680, prepTime: '20 min' },
];

// ============= RECEITAS PARA PESO NORMAL (Manutenção) =============
const normalRecipes: Recipe[] = [
  // MANHÃ - Café da manhã equilibrado
  { id: 'nm-1', name: 'Tigela de Açaí Funcional', category: 'normal', mealTime: 'morning', ingredients: ['150g de açaí sem açúcar', '1 banana', 'Granola integral', 'Chia', 'Morango', 'Mel'], instructions: ['Bata açaí com banana', 'Adicione toppings nutritivos', 'Consuma imediatamente'], calories: 380, prepTime: '8 min' },
  { id: 'nm-2', name: 'Ovos Mexidos com Abacate', category: 'normal', mealTime: 'morning', ingredients: ['2 ovos', '1/2 abacate', 'Pão integral', 'Tomate cereja', 'Sal e pimenta', 'Cebolinha'], instructions: ['Mexa os ovos em fogo baixo', 'Torre o pão', 'Monte com abacate e tomate'], calories: 420, prepTime: '10 min' },
  { id: 'nm-3', name: 'Smoothie Verde Detox', category: 'normal', mealTime: 'morning', ingredients: ['Couve', 'Banana', 'Maçã verde', 'Gengibre', 'Água de coco', 'Limão'], instructions: ['Bata todos ingredientes', 'Coe se preferir', 'Beba gelado'], calories: 180, prepTime: '5 min' },
  { id: 'nm-4', name: 'Panqueca de Banana e Aveia', category: 'normal', mealTime: 'morning', ingredients: ['1 banana', '2 ovos', '3 colheres de aveia', 'Canela', 'Mel', 'Frutas frescas'], instructions: ['Amasse a banana e misture ovos', 'Adicione aveia e canela', 'Frite em frigideira antiaderente'], calories: 320, prepTime: '12 min' },
  { id: 'nm-5', name: 'Iogurte com Frutas e Granola', category: 'normal', mealTime: 'morning', ingredients: ['200g iogurte natural', 'Granola integral', 'Banana', 'Morango', 'Mel', 'Chia'], instructions: ['Coloque iogurte na tigela', 'Adicione frutas picadas', 'Finalize com granola e mel'], calories: 350, prepTime: '5 min' },
  { id: 'nm-6', name: 'Tapioca com Queijo e Orégano', category: 'normal', mealTime: 'morning', ingredients: ['3 colheres de tapioca', 'Queijo branco', 'Orégano', 'Azeite', 'Tomate'], instructions: ['Hidrate a tapioca', 'Espalhe na frigideira quente', 'Recheie e dobre'], calories: 280, prepTime: '10 min' },
  { id: 'nm-7', name: 'Overnight Oats', category: 'normal', mealTime: 'morning', ingredients: ['1/2 xícara aveia', '150ml leite', 'Iogurte', 'Chia', 'Frutas vermelhas', 'Mel'], instructions: ['Misture aveia, leite e iogurte', 'Deixe na geladeira de um dia pro outro', 'Adicione frutas ao servir'], calories: 340, prepTime: '5 min + descanso' },
  
  // TARDE - Almoço balanceado
  { id: 'nm-8', name: 'Bowl de Quinoa Mediterrâneo', category: 'normal', mealTime: 'afternoon', ingredients: ['Quinoa cozida', 'Grão de bico', 'Pepino', 'Tomate', 'Azeitona', 'Feta', 'Azeite'], instructions: ['Cozinhe a quinoa', 'Monte com todos ingredientes', 'Tempere com azeite e limão'], calories: 420, prepTime: '25 min' },
  { id: 'nm-9', name: 'Frango Grelhado com Legumes', category: 'normal', mealTime: 'afternoon', ingredients: ['Peito de frango', 'Brócolis', 'Cenoura', 'Abobrinha', 'Azeite', 'Ervas'], instructions: ['Grelhe o frango temperado', 'Cozinhe legumes no vapor', 'Sirva com arroz integral'], calories: 450, prepTime: '30 min' },
  { id: 'nm-10', name: 'Salada de Salmão Grelhado', category: 'normal', mealTime: 'afternoon', ingredients: ['Filé de salmão', 'Mix de folhas', 'Abacate', 'Tomate', 'Cebola roxa', 'Molho de limão'], instructions: ['Grelhe o salmão', 'Monte a salada com folhas', 'Finalize com molho cítrico'], calories: 480, prepTime: '20 min' },
  { id: 'nm-11', name: 'Wrap Integral de Atum', category: 'normal', mealTime: 'afternoon', ingredients: ['Wrap integral', 'Atum em água', 'Cream cheese light', 'Rúcula', 'Tomate', 'Cebola'], instructions: ['Misture atum com cream cheese', 'Espalhe no wrap', 'Adicione vegetais e enrole'], calories: 380, prepTime: '12 min' },
  { id: 'nm-12', name: 'Arroz Integral com Lentilha', category: 'normal', mealTime: 'afternoon', ingredients: ['Arroz integral', 'Lentilha', 'Cebola caramelizada', 'Azeite', 'Salsinha', 'Alho'], instructions: ['Cozinhe arroz e lentilha', 'Refogue cebola até dourar', 'Misture tudo com ervas'], calories: 400, prepTime: '35 min' },
  { id: 'nm-13', name: 'Poke Bowl de Salmão', category: 'normal', mealTime: 'afternoon', ingredients: ['Salmão cru em cubos', 'Arroz japonês', 'Pepino', 'Edamame', 'Abacate', 'Molho shoyu'], instructions: ['Prepare arroz de sushi', 'Corte salmão em cubos', 'Monte o bowl colorido'], calories: 460, prepTime: '25 min' },
  { id: 'nm-14', name: 'Macarrão Integral ao Pesto', category: 'normal', mealTime: 'afternoon', ingredients: ['Macarrão integral', 'Manjericão', 'Parmesão', 'Azeite', 'Castanha', 'Alho'], instructions: ['Cozinhe a massa', 'Bata ingredientes do pesto', 'Misture e sirva'], calories: 440, prepTime: '20 min' },
  
  // NOITE - Jantar leve e nutritivo
  { id: 'nm-15', name: 'Peixe Assado com Ervas', category: 'normal', mealTime: 'night', ingredients: ['Filé de pescada', 'Limão', 'Alho', 'Ervas finas', 'Azeite', 'Legumes assados'], instructions: ['Tempere o peixe', 'Asse com legumes', 'Finalize com limão'], calories: 350, prepTime: '30 min' },
  { id: 'nm-16', name: 'Sopa de Legumes com Frango', category: 'normal', mealTime: 'night', ingredients: ['Peito de frango', 'Cenoura', 'Batata', 'Abobrinha', 'Cebola', 'Salsão'], instructions: ['Cozinhe frango e desfie', 'Adicione legumes', 'Cozinhe até ficar macio'], calories: 320, prepTime: '40 min' },
  { id: 'nm-17', name: 'Omelete de Legumes', category: 'normal', mealTime: 'night', ingredients: ['3 ovos', 'Espinafre', 'Tomate', 'Queijo branco', 'Cebola', 'Ervas'], instructions: ['Bata os ovos', 'Adicione vegetais', 'Frite até dourar'], calories: 280, prepTime: '12 min' },
  { id: 'nm-18', name: 'Frango ao Curry Light', category: 'normal', mealTime: 'night', ingredients: ['Peito de frango', 'Curry', 'Iogurte natural', 'Cebola', 'Arroz basmati', 'Coentro'], instructions: ['Refogue frango com curry', 'Adicione iogurte', 'Sirva com arroz'], calories: 380, prepTime: '25 min' },
  { id: 'nm-19', name: 'Salada Quente de Legumes', category: 'normal', mealTime: 'night', ingredients: ['Berinjela', 'Abobrinha', 'Pimentão', 'Cebola', 'Azeite', 'Queijo de cabra'], instructions: ['Grelhe os legumes', 'Monte na travessa', 'Finalize com queijo'], calories: 300, prepTime: '25 min' },
  { id: 'nm-20', name: 'Creme de Abóbora com Gengibre', category: 'normal', mealTime: 'night', ingredients: ['Abóbora cabotiá', 'Gengibre', 'Cebola', 'Leite de coco light', 'Curry', 'Semente de abóbora'], instructions: ['Cozinhe abóbora', 'Bata com gengibre', 'Sirva com sementes'], calories: 250, prepTime: '35 min' },
  { id: 'nm-21', name: 'Tilápia Grelhada com Purê', category: 'normal', mealTime: 'night', ingredients: ['Filé de tilápia', 'Batata doce', 'Limão', 'Alho', 'Azeite', 'Ervas'], instructions: ['Grelhe o peixe', 'Prepare purê de batata doce', 'Sirva juntos'], calories: 360, prepTime: '30 min' },
];

// ============= RECEITAS PARA SOBREPESO (Emagrecimento) =============
const overweightRecipes: Recipe[] = [
  // MANHÃ - Café da manhã low carb
  { id: 'ow-1', name: 'Omelete de Claras com Espinafre', category: 'overweight', mealTime: 'morning', ingredients: ['4 claras de ovo', 'Espinafre', 'Tomate cereja', 'Cebola', 'Azeite spray', 'Sal e pimenta'], instructions: ['Bata as claras', 'Adicione espinafre picado', 'Frite sem óleo'], calories: 140, prepTime: '10 min' },
  { id: 'ow-2', name: 'Smoothie Proteico Verde', category: 'overweight', mealTime: 'morning', ingredients: ['Couve', 'Pepino', 'Limão', 'Gengibre', 'Água', 'Hortelã'], instructions: ['Bata todos ingredientes', 'Coe se desejar', 'Beba gelado'], calories: 80, prepTime: '5 min' },
  { id: 'ow-3', name: 'Iogurte Desnatado com Chia', category: 'overweight', mealTime: 'morning', ingredients: ['200g iogurte desnatado', '1 colher de chia', 'Morango', 'Canela', 'Stevia'], instructions: ['Misture iogurte com chia', 'Adicione frutas picadas', 'Polvilhe canela'], calories: 150, prepTime: '5 min' },
  { id: 'ow-4', name: 'Crepioca Fit', category: 'overweight', mealTime: 'morning', ingredients: ['2 colheres de tapioca', '1 ovo', 'Queijo cottage', 'Tomate', 'Orégano'], instructions: ['Misture tapioca e ovo', 'Espalhe na frigideira', 'Recheie com cottage'], calories: 180, prepTime: '10 min' },
  { id: 'ow-5', name: 'Vitamina de Mamão Light', category: 'overweight', mealTime: 'morning', ingredients: ['1 fatia de mamão', 'Leite desnatado', 'Aveia', 'Linhaça', 'Canela'], instructions: ['Bata mamão com leite', 'Adicione aveia e linhaça', 'Sirva sem coar'], calories: 160, prepTime: '5 min' },
  { id: 'ow-6', name: 'Panqueca de Espinafre', category: 'overweight', mealTime: 'morning', ingredients: ['1 ovo', '2 claras', 'Espinafre batido', 'Aveia', 'Sal'], instructions: ['Bata tudo no liquidificador', 'Frite sem óleo', 'Recheie com cottage'], calories: 170, prepTime: '12 min' },
  { id: 'ow-7', name: 'Mingau de Aveia com Maçã', category: 'overweight', mealTime: 'morning', ingredients: ['3 colheres de aveia', 'Água', 'Maçã picada', 'Canela', 'Stevia'], instructions: ['Cozinhe aveia com água', 'Adicione maçã', 'Finalize com canela'], calories: 180, prepTime: '10 min' },
  
  // TARDE - Almoço para emagrecer
  { id: 'ow-8', name: 'Salada de Frango Desfiado', category: 'overweight', mealTime: 'afternoon', ingredients: ['Peito de frango grelhado', 'Mix de folhas', 'Tomate', 'Pepino', 'Cenoura', 'Limão'], instructions: ['Grelhe e desfie o frango', 'Monte com vegetais frescos', 'Tempere com limão'], calories: 280, prepTime: '25 min' },
  { id: 'ow-9', name: 'Peixe no Vapor com Brócolis', category: 'overweight', mealTime: 'afternoon', ingredients: ['Filé de tilápia', 'Brócolis', 'Limão', 'Gengibre', 'Molho shoyu light', 'Cebolinha'], instructions: ['Cozinhe peixe no vapor', 'Prepare brócolis al dente', 'Tempere com shoyu e limão'], calories: 220, prepTime: '20 min' },
  { id: 'ow-10', name: 'Wrap de Alface com Peru', category: 'overweight', mealTime: 'afternoon', ingredients: ['Folhas de alface americana', 'Peito de peru', 'Cream cheese light', 'Tomate', 'Cenoura ralada'], instructions: ['Use alface como wrap', 'Recheie com peru e vegetais', 'Enrole e sirva'], calories: 180, prepTime: '10 min' },
  { id: 'ow-11', name: 'Sopa Detox de Legumes', category: 'overweight', mealTime: 'afternoon', ingredients: ['Abobrinha', 'Brócolis', 'Couve-flor', 'Cebola', 'Alho', 'Gengibre'], instructions: ['Cozinhe legumes', 'Bata no liquidificador', 'Tempere com gengibre'], calories: 120, prepTime: '30 min' },
  { id: 'ow-12', name: 'Atum Grelhado com Salada', category: 'overweight', mealTime: 'afternoon', ingredients: ['Filé de atum', 'Mix de folhas', 'Rabanete', 'Pepino', 'Gergelim', 'Molho de gengibre'], instructions: ['Grelhe o atum selado', 'Monte salada fresca', 'Finalize com gergelim'], calories: 260, prepTime: '15 min' },
  { id: 'ow-13', name: 'Couve-Flor Gratinada Light', category: 'overweight', mealTime: 'afternoon', ingredients: ['Couve-flor', 'Ricota', 'Queijo cottage', 'Orégano', 'Sal', 'Pimenta'], instructions: ['Cozinhe couve-flor', 'Cubra com ricota', 'Gratine rapidamente'], calories: 200, prepTime: '25 min' },
  { id: 'ow-14', name: 'Frango ao Limão com Aspargos', category: 'overweight', mealTime: 'afternoon', ingredients: ['Peito de frango', 'Aspargos', 'Limão siciliano', 'Alho', 'Azeite spray', 'Ervas'], instructions: ['Grelhe frango com limão', 'Cozinhe aspargos', 'Sirva juntos'], calories: 250, prepTime: '25 min' },
  
  // NOITE - Jantar leve
  { id: 'ow-15', name: 'Sopa de Abóbora com Gengibre', category: 'overweight', mealTime: 'night', ingredients: ['Abóbora cabotiá', 'Gengibre', 'Cebola', 'Alho', 'Caldo de legumes', 'Coentro'], instructions: ['Cozinhe abóbora', 'Bata com gengibre', 'Sirva com coentro'], calories: 140, prepTime: '30 min' },
  { id: 'ow-16', name: 'Omelete de Claras com Cogumelos', category: 'overweight', mealTime: 'night', ingredients: ['4 claras', 'Cogumelos shimeji', 'Espinafre', 'Cebola', 'Azeite spray', 'Ervas'], instructions: ['Refogue cogumelos', 'Adicione claras batidas', 'Finalize com ervas'], calories: 130, prepTime: '15 min' },
  { id: 'ow-17', name: 'Salada de Atum com Folhas', category: 'overweight', mealTime: 'night', ingredients: ['Atum em água', 'Rúcula', 'Tomate', 'Ovo cozido', 'Azeitona', 'Limão'], instructions: ['Monte salada com folhas', 'Adicione atum e ovo', 'Tempere com limão'], calories: 200, prepTime: '10 min' },
  { id: 'ow-18', name: 'Caldo Verde Light', category: 'overweight', mealTime: 'night', ingredients: ['Couve picada', 'Batata pequena', 'Cebola', 'Alho', 'Azeite', 'Sal'], instructions: ['Cozinhe batata', 'Adicione couve', 'Sirva fumegante'], calories: 150, prepTime: '25 min' },
  { id: 'ow-19', name: 'Peixe ao Forno com Legumes', category: 'overweight', mealTime: 'night', ingredients: ['Filé de pescada', 'Abobrinha', 'Berinjela', 'Pimentão', 'Limão', 'Ervas'], instructions: ['Tempere o peixe', 'Asse com legumes', 'Finalize com limão'], calories: 220, prepTime: '35 min' },
  { id: 'ow-20', name: 'Creme de Brócolis', category: 'overweight', mealTime: 'night', ingredients: ['Brócolis', 'Cebola', 'Alho', 'Leite desnatado', 'Noz moscada', 'Sal'], instructions: ['Cozinhe brócolis', 'Bata com leite', 'Tempere e sirva'], calories: 120, prepTime: '20 min' },
  { id: 'ow-21', name: 'Berinjela Recheada Fit', category: 'overweight', mealTime: 'night', ingredients: ['Berinjela', 'Frango desfiado', 'Tomate', 'Cebola', 'Queijo cottage', 'Orégano'], instructions: ['Asse berinjela cortada', 'Recheie com frango', 'Gratine com cottage'], calories: 180, prepTime: '40 min' },
];

// ============= RECEITAS PARA OBESIDADE (Alimentação muito leve) =============
const obeseRecipes: Recipe[] = [
  // MANHÃ - Café da manhã muito leve
  { id: 'ob-1', name: 'Chá Verde com Limão', category: 'obese', mealTime: 'morning', ingredients: ['Chá verde', 'Limão', 'Gengibre ralado', 'Hortelã', 'Água quente'], instructions: ['Prepare o chá', 'Adicione limão e gengibre', 'Beba morno'], calories: 10, prepTime: '5 min' },
  { id: 'ob-2', name: 'Água Aromatizada Detox', category: 'obese', mealTime: 'morning', ingredients: ['Água gelada', 'Pepino', 'Limão', 'Hortelã', 'Gengibre'], instructions: ['Corte frutas e ervas', 'Deixe na água gelada', 'Beba ao longo da manhã'], calories: 15, prepTime: '5 min' },
  { id: 'ob-3', name: 'Suco Verde Detox', category: 'obese', mealTime: 'morning', ingredients: ['Couve', 'Pepino', 'Salsão', 'Limão', 'Água', 'Gengibre'], instructions: ['Bata todos ingredientes', 'Coe bem', 'Beba imediatamente'], calories: 45, prepTime: '8 min' },
  { id: 'ob-4', name: 'Iogurte Natural com Linhaça', category: 'obese', mealTime: 'morning', ingredients: ['150g iogurte desnatado', '1 colher de linhaça', 'Canela', 'Stevia'], instructions: ['Misture iogurte com linhaça', 'Adicione canela', 'Adoce se necessário'], calories: 100, prepTime: '3 min' },
  { id: 'ob-5', name: 'Ovo Cozido com Tomate', category: 'obese', mealTime: 'morning', ingredients: ['1 ovo cozido', 'Tomate fatiado', 'Sal', 'Orégano', 'Azeite (gotas)'], instructions: ['Cozinhe o ovo', 'Sirva com tomate', 'Tempere levemente'], calories: 90, prepTime: '12 min' },
  { id: 'ob-6', name: 'Frutas com Chia', category: 'obese', mealTime: 'morning', ingredients: ['Mamão', 'Morango', 'Chia', 'Limão', 'Hortelã'], instructions: ['Corte as frutas', 'Polvilhe chia', 'Finalize com limão'], calories: 110, prepTime: '5 min' },
  { id: 'ob-7', name: 'Vitamina de Maçã e Couve', category: 'obese', mealTime: 'morning', ingredients: ['1 maçã', 'Folhas de couve', 'Água', 'Gengibre', 'Limão'], instructions: ['Bata tudo no liquidificador', 'Não adoce', 'Beba fresco'], calories: 70, prepTime: '5 min' },
  
  // TARDE - Almoço muito leve
  { id: 'ob-8', name: 'Salada Detox Completa', category: 'obese', mealTime: 'afternoon', ingredients: ['Rúcula', 'Agrião', 'Pepino', 'Tomate', 'Cenoura ralada', 'Limão'], instructions: ['Lave e seque as folhas', 'Corte os vegetais', 'Tempere apenas com limão'], calories: 80, prepTime: '10 min' },
  { id: 'ob-9', name: 'Peixe Grelhado com Limão', category: 'obese', mealTime: 'afternoon', ingredients: ['Filé de pescada', 'Limão', 'Sal', 'Ervas finas', 'Alho'], instructions: ['Tempere o peixe', 'Grelhe sem óleo', 'Sirva com limão'], calories: 150, prepTime: '15 min' },
  { id: 'ob-10', name: 'Sopa de Legumes Sem Óleo', category: 'obese', mealTime: 'afternoon', ingredients: ['Abobrinha', 'Chuchu', 'Cenoura', 'Cebola', 'Salsão', 'Salsinha'], instructions: ['Cozinhe legumes em água', 'Bata parcialmente', 'Tempere com ervas'], calories: 90, prepTime: '30 min' },
  { id: 'ob-11', name: 'Frango no Vapor com Ervas', category: 'obese', mealTime: 'afternoon', ingredients: ['Peito de frango', 'Ervas finas', 'Limão', 'Sal', 'Alho', 'Cebola'], instructions: ['Tempere o frango', 'Cozinhe no vapor', 'Sirva com salada'], calories: 160, prepTime: '25 min' },
  { id: 'ob-12', name: 'Salada de Pepino e Tomate', category: 'obese', mealTime: 'afternoon', ingredients: ['Pepino', 'Tomate', 'Cebola roxa', 'Salsa', 'Limão', 'Sal'], instructions: ['Fatie os vegetais', 'Misture delicadamente', 'Tempere com limão'], calories: 50, prepTime: '10 min' },
  { id: 'ob-13', name: 'Atum com Salada Verde', category: 'obese', mealTime: 'afternoon', ingredients: ['Atum em água', 'Alface', 'Rúcula', 'Tomate', 'Limão', 'Orégano'], instructions: ['Escorra o atum', 'Monte a salada', 'Tempere levemente'], calories: 140, prepTime: '10 min' },
  { id: 'ob-14', name: 'Caldo de Legumes Depurativo', category: 'obese', mealTime: 'afternoon', ingredients: ['Salsão', 'Couve', 'Cenoura', 'Cebola', 'Alho poró', 'Gengibre'], instructions: ['Ferva os legumes', 'Coe o caldo', 'Beba morno'], calories: 40, prepTime: '40 min' },
  
  // NOITE - Jantar muito leve
  { id: 'ob-15', name: 'Sopa de Abobrinha', category: 'obese', mealTime: 'night', ingredients: ['Abobrinha', 'Cebola', 'Alho', 'Água', 'Sal', 'Manjericão'], instructions: ['Cozinhe abobrinha', 'Bata no liquidificador', 'Finalize com manjericão'], calories: 60, prepTime: '20 min' },
  { id: 'ob-16', name: 'Salada de Folhas com Limão', category: 'obese', mealTime: 'night', ingredients: ['Mix de folhas verdes', 'Limão', 'Sal', 'Pimenta', 'Ervas frescas'], instructions: ['Lave as folhas', 'Tempere apenas com limão', 'Sirva imediatamente'], calories: 30, prepTime: '5 min' },
  { id: 'ob-17', name: 'Chá Digestivo com Ervas', category: 'obese', mealTime: 'night', ingredients: ['Camomila', 'Erva-doce', 'Hortelã', 'Água quente'], instructions: ['Ferva a água', 'Adicione as ervas', 'Deixe em infusão'], calories: 5, prepTime: '10 min' },
  { id: 'ob-18', name: 'Creme de Chuchu', category: 'obese', mealTime: 'night', ingredients: ['Chuchu', 'Cebola', 'Alho', 'Água', 'Sal', 'Cebolinha'], instructions: ['Cozinhe chuchu', 'Bata até ficar cremoso', 'Decore com cebolinha'], calories: 55, prepTime: '25 min' },
  { id: 'ob-19', name: 'Legumes no Vapor', category: 'obese', mealTime: 'night', ingredients: ['Brócolis', 'Cenoura', 'Vagem', 'Sal', 'Limão', 'Azeite (gotas)'], instructions: ['Cozinhe no vapor', 'Tempere com limão', 'Use azeite moderado'], calories: 80, prepTime: '15 min' },
  { id: 'ob-20', name: 'Sopa de Agrião', category: 'obese', mealTime: 'night', ingredients: ['Agrião', 'Batata pequena', 'Cebola', 'Alho', 'Água', 'Sal'], instructions: ['Cozinhe batata e cebola', 'Adicione agrião', 'Bata e sirva'], calories: 70, prepTime: '25 min' },
  { id: 'ob-21', name: 'Pepino com Iogurte', category: 'obese', mealTime: 'night', ingredients: ['Pepino ralado', 'Iogurte desnatado', 'Hortelã', 'Alho', 'Sal', 'Limão'], instructions: ['Rale o pepino', 'Misture com iogurte', 'Tempere com ervas'], calories: 65, prepTime: '10 min' },
];

// Exportar todas as receitas
export const recipes: Recipe[] = [
  ...underweightRecipes,
  ...normalRecipes,
  ...overweightRecipes,
  ...obeseRecipes,
];

export const getRecipesByCategory = (category: IMCCategory): Recipe[] => 
  recipes.filter(r => r.category === category);

export const getRecipesByMealTime = (category: IMCCategory, mealTime: 'morning' | 'afternoon' | 'night'): Recipe[] =>
  recipes.filter(r => r.category === category && r.mealTime === mealTime);

export const getCategoryDescription = (category: IMCCategory): string => {
  const descriptions = {
    underweight: 'Receitas calóricas e nutritivas para ganho de peso saudável',
    normal: 'Receitas equilibradas para manutenção do peso ideal',
    overweight: 'Receitas low carb para auxiliar no emagrecimento',
    obese: 'Receitas muito leves e detox para perda de peso',
  };
  return descriptions[category];
};
