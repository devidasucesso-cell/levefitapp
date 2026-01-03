import { DetoxDrink, IMCCategory } from '@/types';

const createDetoxDrinks = (category: IMCCategory, prefix: string): DetoxDrink[] => {
  const baseDrinks: Omit<DetoxDrink, 'id' | 'category'>[] = [
    // MANHÃ
    { name: 'Água com Limão e Gengibre', timeOfDay: 'morning', ingredients: ['500ml de água morna', 'Suco de 1 limão', '1cm de gengibre ralado'], instructions: ['Aqueça a água', 'Adicione limão e gengibre', 'Beba em jejum'], benefits: ['Acelera metabolismo', 'Desintoxica o fígado', 'Fortalece imunidade'] },
    { name: 'Chá Verde com Hortelã', timeOfDay: 'morning', ingredients: ['1 xícara de água quente', '1 sachê de chá verde', 'Folhas de hortelã'], instructions: ['Ferva a água', 'Adicione o chá e hortelã', 'Deixe em infusão 5 min'], benefits: ['Antioxidante', 'Acelera queima de gordura', 'Melhora digestão'] },
    { name: 'Suco Verde Energizante', timeOfDay: 'morning', ingredients: ['1 maçã verde', 'Couve', 'Gengibre', 'Limão', 'Água de coco'], instructions: ['Bata todos ingredientes', 'Coe se preferir', 'Consuma imediatamente'], benefits: ['Energia natural', 'Rico em fibras', 'Desintoxicante'] },
    { name: 'Chá de Hibisco com Canela', timeOfDay: 'morning', ingredients: ['1 colher de hibisco seco', '1 pau de canela', '300ml de água'], instructions: ['Ferva a água', 'Adicione hibisco e canela', 'Deixe em infusão 10 min'], benefits: ['Diurético natural', 'Reduz retenção', 'Acelera metabolismo'] },
    { name: 'Smoothie Detox de Abacaxi', timeOfDay: 'morning', ingredients: ['2 fatias de abacaxi', 'Couve', 'Gengibre', '200ml de água'], instructions: ['Bata tudo no liquidificador', 'Adicione gelo se quiser', 'Beba gelado'], benefits: ['Anti-inflamatório', 'Digestivo', 'Queima gordura'] },
    { name: 'Água Aromatizada de Pepino', timeOfDay: 'morning', ingredients: ['1 litro de água', '1/2 pepino fatiado', 'Folhas de hortelã', 'Limão'], instructions: ['Adicione todos ingredientes à água', 'Deixe na geladeira por 2h', 'Beba ao longo do dia'], benefits: ['Hidratante', 'Refrescante', 'Elimina toxinas'] },
    { name: 'Chá de Cavalinha', timeOfDay: 'morning', ingredients: ['1 colher de cavalinha seca', '300ml de água quente'], instructions: ['Ferva a água', 'Adicione a cavalinha', 'Deixe em infusão 10 min'], benefits: ['Diurético', 'Elimina inchaço', 'Rico em minerais'] },
    
    // TARDE
    { name: 'Suco de Melancia com Gengibre', timeOfDay: 'afternoon', ingredients: ['3 fatias de melancia', 'Gengibre a gosto', 'Gelo'], instructions: ['Bata a melancia com gengibre', 'Adicione gelo', 'Sirva gelado'], benefits: ['Hidratante', 'Diurético', 'Refrescante'] },
    { name: 'Chá de Carqueja', timeOfDay: 'afternoon', ingredients: ['1 colher de carqueja', '300ml de água'], instructions: ['Ferva a água', 'Adicione a carqueja', 'Deixe em infusão 10 min'], benefits: ['Digestivo', 'Desintoxica fígado', 'Reduz gordura'] },
    { name: 'Limonada Suíça com Hortelã', timeOfDay: 'afternoon', ingredients: ['2 limões', '500ml de água', 'Folhas de hortelã', 'Gelo'], instructions: ['Bata limão com casca rapidamente', 'Coe e adicione hortelã', 'Sirva com gelo'], benefits: ['Refrescante', 'Rico em vitamina C', 'Digestivo'] },
    { name: 'Suco de Couve com Maçã', timeOfDay: 'afternoon', ingredients: ['3 folhas de couve', '1 maçã', 'Suco de 1 limão', '200ml de água'], instructions: ['Bata todos ingredientes', 'Coe se preferir', 'Consuma fresco'], benefits: ['Desintoxicante', 'Rico em fibras', 'Energizante'] },
    { name: 'Chá de Gengibre e Limão', timeOfDay: 'afternoon', ingredients: ['1 pedaço de gengibre', 'Suco de 1/2 limão', '300ml de água quente'], instructions: ['Ferva água com gengibre', 'Adicione limão após ferver', 'Beba morno'], benefits: ['Termogênico', 'Anti-inflamatório', 'Acelera digestão'] },
    { name: 'Água de Coco com Limão', timeOfDay: 'afternoon', ingredients: ['300ml de água de coco', 'Suco de 1 limão', 'Gelo'], instructions: ['Misture água de coco com limão', 'Adicione gelo', 'Sirva gelado'], benefits: ['Hidratante natural', 'Rico em potássio', 'Refrescante'] },
    { name: 'Suco de Beterraba Detox', timeOfDay: 'afternoon', ingredients: ['1/2 beterraba', '1 cenoura', '1 maçã', 'Gengibre'], instructions: ['Bata todos ingredientes', 'Adicione água se necessário', 'Consuma imediatamente'], benefits: ['Rico em ferro', 'Energizante', 'Desintoxicante'] },
    
    // NOITE
    { name: 'Chá de Camomila com Mel', timeOfDay: 'night', ingredients: ['1 sachê de camomila', '300ml de água', '1 colher de mel'], instructions: ['Ferva a água', 'Adicione a camomila', 'Adoce com mel'], benefits: ['Relaxante', 'Melhora sono', 'Calmante natural'] },
    { name: 'Chá de Erva Cidreira', timeOfDay: 'night', ingredients: ['Folhas de erva cidreira', '300ml de água quente'], instructions: ['Ferva a água', 'Adicione as folhas', 'Deixe em infusão 5 min'], benefits: ['Calmante', 'Digestivo', 'Reduz ansiedade'] },
    { name: 'Golden Milk (Leite Dourado)', timeOfDay: 'night', ingredients: ['200ml de leite vegetal', '1 colher de cúrcuma', 'Pitada de pimenta', 'Mel'], instructions: ['Aqueça o leite', 'Adicione cúrcuma e pimenta', 'Adoce com mel'], benefits: ['Anti-inflamatório', 'Relaxante', 'Fortalece imunidade'] },
    { name: 'Chá de Maracujá', timeOfDay: 'night', ingredients: ['Folhas de maracujá', '300ml de água'], instructions: ['Ferva a água', 'Adicione as folhas', 'Deixe em infusão 10 min'], benefits: ['Calmante natural', 'Reduz insônia', 'Relaxa músculos'] },
    { name: 'Suco de Maracujá com Camomila', timeOfDay: 'night', ingredients: ['Polpa de 2 maracujás', 'Chá de camomila gelado', 'Mel a gosto'], instructions: ['Prepare o chá e deixe esfriar', 'Bata com polpa de maracujá', 'Adoce se necessário'], benefits: ['Calmante duplo', 'Relaxante', 'Facilita sono'] },
    { name: 'Chá de Valeriana', timeOfDay: 'night', ingredients: ['1 colher de valeriana', '300ml de água'], instructions: ['Ferva a água', 'Adicione valeriana', 'Deixe em infusão 10 min'], benefits: ['Induz sono', 'Reduz ansiedade', 'Relaxante muscular'] },
    { name: 'Leite Morno com Canela', timeOfDay: 'night', ingredients: ['200ml de leite desnatado', 'Canela em pó', 'Mel opcional'], instructions: ['Aqueça o leite', 'Adicione canela', 'Beba morno antes de dormir'], benefits: ['Relaxante', 'Aquece o corpo', 'Ajuda no sono'] },
  ];

  return baseDrinks.map((drink, index) => ({
    ...drink,
    id: `${prefix}-${index + 1}`,
    category,
  }));
};

export const detoxDrinks: DetoxDrink[] = [
  ...createDetoxDrinks('underweight', 'uw-detox'),
  ...createDetoxDrinks('normal', 'nm-detox'),
  ...createDetoxDrinks('overweight', 'ow-detox'),
  ...createDetoxDrinks('obese', 'ob-detox'),
];

export const getDetoxByCategory = (category: IMCCategory): DetoxDrink[] =>
  detoxDrinks.filter(d => d.category === category);

export const getDetoxByTimeOfDay = (category: IMCCategory, timeOfDay: 'morning' | 'afternoon' | 'night'): DetoxDrink[] =>
  detoxDrinks.filter(d => d.category === category && d.timeOfDay === timeOfDay);
