# JobPathAI - Sistema de Recomendação de Carreira

> **Status**: ✅ **90% Completo - Funcionalmente Pronto**  
> **Última Atualização**: Janeiro 2025

---

## 1. Visão Geral do Projeto

O JobPathAI é uma aplicação web desenvolvida para auxiliar usuários na definição e planejamento de suas carreiras profissionais. O sistema permite que o usuário escolha entre trilhas de carreira pré-definidas ou crie um plano de carreira personalizado com o auxílio de um agente baseado em LLM (Large Language Model). Com base no perfil, interesses e competências do usuário, o sistema sugerirá possíveis caminhos profissionais e as etapas recomendadas para alcançá-los.

## 2. Requisitos do Sistema

### 2.1 Requisitos Funcionais

- ✅ **Autenticação de usuários** (login e cadastro) - **IMPLEMENTADO**
- ✅ **Escolha de trilhas de carreira pré-definidas** por área - **IMPLEMENTADO**
- ✅ **Criação de planos de carreira personalizados** com o auxílio de um agente LLM - **IMPLEMENTADO**
- ✅ **Visualização do progresso** nas etapas da carreira escolhida - **IMPLEMENTADO**
- ✅ **Marcar etapas como concluídas** - **IMPLEMENTADO**
- ✅ **Administração de áreas profissionais, trilhas de carreira e etapas** (CRUD) - **IMPLEMENTADO**
- ✅ **Interface de conversa com o agente LLM** para sugestões e dúvidas relacionadas à carreira - **IMPLEMENTADO**

### 2.2 Requisitos Não Funcionais

- ✅ **Django no backend** (utilizando Django REST Framework para APIs) - **IMPLEMENTADO**
- ✅ **React com TypeScript, HTML, CSS e JS** com design responsivo - **IMPLEMENTADO**
- ✅ **Integração com API LLM** (Google Gemini, equivalente a OpenAI) - **IMPLEMENTADO**
- ✅ **Interface amigável e intuitiva** - **IMPLEMENTADO**
- ⚠️ **Tempo de resposta** - Requer testes de performance

## 3. Casos de Uso - Status de Implementação

- ✅ **UC01** – Login e autenticação do usuário - **95% Completo**
- ✅ **UC02** – Escolher trilha de carreira pré-definida - **95% Completo**
- ✅ **UC03** – Solicitar plano de carreira personalizado via LLM - **90% Completo**
- ✅ **UC04** – Visualizar plano de carreira e progresso - **95% Completo**
- ✅ **UC05** – Marcar etapa como concluída - **95% Completo**
- ✅ **UC06** – Gerenciar áreas profissionais, trilhas e etapas (Admin) - **90% Completo**

## 4. O Que Falta (Não Crítico)

### Configuração (Requer Ação do Usuário)
- [ ] Configurar API Key Gemini no `.env`
- [ ] Instalar dependências do LLM

### Conteúdo
- [ ] Criar trilhas pré-definidas de exemplo
- [ ] Popular banco com dados de demonstração

### Melhorias
- [ ] Validação de CPF
- [ ] Sistema de recuperação de senha
- [ ] Testes unitários completos

---

**Para mais detalhes, consulte:**
- `docs/checklist_implementacao.md` - Checklist completo
- `docs/status_geral_projeto.md` - Status detalhado do projeto
- `docs/separacao_acessos.md` - Documentação de acessos
