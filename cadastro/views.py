from django.views import View  # Importa a classe base para views orientadas a objetos
from django.contrib.auth import authenticate, login  # Funções para autenticar e logar usuários
from django.shortcuts import render, redirect  # Funções para renderizar templates e redirecionar

# Create your views here.
def index(request):
    context = {'titulo_pagina': 'Formulário de Cadastro'}
    return render(request, 'cadastro/index.html', context)

class LoginView(View):
    def get(self, request):
        # Renderiza o template de login quando o usuário acessa a página via GET
        return render(request, 'cadastro/login.html')

    def post(self, request):
        # Recebe os dados do formulário enviados via POST
        username = request.POST.get('username')  # Pega o nome de usuário do formulário
        password = request.POST.get('password')  # Pega a senha do formulário
        user = authenticate(request, username=username, password=password)  # Tenta autenticar o usuário
        if user is not None:
            # Se a autenticação for bem-sucedida, faz login e redireciona para a página principal
            login(request, user)
            return redirect('index')  # Encaminha para a view index
        else:
            # Se falhar, renderiza o template novamente com uma mensagem de erro
            return render(request, 'cadastro/login.html', {'error': 'Usuário ou senha inválidos'})
