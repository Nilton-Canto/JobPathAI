"""
API views for user authentication and profile management.
All endpoints return JSON - frontend React handles UI.
"""

from django.views import View
from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from student_area.models import StudentProfile
import json


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    """
    API endpoint for user login - returns JSON only
    Frontend React handles the UI
    """
    
    def post(self, request):
        """Handle login request - JSON only"""
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            remember_me = data.get('remember_me', False)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=400)
        
        try:
            user = User.objects.get(username=username)
            
            if user.check_password(password):
                login(request, user)
                
                # Configure session persistence based on remember_me
                if remember_me:
                    # Set session to expire in 30 days (remember me)
                    request.session.set_expiry(2592000)  # 30 days in seconds
                else:
                    # Use default session expiry (24 hours) or browser session
                    request.session.set_expiry(86400)  # 24 hours
                
                # Ensure session is saved and modified flag is set
                request.session.modified = True
                request.session.save()
                
                # Verify session was created
                if not request.session.session_key:
                    # Force session creation
                    request.session.create()
                
                # Debug: Log session info
                print(f"[DEBUG] LoginView - User authenticated: {request.user.is_authenticated}")
                print(f"[DEBUG] LoginView - User: {request.user.username}")
                print(f"[DEBUG] LoginView - Session key: {request.session.session_key}")
                print(f"[DEBUG] LoginView - Session cookie name: {request.session.cookie_name}")
                print(f"[DEBUG] LoginView - Session cookie domain: {request.session.get_cookie_domain()}")
                print(f"[DEBUG] LoginView - Session cookie path: {request.session.get_cookie_path()}")
                
                # Get user profile data from StudentProfile
                user_profile = getattr(user, 'student_profile', None)
                if user_profile:
                    user_data = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'nome': user.get_full_name() or user.username,
                        'idade': user_profile.idade,
                        'cpf': user_profile.cpf,
                        'is_superuser': user.is_superuser,
                        'is_staff': user.is_staff,
                        'is_admin': user.is_superuser or user.is_staff
                    }
                else:
                    user_data = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'nome': user.get_full_name() or user.username,
                        'idade': None,
                        'cpf': None,
                        'is_superuser': user.is_superuser,
                        'is_staff': user.is_staff,
                        'is_admin': user.is_superuser or user.is_staff
                    }
                
                response = JsonResponse({
                    'success': True,
                    'message': 'Login realizado com sucesso',
                    'user': user_data
                })
                
                # Debug: Log response headers
                print(f"[DEBUG] LoginView - Response headers: {dict(response.headers)}")
                print(f"[DEBUG] LoginView - Session cookie will be set: {request.session.session_key}")
                
                return response
            else:
                return JsonResponse({'error': 'Senha incorreta'}, status=400)
                
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado'}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    """
    API endpoint for user registration - returns JSON only
    Frontend React handles the UI
    """
    
    def post(self, request):
        """Handle registration request - JSON only"""
        try:
            data = json.loads(request.body)
            nome = data.get('name', '').strip()
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            idade = data.get('age', '').strip()
            cpf = data.get('cpf', '').strip()
            password = data.get('password', '').strip()
            confirm_password = data.get('confirm_password', '').strip()
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
        # Validation
        if not all([nome, username, email, password, confirm_password]):
            return JsonResponse({'error': 'Todos os campos são obrigatórios'}, status=400)
        
        if password != confirm_password:
            return JsonResponse({'error': 'As senhas não coincidem'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Este nome de usuário já está em uso'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Este e-mail já está em uso'}, status=400)
        
        # Check CPF in StudentProfile
        if StudentProfile.objects.filter(cpf=cpf).exists():
            return JsonResponse({'error': 'Este CPF já está cadastrado'}, status=400)
        
        # Create user and StudentProfile
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=nome.split()[0] if nome else '',
                last_name=' '.join(nome.split()[1:]) if len(nome.split()) > 1 else ''
            )
            # Create StudentProfile instead of Users
            StudentProfile.objects.create(
                user=user,
                idade=int(idade) if idade and idade.isdigit() else None,
                cpf=cpf if cpf else None
            )
            return JsonResponse({
                'success': True,
                'message': 'Usuário cadastrado com sucesso!'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': f'Erro ao criar usuário: {str(e)}'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    """API endpoint for user logout - returns JSON only"""
    
    def post(self, request):
        """Handle logout request"""
        logout(request)
        return JsonResponse({'success': True, 'message': 'Logout realizado com sucesso'})
    
    def get(self, request):
        """Handle logout via GET (for compatibility)"""
        logout(request)
        return JsonResponse({'success': True, 'message': 'Logout realizado com sucesso'})


@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(View):
    """API endpoint to get authenticated user profile - returns JSON only"""
    
    def get(self, request):
        """Return authenticated user profile"""
        # Debug: Log authentication status
        print(f"[DEBUG] UserProfileView - User authenticated: {request.user.is_authenticated}")
        print(f"[DEBUG] UserProfileView - User: {request.user}")
        print(f"[DEBUG] UserProfileView - Session key: {request.session.session_key}")
        
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Usuário não autenticado',
                'debug': {
                    'has_session': hasattr(request, 'session'),
                    'session_key': request.session.session_key if hasattr(request, 'session') else None,
                    'user_id': getattr(request.user, 'id', None),
                }
            }, status=401)
        
        # Get profile from StudentProfile
        user_profile = getattr(request.user, 'student_profile', None)
        if user_profile:
            profile_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'nome': request.user.get_full_name() or request.user.username,
                'idade': user_profile.idade,
                'cpf': user_profile.cpf,
                'is_superuser': request.user.is_superuser,
                'is_staff': request.user.is_staff,
                'is_admin': request.user.is_superuser or request.user.is_staff,
            }
        else:
            profile_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'nome': request.user.get_full_name() or request.user.username,
                'idade': None,
                'cpf': None,
                'is_superuser': request.user.is_superuser,
                'is_staff': request.user.is_staff,
                'is_admin': request.user.is_superuser or request.user.is_staff,
            }
        
        return JsonResponse(profile_data)
