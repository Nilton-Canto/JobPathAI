# Separação de Acessos - JobPathAI

## 📋 Visão Geral

O JobPathAI possui **dois ambientes completamente separados** para diferentes tipos de usuários:

1. **Área do Cliente/Usuário** - Para estudantes e usuários regulares
2. **Área Administrativa** - Para administradores e gestores do sistema

---

## 🎯 Área do Cliente/Usuário

### Propósito
Área destinada aos **estudantes e usuários finais** que utilizam a plataforma para:
- Explorar trilhas de carreira pré-definidas
- Criar planos de carreira personalizados com IA
- Acompanhar seu progresso nas trilhas
- Interagir com o mentor IA
- Gerenciar seu perfil pessoal

### Características
- **Header**: Design limpo e amigável (fundo claro)
- **Visual**: Focado em experiência do usuário
- **Funcionalidades**: Explorar, criar, acompanhar, aprender
- **Acesso**: Qualquer usuário cadastrado

### Rotas
- `/` - Página inicial
- `/login` - Login
- `/register` - Cadastro
- `/dashboard` - Dashboard do usuário
- `/profile` - Perfil do usuário
- `/explore-career-paths` - Explorar trilhas pré-definidas
- `/create-custom-plan` - Criar plano personalizado via IA
- `/chat-mentor` - Chat com mentor IA
- `/my-plan/:id` - Visualizar plano de carreira e progresso

### Componentes
- **Header**: `components/Header/Header.tsx`
- **Layout**: Layout padrão da aplicação
- **Estilo**: Design moderno, cores claras, foco em usabilidade

### Funcionalidades Disponíveis

#### 1. Explorar Trilhas de Carreira
- Visualizar trilhas pré-definidas por área profissional
- Filtrar por categoria (Tecnologia, Design, Dados, etc.)
- Buscar trilhas específicas
- Ver detalhes de cada trilha (etapas, habilidades, duração)

#### 2. Criar Plano Personalizado
- Descrever objetivos e interesses
- Gerar trilha personalizada via LLM
- Receber recomendações baseadas em perfil

#### 3. Acompanhar Progresso
- Visualizar trilha selecionada/criada
- Ver etapas concluídas e pendentes
- Marcar etapas como concluídas
- Ver barra de progresso

#### 4. Chat com Mentor IA
- Fazer perguntas sobre carreira
- Receber orientações personalizadas
- Obter sugestões de desenvolvimento

#### 5. Gerenciar Perfil
- Visualizar informações pessoais
- Editar dados do perfil
- Atualizar preferências

---

## 👑 Área Administrativa

### Propósito
Área destinada aos **administradores e gestores** do sistema para:
- Gerenciar trilhas de carreira (CRUD)
- Gerenciar áreas profissionais
- Gerenciar etapas de carreira
- Gerenciar usuários do sistema
- Configurar conteúdo e categorias

### Características
- **Header**: Design profissional (fundo escuro #1f2937)
- **Visual**: Focado em gestão e administração
- **Funcionalidades**: CRUD, configurações, gestão
- **Acesso**: Apenas usuários com permissão de admin (`is_superuser` ou `is_staff`)

### Rotas
- `/admin` - Redireciona para `/admin/career-paths`
- `/admin/career-paths` - Gerenciar trilhas de carreira
- `/admin/career-paths/new` - Criar nova trilha
- `/admin/career-paths/:id/edit` - Editar trilha existente
- `/admin/areas` - Gerenciar áreas profissionais
- `/admin/users` - Gerenciar usuários do sistema

### Componentes
- **Header**: `components/Header/AdminHeader.tsx` (separado)
- **Layout**: `components/Layout/AdminLayout.tsx` (wrapper especial)
- **Estilo**: Design profissional, cores escuras, foco em funcionalidade

### Funcionalidades Disponíveis

#### 1. Gerenciar Trilhas de Carreira
- **Criar**: Adicionar novas trilhas pré-definidas
- **Listar**: Ver todas as trilhas (pré-definidas e personalizadas)
- **Editar**: Modificar trilhas existentes
- **Deletar**: Remover trilhas (com validações)
- **Ativar/Desativar**: Controlar disponibilidade

#### 2. Gerenciar Etapas
- Adicionar etapas a trilhas
- Reordenar etapas (drag-and-drop)
- Editar conteúdo de etapas
- Associar habilidades a etapas

#### 3. Gerenciar Áreas Profissionais
- Criar categorias de áreas
- Organizar trilhas por área
- Configurar níveis (Júnior, Pleno, Sênior)

#### 4. Gerenciar Usuários
- Visualizar lista de usuários
- Editar informações de usuários
- Atribuir permissões
- Desativar/ativar contas

### Proteção de Acesso

A área administrativa possui **proteção automática**:

1. **Verificação de Login**: Usuário deve estar autenticado
2. **Verificação de Permissão**: Usuário deve ser admin (`is_superuser` ou `is_staff`)
3. **Redirecionamento Automático**: 
   - Se não autenticado → `/login`
   - Se não for admin → `/dashboard` (com mensagem de acesso negado)

---

## 🔐 Sistema de Autenticação

### Tipos de Usuário

#### Usuário Regular (Cliente)
- **Modelo**: `User` (Django) + `Users` (customizado)
- **Permissões**: Apenas acesso à área do cliente
- **Login**: Redireciona para `/dashboard`
- **Características**:
  - `is_superuser = False`
  - `is_staff = False`

#### Administrador
- **Modelo**: `User` (Django) com flags especiais
- **Permissões**: Acesso completo (cliente + admin)
- **Login**: 
  - Se acessar `/admin/*` → Área administrativa
  - Se acessar rotas normais → Área do cliente
- **Características**:
  - `is_superuser = True` OU
  - `is_staff = True`

### Fluxo de Autenticação

```
Login → Verificar Credenciais
  ├─ Se Admin (is_superuser/is_staff)
  │   ├─ Acessar /admin/* → AdminLayout (AdminHeader)
  │   └─ Acessar rotas normais → Header normal
  │
  └─ Se Usuário Regular
      └─ Apenas rotas normais → Header normal
```

---

## 🎨 Diferenças Visuais

### Header do Cliente
- **Cor de fundo**: Branco (#ffffff)
- **Cor do texto**: Escuro (#212529)
- **Logo**: Gradiente roxo/azul
- **Navegação**: Links para funcionalidades do usuário
- **Estilo**: Moderno, amigável, acessível

### Header do Admin
- **Cor de fundo**: Escuro (#1f2937)
- **Cor do texto**: Branco/claro
- **Logo**: "JP" em azul
- **Navegação**: Links para gestão (Trilhas, Áreas, Usuários)
- **Estilo**: Profissional, focado em gestão

---

## 📁 Estrutura de Arquivos

```
frontend/src/
├── components/
│   ├── Header/
│   │   ├── Header.tsx          # Header do CLIENTE (não mostra admin)
│   │   └── AdminHeader.tsx     # Header do ADMIN (separado)
│   └── Layout/
│       └── AdminLayout.tsx     # Layout wrapper para admin
│
└── pages/
    ├── admin/                  # Páginas ADMIN (separadas)
    │   └── AdminCareerPathsPage.tsx
    └── [páginas cliente]       # Páginas do CLIENTE
```

---

## 🚫 Regras Importantes

### ❌ NÃO Fazer
1. **NÃO** mostrar link "Admin" no Header do cliente
2. **NÃO** permitir navegação direta entre áreas sem verificação
3. **NÃO** misturar funcionalidades de admin e cliente na mesma página
4. **NÃO** usar o mesmo header para ambas as áreas

### ✅ Fazer
1. **Manter separação clara** entre áreas
2. **Verificar permissões** antes de acessar `/admin/*`
3. **Usar componentes específicos** para cada área
4. **Documentar** todas as funcionalidades de cada área

---

## 🔄 Como Acessar a Área Admin

### Para Administradores
1. Fazer login normalmente em `/login`
2. Acessar diretamente `/admin` ou `/admin/career-paths`
3. O sistema verifica permissões automaticamente
4. Se for admin → Acesso permitido
5. Se não for admin → Redirecionado para `/dashboard`

### Para Usuários Regulares
- **NÃO** têm acesso à área admin
- Tentativas de acesso resultam em redirecionamento
- Mensagem de "Acesso Negado" é exibida

---

## 📝 Notas de Desenvolvimento

### Verificação de Admin
A verificação é feita em `AdminLayout.tsx`:

```typescript
const checkAdminStatus = async () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    navigate('/login');
    return;
  }

  const adminStatus = await userAPI.isAdmin();
  if (!adminStatus) {
    navigate('/dashboard'); // Redireciona usuários não-admin
  }
};
```

### Endpoint de Verificação
- **Backend**: `/api/user-profile/` retorna `is_superuser`, `is_staff`, `is_admin`
- **Frontend**: `userAPI.isAdmin()` verifica essas flags

---

## 🎯 Resumo

| Aspecto | Área Cliente | Área Admin |
|---------|-------------|------------|
| **Usuários** | Todos os usuários | Apenas admins |
| **Header** | Header.tsx (claro) | AdminHeader.tsx (escuro) |
| **Layout** | Layout padrão | AdminLayout.tsx |
| **Rotas** | `/dashboard`, `/profile`, etc. | `/admin/*` |
| **Propósito** | Usar a plataforma | Gerenciar a plataforma |
| **Visual** | Amigável, moderno | Profissional, gestão |
| **Navegação** | Explorar, criar, acompanhar | CRUD, configurações |

---

**Última atualização**: Janeiro 2025



