
# Mover Indicacao/Afiliacao do Rodape para Configuracoes

## O que sera feito

1. **Remover o item "Indicar"** do menu de navegacao inferior (rodape), liberando espaco visual.

2. **Adicionar dois botoes na pagina de Configuracoes** logo apos o botao "Comprar meu Kit":
   - **Indicacao** - leva para `/referral` no modo de indicacao
   - **Afiliacao** - leva para `/referral` no modo de afiliacao

Os botoes terao icones distintos (Gift para Indicacao, Users para Afiliacao) e ao clicar, salvarao o modo escolhido no `localStorage` (como ja funciona hoje) e redirecionarao direto para a pagina `/referral`.

---

## Detalhes Tecnicos

### 1. Navigation.tsx
- Remover o item `{ path: '/referral', icon: Gift, label: 'Indicar', emoji: '' }` do array `navItems`

### 2. Settings.tsx
- Importar `Gift` e `Users` do lucide-react
- Adicionar dois botoes (Cards clicaveis) entre o botao "Comprar meu Kit" e o card de dica:
  - **Programa de Indicacao**: ao clicar, salva `localStorage.setItem('referral_mode', 'referral')` e navega para `/referral`
  - **Programa de Afiliacao**: ao clicar, salva `localStorage.setItem('referral_mode', 'affiliate')` e navega para `/referral`

### Arquivos modificados
- `src/components/Navigation.tsx` - remover item do rodape
- `src/pages/Settings.tsx` - adicionar dois botoes de navegacao
