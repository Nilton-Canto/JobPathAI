# Guia de Contribuição - JobPathAI

## Visão Geral
Este documento estabelece as convenções e melhores práticas para contribuir com o desenvolvimento do JobPathAI. Seguimos um fluxo de trabalho baseado no GitFlow com conventional commits.

## Pré-requisitos

### Ambiente de Desenvolvimento
- Python 3.8+
- Django 4.2+
- Git
- Node.js (futuro, para frontend avançado)

### Configuração Inicial
```bash
# Clonar o repositório
git clone <url-do-repositorio>

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser
```

## Fluxo de Desenvolvimento

### 1. Branches

#### Convenções de Nomenclatura
```
main           # Branch de produção (sempre estável)
develop        # Branch de desenvolvimento (integração)
feature/*      # Novas funcionalidades
bugfix/*       # Correções de bugs
hotfix/*       # Correções críticas em produção
release/*      # Preparação para release
```

#### Exemplos de Branches
```
feature/auth-system          # Sistema de autenticação
feature/career-paths         # Trilhas de carreira
feature/llm-integration      # Integração com LLM
bugfix/login-validation      # Correção na validação de login
hotfix/security-patch        # Correção de segurança urgente
```

### 2. Commits

#### Conventional Commits
Seguimos o padrão [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação/código (não funcional)
- `refactor`: Refatoração de código
- `test`: Adição/edição de testes
- `chore`: Manutenção/tarefas diversas

#### Exemplos de Commits
```
feat: adicionar sistema de autenticação de usuários
fix: corrigir validação de email no cadastro
docs: atualizar guia de instalação
style: formatar código seguindo PEP8
refactor: otimizar query de busca de usuários
test: adicionar testes para view de login
chore: atualizar requirements.txt
```

#### Regras dos Commits
- Use **imperativo presente**: "adicionar", não "adicionou" ou "adicionando"
- **Primeira letra minúscula**
- **Sem ponto final**
- **Máximo 72 caracteres** na linha do título
- **Corpo opcional** com descrição detalhada se necessário

### 3. Pull Requests (PR)

#### Template de PR
```markdown
## Descrição
Descrição clara e concisa do que foi implementado

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
Passos para testar a funcionalidade:
1. Faça X
2. Vá para Y
3. Clique em Z

## Screenshots (se aplicável)
Adicione screenshots das mudanças

## Checklist
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Código segue padrões do projeto
- [ ] Commit messages seguem convenções
```

#### Revisão de Código
- **Mínimo 1 aprovação** para merge
- **CI/CD deve passar** (quando implementado)
- **Cobertura de testes** deve ser mantida
- **Não há conflitos** com develop

## Estrutura do Projeto

```
JobPathAI/
├── config/                 # Configurações Django
├── cadastro/              # App de usuários (renomear para users)
├── docs/                  # Documentação
├── requirements.txt       # Dependências
├── manage.py             # Comando Django
└── README.md             # Documentação principal
```

## Boas Práticas

### Código
- **PEP8**: Seguir guia de estilo Python
- **Django best practices**: Padrões do framework
- **DRY (Don't Repeat Yourself)**: Evitar duplicação
- **SOLID principles**: Princípios de design orientado a objetos

### Testes
- **Testes unitários** para lógica de negócio
- **Testes de integração** para APIs
- **Testes end-to-end** para fluxos críticos
- **Cobertura mínima**: 70%

### Segurança
- **Nunca commite secrets**: Use variáveis de ambiente
- **Validação de entrada**: Sempre valide dados do usuário
- **CSRF protection**: Proteger contra ataques CSRF
- **SQL injection**: Usar ORM corretamente

## Desenvolvimento Local

### Servidor de Desenvolvimento
```bash
python manage.py runserver
```

### Testes
```bash
python manage.py test
```

### Linting
```bash
# Instalar flake8
pip install flake8

# Executar linting
flake8 .
```

### Migrações
```bash
# Criar migração
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate
```

## Troubleshooting

### Problemas Comuns
1. **Erro de migração**: Verificar se todas as dependências estão instaladas
2. **Erro de template**: Verificar se STATICFILES_DIRS está configurado
3. **Erro de autenticação**: Verificar se middleware está ativo

### Suporte
- **Issues no GitHub**: Para bugs e solicitações
- **Discord/Slack**: Para discussões em tempo real
- **Documentação**: Sempre atualizar quando fizer mudanças

## Reconhecimento
Contribuições são sempre bem-vindas! Todos os contribuidores serão reconhecidos no README.md do projeto.

---
*Guia atualizado em: Janeiro 2025*
