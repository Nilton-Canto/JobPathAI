# LLM App - Integração com Google Gemini

Este app fornece integração com a API do Google Gemini para:
- **Geração de planos de carreira personalizados** (`/api/llm/generate-plan/`)
- **Chat com mentor IA** (`/api/llm/chat/`) - com histórico e memória do usuário
- **Insights para administradores** (`/api/llm/admin-insights/`) - análise de dashboard

## 🆕 Funcionalidades Implementadas

### ✅ Histórico de Conversas
- Conversas são salvas no banco de dados
- Cada conversa tem um `conversation_id` único
- Histórico de até 10 mensagens é usado como contexto
- Título da conversa é gerado automaticamente da primeira mensagem

### ✅ Memória do Usuário
- Sistema armazena informações importantes sobre o usuário
- Contexto inclui:
  - Perfil do usuário (bio, área de interesse, etc.)
  - Trilhas de carreira ativas
  - Progresso (etapas concluídas)
  - Objetivos de carreira
- Memória é atualizada automaticamente quando usuário cria plano personalizado

### ✅ Sistema Separado para Admin
- Endpoint dedicado `/api/llm/admin-insights/`
- Foco em insights de dashboard e métricas
- Analisa estatísticas da plataforma
- Fornece recomendações baseadas em dados

## Configuração

### 1. Obter Chave de API do Gemini

1. Acesse [Google AI Studio](https://ai.google.dev/)
2. Faça login com sua conta Google
3. Crie uma nova chave de API
4. Copie a chave gerada

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` no diretório `backend/`:

```bash
# backend/.env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Instalar Dependências e Migrar

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
```

## Endpoints da API

### POST `/api/llm/generate-plan/`

Gera um plano de carreira personalizado baseado na descrição do usuário.

**Autenticação**: Requerida (usuário logado)

**Request Body**:
```json
{
  "description": "Quero me tornar um desenvolvedor full-stack especializado em React e Python..."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "career_path": {
    "id": 1,
    "title": "Desenvolvedor Full-Stack",
    "description": "...",
    "path_type": "PER",
    "stages": [...]
  }
}
```

**Nota**: A memória do usuário é atualizada automaticamente com os objetivos de carreira.

---

### POST `/api/llm/chat/`

Chat com o mentor IA sobre carreira. **Inclui histórico e contexto do usuário**.

**Autenticação**: Requerida (usuário logado)

**Request Body**:
```json
{
  "message": "Como posso melhorar minhas habilidades de programação?",
  "conversation_id": "optional-uuid"  // Opcional: cria nova se não fornecido
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "response": "Para melhorar suas habilidades de programação, recomendo...",
  "conversation_id": "uuid-da-conversa"
}
```

**Como funciona**:
1. Sistema busca ou cria conversa baseado no `conversation_id`
2. Salva mensagem do usuário
3. Busca histórico (últimas 10 mensagens)
4. Busca contexto do usuário (perfil, trilhas, progresso)
5. Chama Gemini com contexto completo
6. Salva resposta do mentor
7. Retorna resposta com `conversation_id` para continuar conversa

---

### POST `/api/llm/admin-insights/`

**NOVO!** Insights de dashboard para administradores.

**Autenticação**: Requerida (apenas admin/staff)

**Request Body**:
```json
{
  "question": "Quais são as principais tendências de uso da plataforma?",
  "metrics": {}  // Opcional: métricas específicas para análise
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "insights": "Com base nas métricas...",
  "metrics": {
    "total_users": 150,
    "total_career_paths": 45,
    "completion_rate": 32.5,
    ...
  }
}
```

**Métricas incluídas automaticamente**:
- Total de usuários, ativos, com trilhas
- Total de trilhas (pré-definidas vs personalizadas)
- Etapas (total, concluídas, taxa de conclusão)
- Habilidades cadastradas
- Atividade recente (últimos 7 dias)

---

## Modelos do Banco de Dados

### Conversation
Armazena conversas de chat:
- `user`: Usuário dono da conversa
- `conversation_id`: ID único da conversa
- `title`: Título auto-gerado
- `created_at`, `updated_at`: Timestamps

### ConversationMessage
Mensagens individuais:
- `conversation`: Conversa relacionada
- `role`: 'user' ou 'assistant'
- `content`: Texto da mensagem
- `created_at`: Timestamp

### UserMemory
Memória do usuário para contexto:
- `user`: Usuário (OneToOne)
- `career_goals`: Objetivos de carreira
- `interests`: Áreas de interesse
- `current_level`: Nível atual
- `profile_summary`: Resumo do perfil

## Estrutura do App

```
llm/
├── models.py          # Conversation, ConversationMessage, UserMemory
├── services.py        # GeminiService - integração com API
├── prompts.py         # Templates de prompts (user + admin)
├── utils.py           # Funções utilitárias (contexto, histórico)
├── views.py           # Endpoints da API
├── urls.py            # Rotas
├── admin.py           # Admin interface
└── README.md          # Este arquivo
```

## Como Funciona

### Chat com Histórico e Memória

1. **Usuário envia mensagem** com `conversation_id` (ou novo)
2. **Sistema busca contexto**:
   - Histórico da conversa (últimas 10 mensagens)
   - Perfil do usuário
   - Trilhas de carreira ativas
   - Progresso (etapas concluídas)
   - Objetivos de carreira (da memória)
3. **Formata contexto** para prompt do LLM
4. **Chama Gemini** com contexto completo
5. **Salva mensagens** (user + assistant) no banco
6. **Retorna resposta** com `conversation_id`

### Admin Insights

1. **Admin envia pergunta** sobre dashboard
2. **Sistema coleta métricas**:
   - Usuários, trilhas, etapas, habilidades
   - Taxa de conclusão
   - Atividade recente
3. **Formata métricas** para prompt
4. **Chama Gemini** com system instruction de análise
5. **Retorna insights** e métricas

## Tratamento de Erros

- **401 Unauthorized**: Usuário não autenticado
- **403 Forbidden**: Acesso negado (admin insights requer admin)
- **400 Bad Request**: Dados inválidos
- **500 Internal Server Error**: Erro na API do Gemini ou configuração

## Melhorias Futuras

- [x] Histórico de conversas persistente
- [x] Memória do usuário
- [x] Sistema separado para admin
- [ ] Cache de respostas do LLM
- [ ] Rate limiting por usuário
- [ ] Function calling para ações específicas
- [ ] Suporte a múltiplos modelos
- [ ] Logs e métricas de uso
- [ ] Exportar conversas

## Referências

- [Documentação Gemini API](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://ai.google.dev/)
- [SDK Python google-genai](https://github.com/google/generative-ai-python)
