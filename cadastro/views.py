from django.views import View  # Importa a classe base para views orientadas a objetos
from django.contrib.auth import authenticate, login  # Funções para autenticar e logar usuários
from django.shortcuts import render, redirect  # Funções para renderizar templates e redirecionar
from .models import Cadastro  # Importa o modelo Cadastro

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

def novo_usuario(request):
    if request.method == 'POST':
        # Recebe os dados do formulário enviados via POST
        nome_recebido = request.POST.get('nome')
        email_recebido = request.POST.get('email')
        idade_recebida = request.POST.get('idade')
        cpf_recebido = request.POST.get('cpf')

        # Lógica de verificação
        usuario_existente = Cadastro.objects.filter(email=email_recebido).exists()
        cpf_existente = Cadastro.objects.filter(cpf=cpf_recebido).exists()

        if usuario_existente:
            # Se o e-mail já existe, mostre uma mensagem de erro
            contexto = {'erro': 'Este e-mail já está cadastrado.'}
            return render(request, 'cadastro/novo_usuario.html', contexto)

        if cpf_existente:
            # Se o CPF já existe, mostre uma mensagem de erro
            contexto = {'erro': 'Este CPF já está cadastrado.'}
            return render(request, 'cadastro/novo_usuario.html', contexto)
        
        # Cria um novo objeto "Cadastro" e salva no banco de dados
        novo_cadastro = Cadastro.objects.create(
            nome=nome_recebido,
            email=email_recebido,
            idade=idade_recebida,
            cpf=cpf_recebido,
        )

        # Redireciona para a página de login após o cadastro
        return redirect('login')
    
    return render(request, 'cadastro/novo_usuario.html') # Vai para a página de cadastro de novo usuário