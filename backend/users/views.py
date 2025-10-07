from django.views import View  # Importa a classe base para views orientadas a objetos
from django.contrib.auth import authenticate, login  # Funções para autenticar e logar usuários
from django.shortcuts import render, redirect  # Funções para renderizar templates e redirecionar
from .models import Users  # Importa o modelo Users
from django.contrib.auth.models import User  # Importa o modelo User do Django
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# Create your views here.
def index(request):
    return JsonResponse({'status': 'Backend funcionando!👍', 'message': 'Este é o endpoint raiz da API.'})

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def get(self, request):
        return JsonResponse({'message': 'Endpoint de Login da API'})

    def post(self, request):
        try:
            data = json.loads(request.body)
            username_recebido = data.get('username')
            password_recebida = data.get('password')

            print(f"Tentativa de login com Username: '{username_recebido}'")
            print(f"Tentativa de login com Senha: '{password_recebida}'")

            user = authenticate(request, username=username_recebido, password=password_recebida)
            
            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login bem-sucedido!', 'user_id': user.id}) # Retorna user_id para o frontend
            else:
                return JsonResponse({'error': 'Usuário ou senha inválidos.'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Requisição inválida. JSON malformado.'}, status=400)
        except Exception as e:
            print(f"Erro no login: {e}")
            return JsonResponse({'error': 'Erro interno do servidor.'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class NewUsersView(View):
    def get(self, request):
        return JsonResponse({'message': 'Endpoint de Cadastro da API'})

    def post(self, request):
        try:
            data = json.loads(request.body)
            nome_recebido = data.get('name')
            username_recebido = data.get('username')
            email_recebido = data.get('email')
            idade_recebida = data.get('age')
            cpf_recebido = data.get('cpf')
            password_recebida = data.get('password')

            if not all([nome_recebido, username_recebido, email_recebido, idade_recebida, cpf_recebido, password_recebida]):
                return JsonResponse({'error': 'Todos os campos são obrigatórios.'}, status=400)

            # Lógica de verificação para o username e email no modelo User
            if User.objects.filter(username=username_recebido).exists():
                return JsonResponse({'error': 'Este nome de usuário já está em uso.'}, status=400)
            
            if User.objects.filter(email=email_recebido).exists():
                return JsonResponse({'error': 'Este e-mail já está em uso.'}, status=400)

            # Lógica de verificação para o CPF no modelo Users
            if Users.objects.filter(cpf=cpf_recebido).exists():
                return JsonResponse({'error': 'Este CPF já está cadastrado.'}, status=400)
            
            # Se as verificações passarem, cria o novo usuário do Django e o seu modelo
            user = User.objects.create_user(username=username_recebido, password=password_recebida, email=email_recebido)
            new_user = Users.objects.create(
                nome=nome_recebido,
                email=email_recebido,
                idade=idade_recebida,
                cpf=cpf_recebido
            )
            
            return JsonResponse({'message': 'Usuário criado com sucesso!', 'user_id': user.id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Requisição inválida. JSON malformado.'}, status=400)
        except Exception as e:
            print(f"Erro no cadastro: {e}")
            return JsonResponse({'error': 'Erro interno do servidor.'}, status=500)