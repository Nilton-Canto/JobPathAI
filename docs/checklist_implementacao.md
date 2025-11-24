# Checklist de Implementação - JobPathAI

> **Status do Projeto**: Em desenvolvimento ativo  
> **Branch Atual**: `develop`  
> **Última Atualização**: Janeiro 2025

---

## 📋 Índice

1. [Visão Geral do Status](#visão-geral-do-status)
2. [Checklist por Casos de Uso](#checklist-por-casos-de-uso)
3. [Checklist por Componentes](#checklist-por-componentes)
4. [Issues do GitHub](#issues-do-github)
5. [Testes](#testes)
6. [Problemas Identificados](#problemas-identificados)
7. [Próximos Passos Prioritários](#próximos-passos-prioritários)

---

## 🎯 Visão Geral do Status

### ✅ Implementado

- **Autenticação Básica**: Login e cadastro funcionais (session-based)
- **App `users`**: Modelo Users, views de login/registro (JSON + HTML)
- **App `career`**: Modelos Skill, CareerPath, CareerStage + ViewSets DRF
- **App `student_area`**: Área do estudante com templates Django
- **Frontend React**: Estrutura básica com páginas (Login, Register, Dashboard, Profile)
- **REST Framework**: Configurado e funcionando
- **CORS**: Configurado para desenvolvimento
- **Templates Django**: Login e área do estudante

### ⚠️ Parcialmente Implementado

- **Integração Frontend-Backend**: Frontend React parcialmente integrado (Dashboard melhorado, Profile funcional)
- **Templates Django**: Existem mas não estão sendo servidos corretamente na porta 8000
- **Autenticação**: Apenas session-based, sem JWT ou OAuth
- **Dashboard**: Melhorado com stats, ações rápidas e preview de trilhas

### ❌ Não Implementado

- **Integração LLM**: Não há integração com OpenAI/Ollama
- **Trilhas Personalizadas**: Não há geração via LLM
- **Visualização de Progresso**: Não há tracking de etapas concluídas
- **Admin de Trilhas**: Não há interface administrativa para CRUD de trilhas
- **Testes Unitários**: Estrutura existe mas testes não estão completos

---

## 📝 Checklist por Casos de Uso

### UC01 – Login e Autenticação do Usuário

#### Backend
- [x] Modelo `Users` criado
- [x] View `LoginView` implementada (JSON + HTML)
- [x] View `NewUsersView` implementada (JSON + HTML)
- [x] Validação de campos (username, email, CPF únicos)
- [x] Integração com Django User model
- [ ] **FALTA**: Autenticação JWT para API REST
- [ ] **FALTA**: Refresh token mechanism
- [ ] **FALTA**: Logout via API

#### Frontend
- [x] Página `LoginPage.tsx` criada
- [x] Página `RegisterPage.tsx` criada
- [x] Integração com endpoint `/login/`
- [x] Integração com endpoint `/register/`
- [x] Validação de formulários
- [x] Loading states implementados
- [x] Separação clara entre área cliente e admin (sem link Admin no header do cliente)
- [ ] **FALTA**: Tratamento de erros mais robusto
- [x] Redirecionamento: Admin acessa `/admin/*` diretamente, usuário regular não vê link admin

#### Testes
- [x] Testes unitários básicos em `users/tests.py`
- [ ] **FALTA**: Teste de integração completo (Issue #32)
- [ ] **FALTA**: Teste de autenticação JWT (quando implementado)

---

### UC02 – Escolher Trilha de Carreira Pré-definida

#### Backend
- [x] Modelo `CareerPath` criado
- [x] Modelo `CareerStage` criado
- [x] ViewSet `CareerPathViewSet` criado
- [x] Serializers configurados
- [x] Endpoint `/api/v1/career-paths/` disponível
- [x] Filtro por `path_type` via query params (`?path_type=PRE`)
- [x] Endpoint específico para associar trilha ao usuário (`/associate/`) ✅
- [x] Modelo de associação User-CareerPath para trilhas pré-definidas ✅
- [x] Campo `is_active` para ativar/desativar trilhas ✅
- [x] Endpoint `/api/v1/career-paths/areas/` para listar áreas ✅
- [x] Endpoint `/api/v1/career-paths/levels/` para listar níveis ✅
- [x] Filtros por área, nível e is_active ✅

#### Frontend
- [x] Página para explorar trilhas pré-definidas (`ExploreCareerPathsPage.tsx`)
- [x] Componente de card de trilha (`CareerPathCard.tsx`)
- [x] Integração com API `/api/v1/career-paths/` (com tratamento de erros)
- [x] Filtros por área profissional (busca, área, nível, ordenação)
- [x] Visualização de detalhes da trilha (`CareerPathDetailPage.tsx`)
- [x] Página "Minhas Trilhas" (`MyCareerPathsPage.tsx`)
- [x] URL Query Params para filtros (compartilhamento de links)
- [x] Favoritos com backend (API endpoints prontos, botão no card)
- [x] Chat Widget flutuante (`ChatWidget.tsx` - pop-up em todas as páginas)

#### Conteúdo
- [ ] **FALTA**: Definir categorias iniciais (Issue #28, #30)
- [ ] **FALTA**: Criar trilhas pré-definidas de exemplo
- [ ] **FALTA**: Conteúdo da página de abertura (Issue #29)

---

### UC03 – Solicitar Plano de Carreira Personalizado via LLM

#### Backend
- [ ] **FALTA**: App `llm` ou módulo de integração LLM
- [ ] **FALTA**: Integração com OpenAI API
- [ ] **FALTA**: Integração com Ollama (local)
- [ ] **FALTA**: Template de prompt para LLM (Issue #27)
- [ ] **FALTA**: Endpoint para criar trilha personalizada
- [ ] **FALTA**: Processamento assíncrono (se necessário)
- [ ] **FALTA**: Cache de respostas do LLM
- [ ] **FALTA**: Validação de entrada do usuário

#### Frontend
- [x] Página HTML mock `criar-plano-ia.html` (protótipo)
- [ ] **FALTA**: Página React para criação de plano personalizado
- [ ] **FALTA**: Formulário de descrição de objetivos
- [ ] **FALTA**: Loading state durante geração
- [ ] **FALTA**: Visualização da trilha gerada
- [ ] **FALTA**: Opção de editar/refinar trilha gerada

#### Testes
- [ ] **FALTA**: Teste unitário API LLM (Issue #33)
- [ ] **FALTA**: Teste de integração com mock LLM
- [ ] **FALTA**: Teste de validação de prompts

---

### UC04 – Visualizar Plano de Carreira e Progresso

#### Backend
- [x] Modelo `CareerStage` com campo `is_completed`
- [x] Campo `completed_at` no modelo `CareerStage`
- [x] Relacionamento `user` em `CareerPath` (para trilhas personalizadas)
- [x] Filtro por usuário via query params (`?user={id}`)
- [ ] **FALTA**: Modelo de associação User-CareerPath para trilhas pré-definidas
- [ ] **FALTA**: Endpoint específico para buscar trilhas do usuário
- [ ] **FALTA**: Endpoint para calcular progresso (% concluído) - `/api/v1/career-paths/{id}/progress/`
- [ ] **FALTA**: Endpoint para histórico de progresso (pode usar `completed_at` existente)
- [ ] **FALTA**: Métricas de progresso agregadas

#### Frontend
- [x] Página React para visualizar plano (`MyCareerPlanPage.tsx`)
- [x] Barra de progresso visual (`ProgressBar.tsx`)
- [x] Indicadores de etapa atual (cards com estados)
- [x] Página "Minhas Trilhas" (`MyCareerPathsPage.tsx`)
- [ ] **FALTA**: Componente de timeline/kanban de etapas (opcional)
- [ ] **FALTA**: Histórico de conclusões (melhoria futura)

---

### UC05 – Marcar Etapa como Concluída

#### Backend
- [x] Campo `is_completed` no modelo `CareerStage`
- [x] Campo `completed_at` no modelo `CareerStage`
- [x] ViewSet `CareerStageViewSet` permite PATCH (genérico)
- [ ] **FALTA**: Validação customizada ao marcar etapa (ordem, negócio)
- [ ] **FALTA**: Validação de ordem (não pode pular etapas?)
- [ ] **FALTA**: Notificação/evento ao concluir etapa (opcional)
- [ ] **FALTA**: Recalcular progresso automaticamente (signals ou método customizado)

#### Frontend
- [x] Botão mock em `meu-plano.html`
- [ ] **FALTA**: Integração com API para marcar como concluída
- [ ] **FALTA**: Feedback visual ao concluir
- [ ] **FALTA**: Confirmação antes de marcar
- [ ] **FALTA**: Atualização automática do progresso

---

### UC06 – Gerenciar Áreas, Trilhas e Etapas (Admin)

#### Backend
- [x] Modelos registrados no Django Admin
- [x] Verificação de permissões admin em `AdminLayout`
- [x] API REST para CRUD de trilhas (ViewSet genérico)
- [x] Permissões customizadas para admin na API (`IsAdminOrReadOnly`) ✅
- [x] Validações de negócio (não deletar trilha com usuários associados) ✅
- [x] Campo `is_active` e filtros por status ✅

#### Frontend
- [x] Página React `AdminCareerPathsPage.tsx` criada (em `pages/admin/`)
- [x] Header separado `AdminHeader.tsx` (design escuro, profissional)
- [x] Layout separado `AdminLayout.tsx` com verificação de permissões
- [x] Separação clara: Admin não aparece no header do cliente
- [x] Dashboard do Admin (`AdminDashboardPage.tsx`) com estatísticas
- [x] CRUD completo de trilhas:
  - [x] Listar trilhas (`AdminCareerPathsPage.tsx`)
  - [x] Criar trilha (`AdminCreateCareerPathPage.tsx`)
  - [x] Editar trilha (`AdminEditCareerPathPage.tsx`)
  - [x] Deletar trilha (botão funcional)
- [x] CRUD completo de etapas (dentro da página de editar trilha):
  - [x] Adicionar etapas
  - [x] Editar etapas
  - [x] Remover etapas
  - [x] Reordenar etapas (botões ↑↓)
  - [x] Adicionar habilidades às etapas
- [x] Página Gerenciar Áreas (`AdminAreasPage.tsx` - integrada com backend) ✅
- [x] Endpoints para listar áreas e níveis (`/areas/`, `/levels/`) ✅
- [ ] **FALTA**: Interface drag-and-drop para reordenar etapas (melhoria futura)

---

## 🧩 Checklist por Componentes

### Backend - Apps Django

#### App `users`
- [x] Modelo `Users` criado
- [x] Views de login e registro
- [x] Templates HTML básicos
- [x] URLs configuradas
- [x] Testes unitários básicos
- [ ] **FALTA**: Melhorar tratamento de erros
- [ ] **FALTA**: Adicionar validação de CPF
- [ ] **FALTA**: Sistema de recuperação de senha

#### App `career`
- [x] Modelos `Skill`, `CareerPath`, `CareerStage`
- [x] Serializers DRF
- [x] ViewSets DRF
- [x] URLs configuradas em `/api/v1/`
- [ ] **FALTA**: Filtros avançados (por área, nível, etc.)
- [ ] **FALTA**: Ordenação customizada
- [ ] **FALTA**: Paginação otimizada
- [ ] **FALTA**: Testes unitários

#### App `student_area`
- [x] Modelos criados (StudentProfile, Resume, JobOpportunity, etc.)
- [x] Views HTML tradicionais
- [x] Templates Django
- [x] URLs configuradas em `/student/`
- [x] API REST parcialmente implementada
- [ ] **FALTA**: Completar API REST
- [ ] **FALTA**: Testes unitários
- [ ] **FALTA**: Integração com app `career`

#### App `llm`
- [x] App `llm` criado e configurado
- [x] Service para integração Gemini (equivalente a OpenAI)
- [x] Template de prompts
- [x] Modelos de banco (Conversation, ConversationMessage, UserMemory)
- [x] Endpoints implementados (generate-plan, chat, admin-insights)
- [x] Validação de entrada do usuário
- [ ] **FALTA**: Cache de respostas (melhoria futura)
- [ ] **FALTA**: Rate limiting (melhoria futura)
- [ ] **FALTA**: Processamento assíncrono (opcional)

### Frontend - React

#### Estrutura Base
- [x] Projeto Vite + React + TypeScript configurado
- [x] Roteamento com React Router
- [x] Componentes básicos (Header, AdminHeader, AdminLayout)
- [x] Separação clara entre área cliente e admin
- [x] Páginas básicas (Home, Login, Register, Dashboard, Profile)
- [x] Service layer para APIs (`api.ts` com todos os endpoints)
- [x] Context API para autenticação (`AuthContext.tsx` integrado)
- [x] API de favoritos (`favoritesAPI` com endpoints prontos)
- [x] `AuthContext` integrado em toda aplicação (substituído localStorage direto)
- [ ] **FALTA**: Gerenciamento de estado (Redux/Zustand?) (opcional)

#### Páginas Principais
- [x] `HomePage.tsx` - Página inicial
- [x] `LoginPage.tsx` - Login
- [x] `RegisterPage.tsx` - Cadastro
- [x] `DashboardPage.tsx` - Dashboard (melhorado com stats e ações rápidas)
- [x] `ProfilePage.tsx` - Perfil
- [x] `ExploreCareerPathsPage.tsx` - Explorar trilhas (com filtros e URL params)
- [x] `CareerPathDetailPage.tsx` - Detalhes da trilha (antes de selecionar)
- [x] `MyCareerPathsPage.tsx` - Minhas Trilhas (lista todas as trilhas do usuário)
- [x] `MyCareerPlanPage.tsx` - Meu plano (detalhes de uma trilha específica)
- [x] `CreateCustomPlanPage.tsx` - Criar plano personalizado (criado)
- [x] `AdminCareerPathsPage.tsx` - Admin de trilhas (em `pages/admin/`)
- [x] `ChatMentorPage.tsx` - Chat com mentor IA (página completa, opcional)
- [x] `ChatWidget.tsx` - Widget flutuante de chat (pop-up em todas as páginas)

#### Componentes Reutilizáveis
- [x] `Header.tsx` - Cabeçalho
- [x] `CareerPathCard.tsx` - Card de trilha (com botão de favoritar)
- [x] `ProgressBar.tsx` - Barra de progresso
- [x] `Tooltip.tsx` - Tooltip informativo
- [x] `ChatWidget.tsx` - Widget flutuante de chat (pop-up)
- [ ] **FALTA**: `StageTimeline.tsx` - Timeline de etapas (opcional)
- [ ] **FALTA**: `SkillTag.tsx` - Tag de habilidade (opcional, há estilos CSS)
- [ ] **FALTA**: `LoadingSpinner.tsx` - Loading (opcional, há estilos CSS)
- [ ] **FALTA**: `ErrorMessage.tsx` - Mensagem de erro (opcional, há estilos CSS)

### Arquivos HTML Estáticos (Protótipos)

**Nota**: Existem vários arquivos HTML estáticos no diretório `frontend/` que parecem ser protótipos/mockups. Estes devem ser migrados para React ou removidos:

- [x] `admin-nova-trilha.html` - Protótipo
- [x] `admin-trilhas.html` - Protótipo
- [x] `meu-plano.html` - Protótipo
- [x] `criar-plano-ia.html` - Protótipo
- [x] `chat-mentor.html` - Protótipo
- [x] `explorar-trilhas.html` - Protótipo
- [ ] **DECISÃO NECESSÁRIA**: Migrar para React ou manter como referência?

---

## 🐛 Issues do GitHub

### Testes

#### Issue #32 - [Test] Teste Unitário Login
- [ ] Criar testes completos para `LoginView`
- [ ] Testar autenticação bem-sucedida
- [ ] Testar autenticação com credenciais inválidas
- [ ] Testar redirecionamento para admin
- [ ] Testar redirecionamento para estudante
- [ ] Testar requisições JSON vs HTML

#### Issue #33 - [Test] Teste Unitário api LLM
- [ ] Criar app `llm` ou módulo
- [ ] Criar testes para integração LLM
- [ ] Testar geração de trilha personalizada
- [ ] Testar validação de prompts
- [ ] Testar tratamento de erros da API LLM
- [ ] Testar cache de respostas

#### Issue #34 - [Test] Roteiro de testes manuais de navegação
- [ ] Criar documento com roteiro de testes
- [ ] Testar fluxo completo: Login → Explorar Trilhas → Selecionar → Visualizar Progresso
- [ ] Testar fluxo: Login → Criar Plano Personalizado → Visualizar
- [ ] Testar fluxo admin: Login Admin → Gerenciar Trilhas → Criar/Editar/Deletar
- [ ] Documentar bugs encontrados

### Conteúdo

#### Issue #27 - [Conteúdo] Criar template de prompt para o LLM
- [ ] Definir estrutura do prompt
- [ ] Incluir contexto do usuário (perfil, interesses, competências)
- [ ] Incluir formato de resposta esperado (JSON)
- [ ] Testar diferentes variações de prompt
- [ ] Documentar template final

#### Issue #28 - [Conteúdo] Definir categorias iniciais de trilhas
- [ ] Definir lista de áreas profissionais
- [ ] Criar categorias: Dados, Web, IA, Marketing, etc.
- [ ] Definir níveis: Júnior, Pleno, Sênior
- [ ] Criar trilhas de exemplo para cada categoria

#### Issue #29 - [Conteúdo] Produzir conteúdo da página de abertura
- [ ] Texto de apresentação
- [ ] Call-to-action
- [ ] Seção de benefícios
- [ ] Seção de depoimentos (opcional)
- [ ] Imagens/ilustrações

#### Issue #30 - [Conteúdo] Definir categorias iniciais de trilhas (duplicado de #28)
- [ ] Mesmo que Issue #28

### Frontend

#### Issue #22 - [Front-end] Página de Acesso do Site (HTML/CSS)
- [x] Página inicial básica criada (`HomePage.tsx`)
- [ ] Melhorar design e conteúdo
- [ ] Adicionar seções: Sobre, Como Funciona, Benefícios
- [ ] Adicionar call-to-action para cadastro

#### Issue #25 - [Front-end] Criação das Páginas Internas do EstudaAI
- [x] Páginas básicas criadas
- [ ] Completar todas as páginas necessárias
- [ ] Integrar com APIs do backend
- [ ] Adicionar tratamento de erros

#### Issue #26 - [Front-end] Área do Estudante
- [x] App `student_area` criado no backend
- [x] Templates Django criados
- [ ] Migrar para React ou manter templates Django?
- [ ] Integrar com APIs REST

### Backend

#### Issue #17 - [Back-end] Modelagem do Banco de Dados
- [x] Modelos básicos criados
- [ ] Revisar relacionamentos
- [ ] Adicionar índices para performance
- [ ] Documentar modelo de dados
- [ ] Criar diagrama ER

#### Issue #19 - [Back-end] Área do Estudante
- [x] App `student_area` criado
- [x] Modelos criados
- [x] Views HTML criadas
- [ ] Completar API REST
- [ ] Adicionar testes

### Integração

#### Issue #13 - [Integração] Conectar interface de trilha personalizada com API do LLM
- [ ] Criar endpoint para solicitar trilha personalizada
- [ ] Integrar frontend com endpoint
- [ ] Adicionar loading states
- [ ] Tratar erros da API LLM
- [ ] Adicionar opção de refinar trilha gerada

### Documentação

#### Issue #2 - [Modelagem] Criar o modelo de domínio conceitual do sistema
- [ ] Criar diagrama de domínio
- [ ] Documentar entidades principais
- [ ] Documentar relacionamentos

#### Issue #3 - [Modelagem] Criar o diagrama de conceitual (UML)
- [ ] Criar diagrama de classes UML
- [ ] Documentar atributos e métodos
- [ ] Atualizar conforme implementação

#### Issue #4 - [Modelagem] Caso de Uso - Login e autenticação do usuário
- [x] Implementado parcialmente
- [ ] Documentar fluxo completo
- [ ] Adicionar diagrama de sequência

#### Issue #5 - [Modelagem] Caso de Uso - Escolher trilha pré-definida
- [ ] Documentar fluxo
- [ ] Criar diagrama de sequência
- [ ] Documentar regras de negócio

#### Issue #6 - [Modelagem] Caso de Uso - Solicitar trilha personalizada via LLM
- [ ] Documentar fluxo
- [ ] Criar diagrama de sequência
- [ ] Documentar integração com LLM

#### Issue #7 - [Modelagem] Caso de Uso - Visualizar trilha e progresso
- [ ] Documentar fluxo
- [ ] Criar diagrama de sequência

#### Issue #8 - [Modelagem] Caso de Uso - Marcar etapa como concluída
- [ ] Documentar fluxo
- [ ] Criar diagrama de sequência

#### Issue #9 - [Modelagem] Caso de Uso - Gerenciar categorias, trilhas e etapas (Admin)
- [ ] Documentar fluxo
- [ ] Criar diagrama de sequência
- [ ] Documentar permissões

---

## 🧪 Testes

### Testes Unitários

#### Backend
- [x] Testes básicos de criação de usuário (`users/tests.py`)
- [ ] Testes para `career` app
- [ ] Testes para `student_area` app
- [ ] Testes para integração LLM (quando implementado)
- [ ] Cobertura mínima: 70%

#### Frontend
- [ ] Testes para componentes React (Jest + React Testing Library)
- [ ] Testes para páginas principais
- [ ] Testes para serviços de API
- [ ] Cobertura mínima: 60%

### Testes de Integração

- [ ] Teste completo: Login → Explorar → Selecionar Trilha → Visualizar
- [ ] Teste completo: Login → Criar Plano Personalizado → Visualizar
- [ ] Teste completo: Admin → Gerenciar Trilhas
- [ ] Teste de performance (tempo de resposta < 2s)

### Testes Manuais

#### Roteiro de Testes de Navegação (Issue #34)

**Fluxo 1: Login e Navegação Básica**
1. [ ] Acessar página inicial
2. [ ] Clicar em "Login"
3. [ ] Fazer login com credenciais válidas
4. [ ] Verificar redirecionamento para dashboard
5. [ ] Navegar para perfil
6. [ ] Fazer logout
7. [ ] Verificar redirecionamento para página inicial

**Fluxo 2: Cadastro de Novo Usuário**
1. [ ] Acessar página de cadastro
2. [ ] Preencher formulário com dados válidos
3. [ ] Submeter formulário
4. [ ] Verificar criação de usuário
5. [ ] Fazer login com novo usuário
6. [ ] Verificar acesso ao dashboard

**Fluxo 3: Explorar e Selecionar Trilha Pré-definida**
1. [ ] Fazer login
2. [ ] Acessar página "Explorar Trilhas"
3. [ ] Filtrar por área profissional
4. [ ] Visualizar detalhes de uma trilha
5. [ ] Selecionar trilha
6. [ ] Verificar associação com usuário
7. [ ] Visualizar plano de carreira

**Fluxo 4: Criar Plano Personalizado via LLM**
1. [ ] Fazer login
2. [ ] Acessar "Criar Plano Personalizado"
3. [ ] Preencher descrição de objetivos
4. [ ] Submeter solicitação
5. [ ] Aguardar geração (loading state)
6. [ ] Visualizar trilha gerada
7. [ ] Opcional: Refinar trilha

**Fluxo 5: Visualizar Progresso e Marcar Etapas**
1. [ ] Fazer login
2. [ ] Acessar "Meu Plano"
3. [ ] Visualizar etapas da trilha
4. [ ] Verificar barra de progresso
5. [ ] Marcar etapa atual como concluída
6. [ ] Verificar atualização do progresso
7. [ ] Verificar próxima etapa destacada

**Fluxo 6: Admin - Gerenciar Trilhas**
1. [ ] Fazer login como admin
2. [ ] Acessar painel administrativo
3. [ ] Listar trilhas existentes
4. [ ] Criar nova trilha
5. [ ] Adicionar etapas à trilha
6. [ ] Editar trilha existente
7. [ ] Ativar/desativar trilha
8. [ ] Deletar trilha (se permitido)

**Fluxo 7: Chat com Mentor IA**
1. [ ] Fazer login
2. [ ] Acessar "Chat Mentor IA"
3. [ ] Enviar pergunta sobre carreira
4. [ ] Receber resposta do LLM
5. [ ] Continuar conversa
6. [ ] Verificar histórico de conversa

---

## ⚠️ Problemas Identificados

### Críticos

1. **Templates Django não estão sendo servidos**
   - **Problema**: Ao acessar `http://localhost:8000/login/`, não aparece o template HTML
   - **Causa**: Possível problema na configuração de `TEMPLATES` ou `STATICFILES_DIRS`
   - **Solução**: Verificar `settings.py` e garantir que `APP_DIRS = True` e templates estão no lugar correto

2. **REST Framework não está em `INSTALLED_APPS` na branch atual**
   - **Status**: ✅ **CORRIGIDO** na branch `develop` (já está configurado)
   - **Verificação**: Confirmar que está funcionando

3. **Frontend React não está integrado com APIs**
   - **Problema**: Dashboard e Profile usam dados mockados
   - **Solução**: Criar service layer e integrar com endpoints do backend

### Importantes

4. **Arquivos HTML estáticos no frontend**
   - **Problema**: Existem muitos arquivos `.html` no diretório `frontend/` que parecem ser protótipos
   - **Decisão necessária**: Migrar para React ou remover?

5. **Falta de usuários de teste**
   - **Problema**: Não há usuários de teste criados automaticamente
   - **Solução**: Criar script de fixtures ou documentar como criar usuários de teste

6. **Autenticação apenas session-based**
   - **Problema**: Frontend React usa `localStorage` mas backend usa sessões
   - **Solução**: Implementar JWT ou melhorar integração de sessões

7. **App `student_area` não está integrado com `career`**
   - **Problema**: Dois apps separados que deveriam trabalhar juntos
   - **Solução**: Criar relacionamentos ou unificar lógica

### Melhorias

8. **Falta de validação de CPF**
9. **Falta de sistema de recuperação de senha**
10. **Falta de tratamento de erros robusto no frontend**
11. **Falta de loading states em várias páginas**
12. **Falta de feedback visual em ações do usuário**

---

## 🚀 Próximos Passos Prioritários

### Sprint 1 (Urgente)

1. **Corrigir templates Django não sendo servidos**
   - Verificar configuração de templates
   - Testar acesso a `http://localhost:8000/login/`
   - Testar acesso a `http://localhost:8000/student/`

2. **Criar usuários de teste**
   - Criar script de fixtures ou documentar processo
   - Criar usuário admin de teste
   - Criar usuário estudante de teste

3. **Integrar Frontend React com APIs**
   - Criar service layer (`src/services/api.ts`)
   - Integrar Dashboard com API
   - Integrar Profile com API

### Sprint 2 (Importante)

4. **Implementar UC02 - Escolher Trilha Pré-definida**
   - Criar página React para explorar trilhas
   - Integrar com API `/api/v1/career-paths/`
   - Implementar filtros e busca

5. **Implementar UC04 - Visualizar Progresso**
   - Criar endpoint para buscar trilhas do usuário
   - Criar endpoint para calcular progresso
   - Criar página React para visualizar plano

6. **Implementar UC05 - Marcar Etapa como Concluída**
   - Criar endpoint PATCH para marcar etapa
   - Integrar com frontend
   - Atualizar progresso automaticamente

### Sprint 3 (Médio Prazo)

7. **Implementar UC03 - Plano Personalizado via LLM**
   - Criar app `llm` ou módulo
   - Integrar com OpenAI/Ollama
   - Criar template de prompt
   - Criar endpoint para gerar trilha

8. **Implementar UC06 - Admin de Trilhas**
   - Criar página React para admin
   - Implementar CRUD completo
   - Adicionar validações

9. **Melhorar Autenticação**
   - Implementar JWT (opcional)
   - Melhorar integração frontend-backend
   - Adicionar refresh token

### Sprint 4 (Melhorias)

10. **Testes**
    - Completar testes unitários
    - Criar testes de integração
    - Documentar roteiro de testes manuais

11. **Conteúdo**
    - Definir categorias de trilhas
    - Criar trilhas de exemplo
    - Produzir conteúdo da página inicial

12. **Documentação**
    - Criar diagramas UML
    - Documentar APIs
    - Atualizar README

---

## 📊 Métricas de Progresso

### Por Caso de Uso

| UC | Status | Progresso |
|---|---|---|
| UC01 - Login | ✅ Parcial | 70% |
| UC02 - Escolher Trilha | ⚠️ Iniciado | 30% |
| UC03 - Plano Personalizado | ✅ Implementado | 85% |
| UC04 - Visualizar Progresso | ⚠️ Iniciado | 20% |
| UC05 - Marcar Etapa | ⚠️ Iniciado | 40% |
| UC06 - Admin | ⚠️ Iniciado | 25% |

### Por Componente

| Componente | Status | Progresso |
|---|---|---|
| Backend - Users | ✅ Funcional | 80% |
| Backend - Career | ⚠️ Parcial | 65% |
| Backend - Student Area | ⚠️ Parcial | 70% |
| Backend - LLM | ✅ Funcional | 90% |
| Frontend - React | ✅ Avançado | 75% |
| Frontend - Admin | ✅ Funcional | 75% |
| Frontend - Integração | ❌ Não iniciado | 10% |
| Testes | ⚠️ Parcial | 20% |
| Documentação | ⚠️ Parcial | 50% |

---

## 📝 Notas Finais

### Separação de Acessos

**IMPORTANTE**: O sistema possui separação clara entre área do cliente e área administrativa:

- **Área Cliente**: Header claro, rotas normais (`/dashboard`, `/profile`, etc.)
- **Área Admin**: Header escuro, rotas `/admin/*`, acesso restrito
- **Documentação**: Ver `docs/separacao_acessos.md` para detalhes completos

**Regra**: O header do cliente (`Header.tsx`) NÃO mostra link para admin. Admins acessam `/admin/*` diretamente.

### Usuários de Teste

**Como criar usuários de teste:**

```bash
# No diretório backend/
python manage.py createsuperuser
# Seguir prompts para criar admin

# Ou via shell do Django
python manage.py shell
```

```python
from django.contrib.auth.models import User
from users.models import Users

# Criar usuário admin
admin = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')

# Criar usuário estudante
student = User.objects.create_user('student', 'student@test.com', 'student123')
Users.objects.create(nome='Estudante Teste', email='student@test.com', idade=25, cpf='12345678901')
```

### Comandos Úteis

```bash
# Backend
cd backend
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py test

# Frontend
cd frontend
npm install
npm run dev
npm run build
```

### Estrutura de Branches

- `main` - Produção (protegida)
- `develop` - Desenvolvimento (branch atual)
- `feature/*` - Novas funcionalidades
- `bugfix/*` - Correções de bugs

---

**Última atualização**: Janeiro 2025  
**Próxima revisão**: Após cada sprint

