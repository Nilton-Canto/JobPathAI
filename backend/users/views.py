from django.views import View  # Importa a classe base para views orientadas a objetos
from django.contrib.auth import authenticate, login  # Funções para autenticar e logar usuários
from django.shortcuts import render, redirect  # Funções para renderizar templates e redirecionar
from .models import Users  # Importa o modelo Users
from django.contrib.auth.models import User  # Importa o modelo User do Django
from django.http import JsonResponse  # Importa JsonResponse para respostas JSON
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json  # Importa o módulo JSON para manipulação de dados JSON

# Create your views here.
def index(request):
    context = {'titulo_pagina': 'Formulário de Cadastro'}
    return render(request, 'users/index.html', context)

class LoginView(View):
    def get(self, request):
        # Renderiza o template de login quando o usuário acessa a página via GET
        return render(request, 'users/login.html')

    def post(self, request):
        # Recebe os dados do formulário enviados via POST
        username_recebido = request.POST.get('username')  # Pega o nome de usuário do formulário
        password_recebida = request.POST.get('password')  # Pega a senha do formulário
        
        #Debugando
        print(f"Tentativa de login com Username: '{username_recebido}'")
        print(f"Tentativa de login com Senha: '{password_recebida}'")

        try:
            # Tenta encontrar o usuário no banco de dados
            user = User.objects.get(username=username_recebido)

            # Verifica se a senha corresponde
            if user.check_password(password_recebida):
                # Se a senha estiver correta, faça o login
                login(request, user)
                return redirect('index')
            else:
                # Senha incorreta
                contexto = {'error': 'Senha incorreta.'}
                return render(request, 'users/login.html', contexto)
        except User.DoesNotExist:
            # Usuário não encontrado
            contexto = {'error': 'Usuário não encontrado.'}
            return render(request, 'users/login.html', contexto)
        '''
        

        user = authenticate(request, username=username_recebido, password=password_recebida)  # Tenta autenticar o usuário
        if user is not None:
            # Se a autenticação for bem-sucedida, faz login e redireciona para a página principal
            login(request, user)
            return redirect('index')  # Encaminha para a view index
        else:
            # Se falhar, renderiza o template novamente com uma mensagem de erro
            return render(request, 'users/login.html', {'error': 'Usuário ou senha inválidos'})
'''

@method_decorator(csrf_exempt, name='dispatch')
class NewUsersView(View):
    def get(self, request):
        return render(request, 'users/register.html')

    def post(self, request):
        # Tenta carregar os dados como JSON
        is_json_request = False
        try:
            data = json.loads(request.body)
            is_json_request = True
            nome_recebido = data.get('name', '').strip()
            username_recebido = data.get('username', '').strip()
            email_recebido = data.get('email', '').strip()
            idade_recebida = data.get('age', '').strip()
            cpf_recebido = data.get('cpf', '').strip()
            password_recebida = data.get('password', '').strip()
            confirm_password_recebida = data.get('confirm_password', '').strip()

            # Validação básica json
            
            if User.objects.filter(username=username_recebido).exists():
                return JsonResponse({'detail': 'Este nome de usuário já está em uso.'}, status=400)
            if User.objects.filter(email=email_recebido).exists():
                return JsonResponse({'detail': 'Este e-mail já está em uso.'}, status=400)
            if Users.objects.filter(cpf=cpf_recebido).exists():
                return JsonResponse({'detail': 'Este CPF já está cadastrado.'}, status=400)
            if password_recebida != confirm_password_recebida:
                return JsonResponse({'detail': 'As senhas não coincidem.'}, status=400)
        
        except Exception:
            # Se não for JSON, tenta pegar do formulário tradicional
            nome_recebido = request.POST.get('name', '').strip()
            username_recebido = request.POST.get('username', '').strip()
            email_recebido = request.POST.get('email', '').strip()
            idade_recebida = request.POST.get('age', '').strip()
            cpf_recebido = request.POST.get('cpf', '').strip()
            password_recebida = request.POST.get('password', '').strip()
            confirm_password_recebida = request.POST.get('confirm_password', '').strip()
            
            # Validação básica form
            if User.objects.filter(username=username_recebido).exists():
                return render(request, 'users/register.html', {'error': 'Este nome de usuário já está em uso.'})
            if User.objects.filter(email=email_recebido).exists():
                return render(request, 'users/register.html', {'error': 'Este e-mail já está em uso.'})
            if Users.objects.filter(cpf=cpf_recebido).exists():
                return render(request, 'users/register.html', {'error': 'Este CPF já está cadastrado.'})
            if password_recebida != confirm_password_recebida:
                return render(request, 'users/register.html', {'error': 'As senhas não coincidem.'})

        # Criação do usuário
        user = User.objects.create_user(username=username_recebido, password=password_recebida, email=email_recebido)
        new_user = Users.objects.create(
            nome=nome_recebido,
            email=email_recebido,
            idade=idade_recebida,
            cpf=cpf_recebido
        )
        if is_json_request:
            return JsonResponse({'detail': 'Usuário cadastrado com sucesso!'}, status=201)
        return redirect('index')
        