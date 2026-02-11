

# Tela de Escolha: Afiliado ou Indicar

## Resumo

Adicionar uma tela de escolha inicial na pagina `/referral` onde o usuario decide se quer ser **Afiliado** ou **Indicar amigos**. Depois de escolher, apenas a secao correspondente aparece e a outra some completamente.

## Como vai funcionar

1. Ao abrir a pagina `/referral`, o usuario vera dois cards grandes lado a lado (ou empilhados no mobile):
   - **Indicar Amigos** - com icone de presente e descricao "Ganhe R$25 por cada amigo que comprar"
   - **Ser Afiliado** - com icone de loja e descricao "Ganhe de 25% a 45% de comissao por venda"

2. Ao clicar em uma opcao, a tela de escolha desaparece e apenas o conteudo da opcao selecionada e exibido (sem tabs).

3. Um botao "Voltar" ou "Trocar modo" no topo permite voltar para a tela de escolha caso queira mudar.

## Detalhes Tecnicos

**Arquivo modificado:** `src/pages/Referral.tsx`

- Adicionar um estado `selectedMode: 'none' | 'referral' | 'affiliate'` iniciando como `'none'`
- Quando `selectedMode === 'none'`: renderizar a tela de escolha com dois cards
- Quando `selectedMode === 'referral'`: renderizar apenas o conteudo da aba "Indicar" (sem o componente Tabs)
- Quando `selectedMode === 'affiliate'`: renderizar apenas o conteudo da aba "Afiliado" (sem o componente Tabs)
- O header com stats se ajusta para mostrar apenas as metricas relevantes ao modo selecionado
- Adicionar um botao discreto para trocar de modo (ex: "Trocar para Afiliado" ou "Trocar para Indicacao")

