#### 1. Primeira coisa que você vai fazer é criar sua branch

## Etapa para sair da main branch e criar sua própria
## Coloque como nome da sua branch suas iniciais e depois o que você vai desenvolver nela como meu Exemplo hrsb-app-django

git checkout main   # garante que está na principal
git pull origin main # atualiza com a versão mais recente
git checkout -b minha-nova-branch

git branch -m nome-atual nome-novo # renomeia a branch

#### 2. Segundo passo entrar no ambiente virtual
## Windows
./.venv(nome-do-ambiente)/Script/activate

## MacOS
source ./.venv(nome-do-ambiente)/Script/activate