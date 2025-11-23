# Planejamento da Página "Explorar Trilhas"

## 📋 Visão Geral

A página **"Explorar Trilhas"** (`ExploreCareerPathsPage.tsx`) é uma das páginas principais da área do cliente, permitindo que usuários descubram e explorem trilhas de carreira pré-definidas disponíveis no sistema.

---

## 🎯 Objetivos da Página

1. **Descoberta de Trilhas**: Permitir que usuários encontrem trilhas de carreira relevantes
2. **Filtragem Inteligente**: Oferecer múltiplas formas de filtrar e buscar trilhas
3. **Visualização Clara**: Apresentar informações essenciais de cada trilha de forma clara
4. **Navegação Intuitiva**: Facilitar a transição para visualização detalhada da trilha

---

## 🏗️ Arquitetura e Componentes

### Estrutura de Componentes

```
ExploreCareerPathsPage
├── Header (Título e descrição)
├── Filtros
│   ├── Busca por texto (search)
│   ├── Filtro por área profissional
│   ├── Filtro por nível (Iniciante/Intermediário/Avançado)
│   └── Ordenação (Relevância/Etapas/Alfabética)
├── Grid de Cards
│   └── CareerPathCard (componente reutilizável)
└── Estados
    ├── Loading
    ├── Error (com retry)
    └── Empty State
```

### Componente Reutilizável: `CareerPathCard`

O componente `CareerPathCard` foi criado para ser reutilizável em:
- **ExploreCareerPathsPage**: Listagem de todas as trilhas
- **Dashboard**: Preview de trilhas ativas
- **Outras páginas**: Onde for necessário exibir informações de trilhas

**Props do CareerPathCard:**
- `id`: ID da trilha
- `title`: Título da trilha
- `description`: Descrição
- `path_type`: Tipo ('PRE' ou 'PER')
- `stages`: Array de etapas (opcional)
- `showProgress`: Mostrar barra de progresso?
- `showStagesPreview`: Mostrar preview das primeiras 3 etapas?
- `linkTo`: URL para navegação
- `onClick`: Callback alternativo (se não usar linkTo)

---

## 🔍 Sistema de Filtragem

### 1. Busca por Texto (Search)

**Funcionalidade:**
- Busca em tempo real enquanto o usuário digita
- Busca em múltiplos campos:
  - Título da trilha
  - Descrição da trilha
  - Títulos das etapas
  - Descrições das etapas

**Implementação:**
```typescript
const searchLower = searchTerm.toLowerCase();
filtered = filtered.filter((path) => {
  const matchesTitle = path.title.toLowerCase().includes(searchLower);
  const matchesDescription = path.description.toLowerCase().includes(searchLower);
  const matchesStages = path.stages?.some((stage) =>
    stage.title.toLowerCase().includes(searchLower) ||
    stage.description?.toLowerCase().includes(searchLower)
  );
  return matchesTitle || matchesDescription || matchesStages;
});
```

### 2. Filtro por Área Profissional

**Áreas Disponíveis:**
- Todas as Áreas (padrão)
- Tecnologia
- Design
- Negócios
- Dados

**Implementação:**
- Usa palavras-chave para identificar áreas
- Busca nos títulos e descrições das trilhas
- Exemplo: "Tecnologia" busca por: 'tecnologia', 'tech', 'desenvolvimento', 'programação', 'software', 'web', 'mobile', 'dev'

**Limitação Atual:**
- Filtro baseado em heurística (palavras-chave)
- Idealmente, o backend deveria ter um campo `area` no modelo `CareerPath`

### 3. Filtro por Nível

**Níveis:**
- Todos os Níveis (padrão)
- Iniciante (≤ 5 etapas)
- Intermediário (6-10 etapas)
- Avançado (> 10 etapas)

**Implementação:**
- Baseado no número de etapas (heuristic)
- Idealmente, o backend deveria ter um campo `nivel` no modelo `CareerPath`

### 4. Ordenação

**Opções:**
- **Relevância** (padrão): Ordena por score de relevância quando há busca, senão mantém ordem original
- **Mais Etapas**: Ordena por número de etapas (decrescente)
- **Ordem Alfabética**: Ordena por título (A-Z)

**Score de Relevância:**
```typescript
const calculateRelevanceScore = (path: CareerPath, term: string): number => {
  let score = 0;
  if (path.title.toLowerCase().includes(termLower)) score += 10;
  if (path.description.toLowerCase().includes(termLower)) score += 5;
  path.stages?.forEach((stage) => {
    if (stage.title.toLowerCase().includes(termLower)) score += 2;
  });
  return score;
};
```

---

## 📊 Gerenciamento de Conteúdo

### Fonte de Dados

**API Endpoint:**
- `GET /api/v1/career-paths/` - Retorna todas as trilhas
- Filtro no frontend: `careerAPI.getPredefined()` filtra apenas trilhas com `path_type === 'PRE'`

**Fluxo de Dados:**
1. Componente monta → `useEffect` chama `fetchCareerPaths()`
2. `fetchCareerPaths()` → `careerAPI.getPredefined()`
3. `careerAPI.getPredefined()` → `careerAPI.getAll()` → filtra `path_type === 'PRE'`
4. Dados são armazenados em `careerPaths` (estado)
5. `filterPaths()` é chamado sempre que filtros mudam
6. Resultado filtrado é armazenado em `filteredPaths` (estado)

### Tratamento de Erros

**Sem Dados Mock:**
- ❌ **NÃO** usa dados mockados
- ✅ Mostra erros de conectividade claramente
- ✅ Diferencia entre:
  - Erro de rede (backend não acessível)
  - Erro de formato (resposta inválida)
  - Erro genérico

**Estados de Erro:**
```typescript
if (err instanceof TypeError && err.message.includes('fetch')) {
  // Network error - backend not reachable
  errorMessage = 'Não foi possível conectar ao servidor...';
} else if (err.message.includes('Failed to fetch')) {
  errorMessage = 'Erro de conexão com o backend...';
} else {
  errorMessage = `Erro: ${err.message}`;
}
```

### Estados da Página

1. **Loading**: Spinner com mensagem "Carregando trilhas de carreira..."
2. **Error**: Mensagem de erro clara + botão "Tentar Novamente" + botão "Voltar ao Dashboard"
3. **Empty State (sem filtros)**: "Nenhuma trilha disponível" + mensagem para contatar admin
4. **Empty State (com filtros)**: "Nenhuma trilha encontrada" + botão "Limpar Filtros"
5. **Success**: Grid de cards com contador de resultados

---

## 🎨 Design e UX

### Layout Responsivo

**Desktop:**
- Grid de 3 colunas (mínimo 300px por card)
- Filtros em linha horizontal
- Header com ícone e descrição

**Tablet (≤ 1024px):**
- Grid de 2 colunas
- Filtros podem quebrar linha

**Mobile (≤ 768px):**
- Grid de 1 coluna
- Filtros empilhados verticalmente
- Header simplificado

### Elementos Visuais

**Header:**
- Ícone de busca (lupa)
- Título grande e descritivo
- Subtítulo explicativo

**Filtros:**
- Input de busca com ícone de lupa
- Botão de limpar busca (X) quando há texto
- Selects estilizados para área, nível e ordenação

**Cards:**
- Hover effect (elevação e borda colorida)
- Preview das primeiras 3 etapas
- Badge indicando tipo (Pré-definida/Personalizada)
- Contador de etapas
- Botão de ação ("Explorar Trilha" ou "Continuar Trilha")

**Empty State:**
- Ícone grande
- Título e descrição
- Ações contextuais (limpar filtros, voltar)

---

## 🔄 Fluxo de Navegação

### Entrada na Página

1. Usuário clica em "Explorar Trilhas" no header ou dashboard
2. Página carrega → mostra loading
3. API é chamada → dados são carregados
4. Filtros são aplicados (padrão: nenhum filtro)
5. Grid de cards é exibido

### Interação com Filtros

1. Usuário digita na busca → `filterPaths()` é chamado automaticamente
2. Usuário seleciona área → filtro é aplicado
3. Usuário seleciona nível → filtro é aplicado
4. Usuário seleciona ordenação → resultados são reordenados
5. Contador de resultados é atualizado

### Seleção de Trilha

1. Usuário clica em um card → navega para `/my-plan/{id}`
2. `MyCareerPlanPage` carrega os detalhes completos da trilha

---

## 🚀 Melhorias Futuras

### Backend (Recomendações)

1. **Endpoint Específico para Pré-definidas:**
   - `GET /api/v1/career-paths/?path_type=PRE`
   - Evita buscar todas e filtrar no frontend

2. **Campo `area` no Modelo:**
   - Adicionar campo `area` em `CareerPath`
   - Permitir filtro no backend: `?area=tecnologia`

3. **Campo `nivel` no Modelo:**
   - Adicionar campo `nivel` em `CareerPath`
   - Permitir filtro no backend: `?nivel=iniciante`

4. **Busca no Backend:**
   - Endpoint: `GET /api/v1/career-paths/?search=termo`
   - Busca mais eficiente e precisa

5. **Paginação:**
   - Implementar paginação quando houver muitas trilhas
   - Endpoint: `GET /api/v1/career-paths/?page=1&page_size=12`

### Frontend (Melhorias)

1. **Debounce na Busca:**
   - Evitar chamadas excessivas de `filterPaths()`
   - Usar `useDebounce` hook

2. **URL Query Params:**
   - Salvar filtros na URL
   - Permitir compartilhamento de links filtrados
   - Exemplo: `/explore-career-paths?search=web&area=tecnologia`

3. **Favoritos:**
   - Permitir marcar trilhas como favoritas
   - Mostrar trilhas favoritas primeiro

4. **Histórico de Visualizações:**
   - Rastrear trilhas visualizadas
   - Mostrar "Você visualizou recentemente"

5. **Comparação de Trilhas:**
   - Permitir selecionar múltiplas trilhas
   - Comparar lado a lado

---

## 📝 Checklist de Implementação

### ✅ Implementado

- [x] Página `ExploreCareerPathsPage.tsx` criada
- [x] Componente `CareerPathCard` reutilizável
- [x] Integração com API `/api/v1/career-paths/`
- [x] Filtro por texto (busca)
- [x] Filtro por área profissional (heurística)
- [x] Filtro por nível (heurística)
- [x] Ordenação (relevância, etapas, alfabética)
- [x] Estados de loading, error e empty
- [x] Tratamento de erros de conectividade
- [x] Design responsivo
- [x] Preview de etapas nos cards
- [x] Navegação para detalhes da trilha

### ⚠️ Parcialmente Implementado

- [ ] Filtro por área (usa heurística, idealmente deveria ser campo no backend)
- [ ] Filtro por nível (usa heurística, idealmente deveria ser campo no backend)

### ❌ Não Implementado (Futuro)

- [ ] Debounce na busca
- [ ] URL query params para filtros
- [ ] Paginação
- [ ] Favoritos
- [ ] Histórico de visualizações
- [ ] Comparação de trilhas
- [ ] Busca no backend (atualmente apenas no frontend)

---

## 🔗 Relacionamento com Outras Páginas

### Páginas Relacionadas

1. **Dashboard** (`DashboardPage.tsx`):
   - Link para "Explorar Trilhas"
   - Preview de trilhas recomendadas

2. **Meu Plano** (`MyCareerPlanPage.tsx`):
   - Destino ao clicar em um card
   - Mostra detalhes completos da trilha selecionada

3. **Criar Plano Personalizado** (`CreateCustomPlanPage.tsx`):
   - Alternativa para criar trilha personalizada via LLM

4. **Perfil** (`ProfilePage.tsx`):
   - Pode mostrar trilhas associadas ao usuário

---

## 📊 Métricas e Analytics (Futuro)

### Métricas Úteis

1. **Engajamento:**
   - Trilhas mais visualizadas
   - Trilhas mais selecionadas
   - Tempo médio na página

2. **Filtros:**
   - Filtros mais usados
   - Combinações de filtros comuns

3. **Busca:**
   - Termos de busca mais frequentes
   - Trilhas encontradas vs não encontradas

---

## 🎯 Conclusão

A página "Explorar Trilhas" foi planejada para ser:
- **Intuitiva**: Fácil de usar e navegar
- **Eficiente**: Filtros rápidos e relevantes
- **Informativa**: Mostra informações essenciais sem sobrecarregar
- **Robusta**: Trata erros adequadamente, sem dados mock
- **Responsiva**: Funciona bem em todos os dispositivos

**Status Atual:** ✅ **Implementada e funcional** (com melhorias futuras planejadas)

