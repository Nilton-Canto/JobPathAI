# JobPathAI

> Planejamento de carreira com IA: trilhas profissionais pré-definidas ou personalizadas com apoio de um agente LLM.

## ✨ Visão Geral

O **JobPathAI** é uma aplicação web que ajuda usuários a **planejar suas carreiras**, oferecendo:
- **Trilhas profissionais personalizadas** (com base em perfil, interesses e competências).
- **Trilhas pré-definidas** por área/nível (ex.: Dados, Dev, Marketing; Júnior/Pleno/Sênior).
- **Sugestões de etapas de desenvolvimento** (cursos, certificações, projetos práticos, networking, soft skills).
- **Análise de lacunas** entre o perfil atual e o objetivo, com recomendações acionáveis.
- **Acompanhamento de progresso** e atualização dinâmica do plano conforme o usuário evolui.

O motor de recomendação usa um **agente LLM** para interpretar objetivos, mapear competências e sugerir caminhos alternativos e planos de progressão.

---

## 📚 Sumário

- [Demonstração](#-demonstração)
- [Principais Recursos](#-principais-recursos)
- [Arquitetura (alto nível)](#-arquitetura-alto-nível)
- [Stack & Pré-requisitos](#-stack--pré-requisitos)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Rodando Localmente](#-rodando-localmente)
- [Docker (opcional)](#-docker-opcional)
- [Scripts Comuns](#-scripts-comuns)
- [Estrutura de Pastas (sugerida)](#-estrutura-de-pastas-sugerida)
- [Uso](#-uso)
- [Modelagem de Trilhas](#-modelagem-de-trilhas)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Boas Práticas & Convenções](#-boas-práticas--convenções)
- [Privacidade & Ética](#-privacidade--ética)
- [Licença](#-licença)

---

## 🎥 Demonstração

- **Link do Figma**: visualização do projeto
https://www.figma.com/design/MENRFlavTgDypAr9o5ZFlN/wireframe-JobPathAI?node-id=0-1&t=j6G1rtdqwyYyS3hs-1

Apenas uma ideia de como o site pode ser, sujeita a futuras alterações. Neste link há a página inicial do site e um pop-up que aparece quando o usuário clica em "Login".

> _Adicione prints ou GIFs curtos aqui._

- Tela de onboarding do perfil (interesses, competências, objetivos).
- Visualização da trilha (timeline/kanban).
- Recomendações do agente LLM.
- Checklist de progresso.

---

## 🔑 Principais Recursos
- **Onboarding guiado**: coleta de objetivos, senioridade e preferências.
- **Recomendações com LLM**: caminhos sugeridos e explicados.
- **Trilhas**: pré-definidas por área/nível e personalizáveis.
- **Gaps & Skills**: comparação entre estado atual e alvo, com próximos passos.
- **Progresso**: marcar etapas concluídas, replanejar automaticamente.
- **Exportação**: gerar plano em PDF/Markdown/CSV (opcional).
- **Multi-idioma**: i18n pronto para PT-BR/EN (sugerido).

---

## 🏗 Arquitetura (alto nível)
**Observações:**
- O LLM recebe o **perfil** + **objetivo** + **histórico de progresso** para sugerir trilhas e etapas.
- Camada de **regra de negócio** valida, versiona e explica recomendações.
- **DB** armazena usuários, trilhas, etapas, progresso, feedback.
- **API RESTful (Django REST Framework)**: expõe endpoints para gerenciamento de usuários, trilhas de carreira e habilidades.

---

## 🧰 Stack & Pré-requisitos
- **Frontend**: React com TypeScript.
- **Backend**: Python/DJANGO, Django REST Framework.
- **DB**: SQL (SQLite usado em desenvolvimento).
- **LLM**: provedor compatível (ex.: OpenAI, Azure OpenAI, etc.).
- **Docker** (opcional)
- **Git** e **Make**
> Ajuste esta seção conforme sua implementação real.

---

## 🧪 Uso
- Crie seu perfil no onboarding: interesses, competências, objetivo (ex.: “Engenheiro de Dados Pleno em 12 meses”).
- Gere sua trilha com o agente LLM (pré-definida ou personalizada).
- Revise as etapas (cursos, projetos, certificações, soft skills).
- Acompanhe o progresso e dê feedback; a trilha se ajusta.
- Exporte seu plano se quiser (PDF/Markdown/CSV).

---

## 🧠 Modelagem de Trilhas
- **Trilha:** coleção de etapas (tarefas/objetivos com duração/complexidade).
- **Etapa:** ação recomendada (ex.: “Projeto ETL com Spark”).
- **Skill tags:** habilidades ligadas à etapa (ex.: python, spark, sql).
- **Critérios de conclusão:** definição de “feito” (artefato, avaliação, quiz).
- **Replanejamento:** o LLM reordena/insere/remove com base em progresso e feedback.

---

## 🗺 Roadmap
- **Fase 1: Base & Autenticação (Concluída)**
    - Configuração inicial do projeto (Django + React)
    - Autenticação e Cadastro de Usuários (Frontend e Backend API)
    - Validação de formulários no Frontend
    - Implementação básica de Dashboard e Perfil do Usuário (Frontend)
    - Configuração básica do app `career` no Backend (Modelos, Serializadores, Views, URLs)
- **Fase 2: Sistema de Trilhas & LLM (Em Andamento)**
    - Módulo de análise de lacunas com métricas claras.
    - Explicabilidade das recomendações (racional do LLM).
    - Memória do usuário (preferências e histórico).
    - Integração com plataformas de curso (ex.: Coursera/Udemy).
    - Painel de analytics do progresso.
    - Exportação de plano (PDF/CSV).
    - Internacionalização (EN, ES).
    - Autenticação social (Google/GitHub).
    - Autenticação social (Google/GitHub).
