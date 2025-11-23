# Estrutura do Frontend - JobPathAI

## 📁 Organização de Arquivos

### Estrutura de Diretórios

```
frontend/src/
├── components/          # Componentes reutilizáveis
│   ├── Header/         # Header do usuário (área pública/privada)
│   │   ├── Header.tsx
│   │   └── AdminHeader.tsx  # Header específico para admin
│   └── Layout/         # Layouts de página
│       └── AdminLayout.tsx  # Layout wrapper para área admin
│
├── pages/              # Páginas da aplicação
│   ├── admin/         # Páginas administrativas
│   │   └── AdminCareerPathsPage.tsx
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProfilePage.tsx
│   ├── ExploreCareerPathsPage.tsx
│   ├── CreateCustomPlanPage.tsx
│   ├── ChatMentorPage.tsx
│   └── MyCareerPlanPage.tsx
│
├── services/          # Camada de serviços (APIs)
│   └── api.ts        # Centralização de chamadas API
│
├── App.tsx           # Componente raiz e rotas
└── main.tsx          # Entry point
```

## 🔀 Diferença entre HTML e TSX

### Arquivos HTML Estáticos (frontend/*.html)
- **Localização**: `frontend/*.html` (raiz do frontend)
- **Propósito**: Protótipos/mockups estáticos
- **Status**: Podem ser removidos ou mantidos como referência
- **Exemplos**: `admin-nova-trilha.html`, `meu-plano.html`, etc.

### Arquivos TSX (React Components)
- **Localização**: `frontend/src/pages/*.tsx`
- **Propósito**: Componentes React funcionais e integrados
- **Status**: **ESTES SÃO OS QUE ESTÃO SENDO USADOS**
- **Vantagens**:
  - Integração com APIs
  - Estado reativo
  - Roteamento dinâmico
  - Reutilização de componentes

### ⚠️ Importante
- **Use os arquivos `.tsx`** - eles são os componentes React funcionais
- Os arquivos `.html` são apenas protótipos antigos
- O React Router usa os componentes TSX, não os HTMLs

## 🎯 Separação Admin vs Usuário

### Área do Usuário (Cliente/Aluno)
- **Header**: `components/Header/Header.tsx`
- **Rotas**: `/dashboard`, `/profile`, `/explore-career-paths`, etc.
- **Visual**: Design limpo e amigável
- **Funcionalidades**: Explorar trilhas, criar planos, chat com mentor

### Área Administrativa
- **Header**: `components/Header/AdminHeader.tsx` (diferente, mais escuro)
- **Layout**: `components/Layout/AdminLayout.tsx` (wrapper especial)
- **Rotas**: `/admin/*` (todas as rotas admin começam com `/admin`)
- **Visual**: Design mais profissional, focado em gestão
- **Funcionalidades**: CRUD de trilhas, áreas, usuários

### Estrutura de Rotas

```typescript
// Rotas Públicas
/                    → HomePage
/login              → LoginPage
/register           → RegisterPage

// Rotas do Usuário
/dashboard          → DashboardPage
/profile            → ProfilePage
/explore-career-paths → ExploreCareerPathsPage
/create-custom-plan → CreateCustomPlanPage
/chat-mentor        → ChatMentorPage
/my-plan/:id        → MyCareerPlanPage

// Rotas Admin (todas sob /admin/*)
/admin              → Redireciona para /admin/career-paths
/admin/career-paths → AdminCareerPathsPage
/admin/areas        → (em desenvolvimento)
/admin/users        → (em desenvolvimento)
```

## 🔐 Autenticação e Permissões

### Verificação de Admin (TODO)
Atualmente, a verificação de admin não está implementada. Precisa:

1. **Backend**: Endpoint para verificar se usuário é admin
2. **Frontend**: Middleware/guarda de rota para proteger `/admin/*`
3. **Service**: Função `authAPI.isAdmin()` ou similar

### Implementação Futura
```typescript
// Em AdminLayout.tsx
const AdminLayout = () => {
  const isAdmin = useAuth(); // Hook customizado
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="admin-layout">
      <AdminHeader />
      {/* ... */}
    </div>
  );
};
```

## 📝 Notas de Desenvolvimento

### Arquivos HTML vs TSX
- ✅ **Use**: `src/pages/*.tsx` (componentes React)
- ❌ **Não use**: `*.html` na raiz (apenas protótipos)
- 🗑️ **Pode remover**: Os arquivos HTML após confirmar que tudo funciona

### Estrutura Recomendada
- Mantenha páginas admin em `pages/admin/`
- Mantenha componentes admin em `components/Header/AdminHeader.tsx`
- Use `AdminLayout` para wrappear todas as rotas admin

### Próximos Passos
1. Implementar verificação de permissões admin
2. Adicionar mais páginas admin (Áreas, Usuários)
3. Melhorar diferenciação visual entre áreas
4. Adicionar breadcrumbs na área admin

