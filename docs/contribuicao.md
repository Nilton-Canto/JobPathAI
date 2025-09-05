# Guia de Contribuição para o JobPathAI

Este documento descreve as diretrizes para contribuir com o projeto JobPathAI, focando nas convenções de branches e mensagens de commit.

## 1. Convenções de Nomenclatura de Branches

Para manter o histórico do Git limpo e organizado, seguimos as seguintes convenções de nomenclatura de branches:

- **`main`**: Branch principal e protegida, onde o código em produção reside. Nenhuma alteração direta é permitida nesta branch.
- **`develop`**: Branch de integração para todas as novas funcionalidades e correções de bugs que serão lançadas na próxima versão.
- **`feature/<nome-da-feature>`**: Para o desenvolvimento de novas funcionalidades. O `<nome-da-feature>` deve ser descritivo e conciso, usando kebab-case (ex: `feature/onboarding-inicial`, `feature/integracao-llm`).
- **`bugfix/<nome-do-bug>`**: Para correção de bugs. O `<nome-do-bug>` deve ser uma breve descrição do problema (ex: `bugfix/login-invalido`, `bugfix/erro-visualizacao-perfil`).
- **`hotfix/<nome-do-hotfix>`**: Para correções urgentes diretamente na `main` (raramente usada, apenas em casos críticos). O `<nome-do-hotfix>` deve descrever a correção (ex: `hotfix/falha-autenticacao`).
- **`refactor/<nome-do-refactor>`**: Para refatorações de código que não adicionam novas funcionalidades nem corrigem bugs, mas melhoram a estrutura ou performance (ex: `refactor/otimizacao-queries`).
- **`docs/<nome-da-doc>`**: Para atualizações na documentação (ex: `docs/atualizar-readme`).

**Exemplo de fluxo:**

1. Crie uma branch a partir da `develop` (ex: `git checkout -b feature/minha-feature develop`).
2. Desenvolva sua funcionalidade.
3. Faça commits seguindo as diretrizes abaixo.
4. Quando a funcionalidade estiver pronta, abra um Pull Request para a `develop`.

## 2. Convenções de Mensagens de Commit

As mensagens de commit devem ser claras, concisas e seguir o padrão Conventional Commits sempre que possível. Isso facilita a leitura do histórico do projeto e a geração automática de changelogs.

### Formato da Mensagem de Commit:

```
<tipo>(<escopo>): <descrição>

[corpo-opcional]

[rodape-opcional]
```

- **`<tipo>`**: Obrigatório, deve ser um dos seguintes:
    - `feat`: Uma nova funcionalidade.
    - `fix`: Uma correção de bug.
    - `docs`: Alterações na documentação.
    - `style`: Alterações que não afetam o significado do código (espaços em branco, formatação, ponto e vírgula ausentes, etc.).
    - `refactor`: Uma mudança de código que não corrige um bug nem adiciona uma funcionalidade.
    - `perf`: Uma mudança de código que melhora o desempenho.
    - `test`: Adição de testes ausentes ou correção de testes existentes.
    - `build`: Alterações que afetam o sistema de build ou dependências externas (escopo npm, gulp, etc.).
    - `ci`: Alterações nos arquivos e scripts de configuração de CI.
    - `chore`: Outras alterações que não modificam o código-fonte ou os arquivos de teste (ex: atualização de dependências, tarefas de build).
    - `revert`: Reverte um commit anterior.

- **`<escopo>` (opcional)**: Indica a parte do sistema que foi afetada pela mudança (ex: `(login)`, `(cadastro)`, `(api)`, `(frontend)`, `(llm)`).

- **`<descrição>`**: Obrigatório, uma descrição concisa da mudança, escrita no imperativo, começando com letra minúscula e sem ponto final.

- **`[corpo-opcional]`**: Um corpo de mensagem mais detalhado, se necessário, explicando o *porquê* da mudança, e não o *como*. Use quebras de linha para manter a legibilidade.

- **`[rodape-opcional]`**: Pode conter informações de fechamento de issues (ex: `Closes #123`), referências a Pull Requests, ou informações de *Breaking Changes*.

### Exemplos de Mensagens de Commit:

```
feat(autenticacao): adicionar funcionalidade de login de usuário
```

```
fix(cadastro): corrigir validação de email duplicado

O email não estava sendo verificado corretamente no banco de dados, permitindo cadastros duplicados.
```

```
docs: atualizar seção de instalação no README
```

```
refactor(views): otimizar importações na LoginView
```

## 3. Antes de Contribuir

- Certifique-se de que todas as dependências estão instaladas (`pip install -r requirements.txt`).
- Rode os testes locais (`python manage.py test`) para garantir que suas mudanças não quebraram nada.
- Formate o código usando ferramentas como `black` e `isort`.
- Atualize a documentação, se suas mudanças impactarem o funcionamento ou a configuração do projeto.

---
