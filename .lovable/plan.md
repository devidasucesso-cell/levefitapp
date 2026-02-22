
# Remover "Evolucao" do rodape e adicionar botao no Dashboard

## O que sera feito

1. **Remover o item "Evolucao" do menu inferior (rodape)**
   - No arquivo `src/components/Navigation.tsx`, remover o item `{ path: '/progress', icon: TrendingUp, label: 'Evolucao' }` da lista `navItems`
   - A pagina `/progress` continuara existindo e acessivel, apenas nao aparecera mais no rodape

2. **Adicionar botao "Evolucao" no Dashboard abaixo do Resumo do Progresso**
   - No arquivo `src/pages/Dashboard.tsx`, logo apos o componente `<ProgressSummary />`, adicionar um botao estilizado com o icone `TrendingUp` e o texto "Evolucao"
   - Ao clicar, o botao navegara para `/progress`
   - O botao so aparecera quando o ProgressSummary estiver visivel (quando o usuario ja tem IMC registrado)

## Detalhes tecnicos

### Navigation.tsx
- Remover a linha `{ path: '/progress', icon: TrendingUp, label: 'Evolucao' }` do array `navItems`
- O menu passara de 7 para 6 itens

### Dashboard.tsx
- Adicionar um `Button` com `variant="outline"` abaixo do `<ProgressSummary />`, dentro do mesmo bloco condicional que verifica `profile?.imc > 0`
- Usar `navigate('/progress')` no `onClick`
- Estilo: botao com largura total, icone `TrendingUp` e texto "Ver Evolucao Completa"
