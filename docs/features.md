# JobPathAI - Documento de Features

## Visão Geral
JobPathAI é um sistema web de recomendação de carreira que utiliza IA (LLM) para ajudar usuários a planejar suas carreiras profissionais através de trilhas personalizadas ou pré-definidas.

## Funcionalidades Implementadas ✅

### 1. Sistema de Autenticação e Cadastro
- **Login de usuários**: Autenticação com username/senha
- **Cadastro de novos usuários**: Formulário completo com validações
- **Validações implementadas**:
  - Username único
  - Email único
  - CPF único
  - Confirmação de senha
  - Campos obrigatórios
- **Tratamento de erros**: Mensagens de erro específicas para diferentes cenários

### 2. Estrutura de Dados do Usuário
- **Modelo Cadastro**: Armazena informações pessoais (nome, email, idade, CPF)
- **Integração com Django User**: Vinculação entre dados pessoais e autenticação
- **Validações de unicidade**: Prevenção de cadastros duplicados

### 3. Interface Básica
- **Templates HTML**: Páginas de login, cadastro e index
- **CSS básico**: Estilização para página de login
- **Estrutura responsiva**: Preparada para desenvolvimento mobile-first

### 4. Configuração do Projeto
- **Django 4.2.23**: Framework web Python
- **SQLite**: Banco de dados para desenvolvimento
- **Estrutura modular**: Apps Django organizados
- **Sistema de templates**: Configurado com diretórios customizados

## Funcionalidades Pendentes 🚧

### 5. Módulo de Carreiras
- **Modelo de Áreas Profissionais**: CRUD para áreas (Tecnologia, Marketing, etc.)
- **Modelo de Trilhas**: Caminhos de carreira por área/nível
- **Modelo de Etapas**: Passos específicos dentro das trilhas
- **Relacionamentos**: User -> Trilhas -> Etapas

### 6. Sistema de LLM
- **Integração com OpenAI**: API para geração de recomendações
- **Prompts personalizados**: Baseados no perfil do usuário
- **Análise de lacunas**: Comparação entre perfil atual e objetivo
- **Sugestões contextuais**: Recomendações baseadas em progresso

### 7. Dashboard do Usuário
- **Visualização de trilhas**: Interface gráfica das carreiras
- **Acompanhamento de progresso**: Checklist de etapas concluídas
- **Timeline interativa**: Cronograma visual da carreira
- **Métricas de progresso**: Estatísticas e indicadores

### 8. Interface Avançada
- **Design responsivo completo**: Mobile, tablet e desktop
- **Componentes reutilizáveis**: Cards, modais, navegação
- **Animações e transições**: UX aprimorada
- **Acessibilidade**: WCAG compliance

### 9. Funcionalidades Administrativas
- **Painel admin**: Gestão de usuários, trilhas e etapas
- **Relatórios**: Analytics de uso do sistema
- **Backup/Restore**: Gestão de dados
- **Logs de auditoria**: Rastreamento de ações

### 10. Recursos Avançados
- **Exportação de dados**: PDF, CSV, Markdown
- **Integração com plataformas**: Coursera, Udemy, LinkedIn
- **Sistema de notificações**: Lembretes de progresso
- **Gamificação**: Pontos, badges, conquistas

## Casos de Uso Prioritários

### UC01 - Autenticação (✅ IMPLEMENTADO)
- Login com credenciais válidas
- Redirecionamento após login
- Tratamento de erros de autenticação

### UC02 - Cadastro (✅ IMPLEMENTADO)
- Formulário de cadastro completo
- Validações de dados
- Criação de conta e redirecionamento

### UC03 - Visualização de Perfil (🚧 PENDENTE)
- Dashboard pessoal
- Informações do usuário
- Histórico de atividades

### UC04 - Seleção de Trilhas (🚧 PENDENTE)
- Listagem de trilhas pré-definidas
- Filtros por área/nível
- Visualização detalhada

### UC05 - Plano Personalizado (🚧 PENDENTE)
- Formulário de onboarding
- Geração via LLM
- Ajustes manuais

### UC06 - Acompanhamento (🚧 PENDENTE)
- Marcação de etapas concluídas
- Atualização automática do progresso
- Relatórios de andamento

## Tecnologias e Dependências

### Backend
- **Django 4.2.23**: Framework web principal
- **SQLite**: Banco de dados (desenvolvimento)
- **PostgreSQL**: Banco de dados (produção)
- **OpenAI API**: Serviço de LLM

### Frontend
- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização e layout
- **JavaScript**: Interatividade (futuro)
- **Bootstrap/Tailwind**: Framework CSS (futuro)

### DevOps
- **Docker**: Containerização
- **Git**: Controle de versão
- **GitHub Actions**: CI/CD (futuro)

## Critérios de Aceitação

### Funcionalidades Core
- [x] Sistema de autenticação funcionando
- [x] Cadastro de usuários com validações
- [ ] Interface responsiva completa
- [ ] Integração com LLM
- [ ] Sistema de trilhas de carreira
- [ ] Dashboard de progresso

### Qualidade
- [x] Código seguindo padrões Django
- [ ] Testes automatizados (70% cobertura)
- [ ] Documentação técnica completa
- [ ] Performance < 2s por ação

## Próximos Passos de Desenvolvimento

1. **Fase 1**: Melhorar interface e UX
2. **Fase 2**: Implementar modelos de carreira
3. **Fase 3**: Integrar LLM (OpenAI)
4. **Fase 4**: Dashboard e analytics
5. **Fase 5**: Recursos avançados e otimização

---
*Documento atualizado em: Janeiro 2025*
*Status: Em desenvolvimento ativo*
