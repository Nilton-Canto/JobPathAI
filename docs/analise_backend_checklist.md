# Análise do Backend - Comparação com Checklist

> **Data**: Janeiro 2025  
> **Objetivo**: Verificar o que está implementado vs. o que falta conforme checklist

---

## 📊 Resumo Executivo

### Status Geral
- ✅ **Apps Django**: 4 apps principais (users, career, student_area, llm)
- ✅ **APIs REST**: DRF configurado e funcionando
- ⚠️ **Endpoints Faltando**: Alguns endpoints específicos mencionados no checklist
- ⚠️ **Funcionalidades**: Algumas funcionalidades de negócio não implementadas

---

## ✅ O Que Está Implementado

### App `users`
- ✅ Modelo `Users` (removido, migrado para StudentProfile)
- ✅ Views de login e registro (JSON)
- ✅ URLs configuradas
- ✅ Testes unitários básicos
- ✅ Autenticação session-based funcionando

### App `career`
- ✅ Modelos: `Skill`, `CareerPath`, `CareerStage`
- ✅ Serializers DRF completos
- ✅ ViewSets DRF básicos:
  - `SkillViewSet` (CRUD completo)
  - `CareerPathViewSet` (CRUD completo)
  - `CareerStageViewSet` (CRUD completo)
- ✅ URLs configuradas em `/api/v1/`
- ✅ Campos `is_completed` e `completed_at` em `CareerStage`
- ✅ Relacionamento `user` em `CareerPath` (para trilhas personalizadas)

### App `student_area`
- ✅ Modelos: `StudentProfile`, `Resume`, `JobOpportunity`, `JobApplication`
- ✅ API REST parcialmente implementada:
  - `StudentProfileViewSet` (CRUD com permissões)
  - `ResumeViewSet` (CRUD com permissões)
  - `JobOpportunityViewSet` (ReadOnly)
  - `JobApplicationViewSet` (CRUD com permissões)
- ✅ URLs configuradas em `/api/student/`
- ✅ Permissões customizadas (`IsOwnerOrStaff`)

### App `llm`
- ✅ App criado e configurado
- ✅ Modelos: `Conversation`, `ConversationMessage`, `UserMemory`
- ✅ Service `GeminiService` implementado
- ✅ Templates de prompts configurados
- ✅ 3 endpoints implementados:
  - `POST /api/llm/generate-plan/` ✅
  - `POST /api/llm/chat/` ✅
  - `POST /api/llm/admin-insights/` ✅
- ✅ Validação de entrada do usuário
- ✅ Sistema de memória do usuário
- ✅ Histórico de conversas

---

## ❌ O Que Está Faltando (Conforme Checklist)

### UC02 – Escolher Trilha Pré-definida

#### Backend
- [ ] **FALTA**: Endpoint para listar apenas trilhas pré-definidas (filtro `path_type='PRE'`)
  - **Status**: ViewSet genérico existe, mas não há endpoint específico
  - **Solução**: Adicionar método customizado ou usar query params: `/api/v1/career-paths/?path_type=PRE`
  
- [ ] **FALTA**: Endpoint para associar trilha ao usuário
  - **Status**: Não existe endpoint `/api/v1/career-paths/{id}/associate/`
  - **Problema**: Frontend chama este endpoint mas não existe no backend
  - **Solução**: Criar action customizada no `CareerPathViewSet`

- [ ] **FALTA**: Validação de trilhas ativas
  - **Status**: Não há campo `is_active` no modelo `CareerPath`
  - **Solução**: Adicionar campo `is_active` ou usar `path_type` para controle

### UC03 – Solicitar Plano de Carreira Personalizado via LLM

#### Backend
- ✅ App `llm` criado
- ✅ Integração com Google Gemini API (não OpenAI/Ollama, mas funcional)
- ✅ Template de prompt para LLM
- ✅ Endpoint para criar trilha personalizada
- ✅ Validação de entrada do usuário
- [ ] **FALTA**: Processamento assíncrono (não crítico, pode ser adicionado depois)
- [ ] **FALTA**: Cache de respostas do LLM (melhoria futura)
- [ ] **FALTA**: Rate limiting (melhoria futura)

**Nota**: O checklist menciona OpenAI/Ollama, mas implementamos Gemini que é equivalente.

### UC04 – Visualizar Plano de Carreira e Progresso

#### Backend
- ✅ Modelo `CareerStage` com campo `is_completed`
- ⚠️ **PARCIAL**: Relacionamento entre User e CareerPath
  - **Status**: Existe `user` FK em `CareerPath`, mas apenas para trilhas personalizadas
  - **Problema**: Não há modelo de associação para trilhas pré-definidas
  - **Solução**: Criar modelo `UserCareerPath` ou adicionar ManyToMany em `CareerPath`

- [ ] **FALTA**: Endpoint para buscar trilhas do usuário
  - **Status**: Frontend filtra por `path_type='PER'`, mas não há endpoint específico
  - **Solução**: Adicionar método customizado ou usar query params: `/api/v1/career-paths/?user={id}`

- [ ] **FALTA**: Endpoint para calcular progresso (% concluído)
  - **Status**: Não existe endpoint `/api/v1/career-paths/{id}/progress/`
  - **Solução**: Adicionar action customizada no `CareerPathViewSet`

- [ ] **FALTA**: Endpoint para histórico de progresso
  - **Status**: Não existe modelo ou endpoint para histórico
  - **Solução**: Criar modelo `ProgressHistory` ou adicionar campo `completed_at` em `CareerStage` (já existe!)

- [ ] **FALTA**: Métricas de progresso (etapas concluídas, tempo estimado, etc.)
  - **Status**: Não há endpoint para métricas
  - **Solução**: Adicionar action customizada ou endpoint separado

### UC05 – Marcar Etapa como Concluída

#### Backend
- ✅ Campo `is_completed` no modelo `CareerStage`
- ✅ Campo `completed_at` no modelo `CareerStage`
- ⚠️ **PARCIAL**: Endpoint PATCH para marcar etapa como concluída
  - **Status**: ViewSet genérico permite PATCH, mas não há validação de negócio
  - **Solução**: Adicionar método `update()` ou `partial_update()` customizado

- [ ] **FALTA**: Validação de ordem (não pode pular etapas?)
  - **Status**: Não há validação que impede pular etapas
  - **Solução**: Adicionar validação no serializer ou view

- [ ] **FALTA**: Notificação/evento ao concluir etapa
  - **Status**: Não há sistema de notificações
  - **Solução**: Criar app `notifications` ou usar signals Django

- [ ] **FALTA**: Recalcular progresso automaticamente
  - **Status**: Não há trigger para recalcular progresso
  - **Solução**: Usar signals Django ou método customizado

### UC06 – Gerenciar Áreas, Trilhas e Etapas (Admin)

#### Backend
- ✅ Modelos registrados no Django Admin
- ⚠️ **PARCIAL**: API REST para CRUD de trilhas (admin only)
  - **Status**: ViewSet genérico existe, mas não há restrição de permissões para admin
  - **Solução**: Adicionar `permission_classes` customizado

- [ ] **FALTA**: Validações de negócio (ex: não deletar trilha com usuários associados)
  - **Status**: Não há validação no método `destroy()` do ViewSet
  - **Solução**: Sobrescrever método `destroy()` no `CareerPathViewSet`

- [ ] **FALTA**: Endpoint para ativar/desativar trilhas
  - **Status**: Não há campo `is_active` no modelo
  - **Solução**: Adicionar campo `is_active` e action customizada

### App `career` - Melhorias

- [ ] **FALTA**: Filtros avançados (por área, nível, etc.)
  - **Status**: ViewSet básico, sem filtros customizados
  - **Solução**: Usar `django-filter` ou adicionar `get_queryset()` customizado

- [ ] **FALTA**: Ordenação customizada
  - **Status**: Apenas ordenação padrão do modelo
  - **Solução**: Adicionar `ordering_fields` no ViewSet

- [ ] **FALTA**: Paginação otimizada
  - **Status**: Usa paginação padrão do DRF
  - **Solução**: Configurar paginação customizada em `settings.py`

- [ ] **FALTA**: Testes unitários
  - **Status**: Arquivo `tests.py` existe mas vazio
  - **Solução**: Criar testes para ViewSets e Serializers

### App `student_area` - Melhorias

- [ ] **FALTA**: Completar API REST
  - **Status**: ViewSets básicos implementados
  - **O que falta**: Endpoints específicos mencionados no frontend podem não existir

- [ ] **FALTA**: Testes unitários
  - **Status**: Arquivo `tests.py` existe mas vazio
  - **Solução**: Criar testes para ViewSets

- [ ] **FALTA**: Integração com app `career`
  - **Status**: Apps separados, sem relacionamento direto
  - **Solução**: Criar relacionamentos ou endpoints que unifiquem dados

### Funcionalidades Gerais

- [ ] **FALTA**: Sistema de favoritos
  - **Status**: Frontend tem `favoritesAPI`, mas não há modelo/endpoint no backend
  - **Solução**: Criar modelo `Favorite` e ViewSet

- [ ] **FALTA**: Validação de CPF no app `users`
  - **Status**: CPF é string simples, sem validação
  - **Solução**: Adicionar validação no modelo ou serializer

- [ ] **FALTA**: Sistema de recuperação de senha
  - **Status**: Não implementado
  - **Solução**: Usar `django.contrib.auth.views.PasswordResetView` ou criar customizado

---

## 🔧 Prioridades de Implementação

### Alta Prioridade (Funcionalidades Críticas)

1. **Endpoint para associar trilha ao usuário**
   - Frontend já chama `/api/v1/career-paths/{id}/associate/`
   - Impacto: Usuários não conseguem começar trilhas pré-definidas

2. **Modelo de associação User-CareerPath**
   - Necessário para trilhas pré-definidas
   - Impacto: Não há como rastrear quais trilhas o usuário está seguindo

3. **Endpoint para calcular progresso**
   - Frontend precisa mostrar % de conclusão
   - Impacto: Dashboard não mostra progresso real

4. **Validação ao marcar etapa como concluída**
   - Evitar pular etapas ou marcar incorretamente
   - Impacto: Integridade dos dados de progresso

### Média Prioridade (Melhorias Importantes)

5. **Filtros avançados em CareerPathViewSet**
   - Melhorar busca e filtragem
   - Impacto: UX melhor na exploração de trilhas

6. **Sistema de favoritos**
   - Frontend já tem UI pronta
   - Impacto: Funcionalidade não funciona

7. **Validações de negócio (não deletar trilha com usuários)**
   - Proteger dados importantes
   - Impacto: Prevenir perda de dados

### Baixa Prioridade (Melhorias Futuras)

8. **Processamento assíncrono para LLM**
9. **Cache de respostas do LLM**
10. **Rate limiting**
11. **Sistema de notificações**
12. **Recuperação de senha**
13. **Testes unitários**

---

## 📝 Checklist Atualizado - Backend

### App `users`
- [x] Modelo criado (migrado para StudentProfile)
- [x] Views de login e registro
- [x] URLs configuradas
- [x] Testes unitários básicos
- [ ] Validação de CPF
- [ ] Sistema de recuperação de senha

### App `career`
- [x] Modelos criados
- [x] Serializers DRF
- [x] ViewSets DRF básicos
- [x] URLs configuradas
- [ ] Filtros avançados
- [ ] Ordenação customizada
- [ ] Paginação otimizada
- [ ] Endpoint para associar trilha
- [ ] Endpoint para progresso
- [ ] Validação ao marcar etapa
- [ ] Validações de negócio (deletar)
- [ ] Testes unitários

### App `student_area`
- [x] Modelos criados
- [x] API REST parcial
- [x] URLs configuradas
- [ ] Completar API REST
- [ ] Testes unitários
- [ ] Integração com app `career`

### App `llm`
- [x] App criado
- [x] Service implementado
- [x] Templates de prompts
- [x] Endpoints implementados
- [x] Validação de entrada
- [ ] Processamento assíncrono (opcional)
- [ ] Cache de respostas (opcional)
- [ ] Rate limiting (opcional)

### Funcionalidades Gerais
- [ ] Sistema de favoritos
- [ ] Modelo de associação User-CareerPath
- [ ] Endpoint de progresso
- [ ] Sistema de notificações (opcional)

---

## 🎯 Recomendações

### Imediatas (Esta Sprint)

1. **Criar endpoint `/api/v1/career-paths/{id}/associate/`**
   - Action customizada no `CareerPathViewSet`
   - Criar modelo `UserCareerPath` se necessário

2. **Adicionar endpoint de progresso**
   - Action customizada: `/api/v1/career-paths/{id}/progress/`
   - Retornar % concluído, etapas concluídas, etc.

3. **Validação ao marcar etapa como concluída**
   - Sobrescrever `partial_update()` no `CareerStageViewSet`
   - Validar ordem das etapas

### Próxima Sprint

4. **Sistema de favoritos**
   - Criar modelo `Favorite`
   - Criar ViewSet e URLs

5. **Filtros avançados**
   - Instalar `django-filter`
   - Configurar filtros no ViewSet

6. **Validações de negócio**
   - Proteger deletar trilhas com usuários
   - Adicionar campo `is_active` se necessário

---

## 📊 Métricas de Progresso - Backend

| Componente | Status | Progresso |
|---|---|---|
| App `users` | ✅ Funcional | 80% |
| App `career` | ⚠️ Parcial | 60% |
| App `student_area` | ⚠️ Parcial | 70% |
| App `llm` | ✅ Funcional | 90% |
| **Backend Geral** | ⚠️ **Parcial** | **75%** |

---

**Última atualização**: Janeiro 2025

