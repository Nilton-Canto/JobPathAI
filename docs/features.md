# JobPathAI - Sistema de Recomendação de Carreira

## 1. Visão Geral do Projeto

O JobPathAI é uma aplicação web desenvolvida para auxiliar usuários na definição e planejamento de suas carreiras profissionais. O sistema permite que o usuário escolha entre trilhas de carreira pré-definidas ou crie um plano de carreira personalizado com o auxílio de um agente baseado em LLM (Large Language Model). Com base no perfil, interesses e competências do usuário, o sistema sugerirá possíveis caminhos profissionais e as etapas recomendadas para alcançá-los.

## 2. Requisitos do Sistema

### 2.1 Requisitos Funcionais

- Autenticação de usuários (login e cadastro).
- Escolha de trilhas de carreira pré-definidas por área.
- Criação de planos de carreira personalizados com o auxílio de um agente LLM, a partir de uma descrição textual do usuário.
- Visualização do progresso nas etapas da carreira escolhida.
- Marcar etapas como concluídas.
- Administração de áreas profissionais, trilhas de carreira e etapas (CRUD).
- Interface de conversa com o agente LLM para sugestões e dúvidas relacionadas à carreira.

### 2.2 Requisitos Não Funcionais

- O sistema deve ser desenvolvido com Django no backend (utilizando Django REST Framework para APIs).
- O frontend utilizará React com TypeScript, HTML, CSS e JS com design responsivo.
- Integração com API LLM (OpenAI ou Ollama local).
- Interface amigável e intuitiva.
- Tempo de resposta do sistema inferior a 2 segundos para ações principais.

## 3. Casos de Uso

- UC01 – Login e autenticação do usuário.
- UC02 – Escolher trilha de carreira pré-definida.
- UC03 – Solicitar plano de carreira personalizado via LLM.
- UC04 – Visualizar plano de carreira e progresso.
- UC05 – Marcar etapa como concluída.
- UC06 – Gerenciar áreas profissionais, trilhas e etapas (Admin).
