# Estrutura do Repositório JobPathAI

Este documento descreve a estrutura monorepo adotada para o projeto JobPathAI, facilitando a compreensão e a colaboração entre as equipes de frontend e backend.

## Visão Geral - Monorepo

Optamos por uma estrutura de monorepo para centralizar o código do frontend (React com TypeScript) e do backend (Django) em um único repositório Git. Isso promove a coesão, simplifica o versionamento e a gestão de dependências entre as partes da aplicação.

```
JobPathAI/
├── backend/                    # Contém todo o projeto Django
│   ├── config/                 # Configurações globais do Django
│   ├── users/                  # App Django para autenticação e gestão de usuários
│   ├── career/                 # App Django para trilhas de carreira e etapas (com Django REST Framework)
│   ├── llm/                    # Futuro app Django para integração com LLM
│   ├── manage.py               # Utilitário de linha de comando do Django
│   ├── requirements.txt        # Dependências Python do backend
│   └── ... outros apps Django (se houver)
├── frontend/                   # Contém todo o projeto React com TypeScript (Vite)
│   ├── public/                 # Arquivos estáticos que serão servidos diretamente
│   ├── src/                    # Código fonte da aplicação React
│   │   ├── assets/
│   │   │   ├──react.svg
│   │   ├── components/         # Componentes React reutilizáveis
│   │   ├── pages/              # Páginas da aplicação (ex: Login, Cadastro, Dashboard, Perfil)
│   │   ├── services/           # Funções para comunicação com o backend (APIs)
│   │   ├── types/              # Definições de tipos TypeScript
│   │   ├── vite-env.d.ts
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── App.tsx             # Componente raiz da aplicação
│   │   └── main.tsx            # Ponto de entrada da aplicação React
│   ├── package.json            # Dependências e scripts Node.js do frontend
│   ├── eslint.config.js
│   ├── tsconfig.node.json
│   ├── tsconfig.app.json
│   ├── index.html
│   ├── .gitignore
│   ├── tsconfig.json           # Configurações do TypeScript
│   ├── vite.config.ts          # Configurações do Vite
├── docs/                       # Documentação do projeto
│   ├── features.md
│   ├── contribuicao.md
│   └── estrutura_repositorio.md
├── .github/                    # Configurações de CI/CD (GitHub Actions, etc.)
├── .gitignore                  # Arquivos e pastas a serem ignorados pelo Git
├── README.md                   # README principal do projeto
└── ... outros arquivos de configuração global
```

## Orientação para Desenvolvedores

### Backend (Django)

*   O código Django deve residir exclusivamente na pasta `backend/`.
*   Para cada funcionalidade ou módulo principal, crie um novo app Django (ex: `career`, `llm`).
*   Utilize o `manage.py` dentro de `backend/` para operações Django (ex: `python backend/manage.py runserver`).
*   Gerencie as dependências Python no `backend/requirements.txt`.
*   As APIs RESTful são desenvolvidas usando o Django REST Framework, com endpoints versionados sob `/api/v1/`.

### Frontend (React com TypeScript)

*   O código React/TypeScript deve residir exclusivamente na pasta `frontend/`.
*   Utilize `npm` ou `yarn` dentro de `frontend/` para gerenciar as dependências e scripts do frontend (ex: `cd frontend && npm install`, `npm run dev`).
*   Mantenha a modularidade criando componentes, páginas e serviços bem definidos.
*   A comunicação com o backend Django será feita através de APIs RESTful.

### Contribuição Geral

*   Siga as convenções de branches e commits descritas em `docs/contribuicao.md`.
*   Garanta que seus Pull Requests contenham alterações tanto no frontend quanto no backend, se a funcionalidade assim o exigir, e que ambos os projetos sejam testados em conjunto.
