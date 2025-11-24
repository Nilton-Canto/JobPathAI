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
from django.utils.translation import gettext_lazy as _


def _serialize_profile_skills(profile: StudentProfile):
    """Return list of skills for the given student profile."""
    skills = []
    try:
        for habilidade in profile.habilidades.select_related('skill').all():
            skills.append({
                'id': habilidade.id,
                'skill_id': habilidade.skill.id,
                'skill_name': habilidade.skill.nome,
                'skill_categoria': habilidade.skill.categoria,
                'nivel': habilidade.nivel,
                'anos_experiencia': habilidade.anos_experiencia,
                'adicionado_em': habilidade.adicionado_em,
            })
    except Exception:
        # Keep silent to avoid breaking login/profile endpoints if relation is missing
        skills = []
    return skills


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
                
                # Session is created and saved
                
                # Get user profile data from StudentProfile
                user_profile = getattr(user, 'student_profile', None)
                if user_profile:
                    skills_data = _serialize_profile_skills(user_profile)
                    user_data = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'nome': user.get_full_name() or user.username,
                        'idade': user_profile.idade,
                        'cpf': user_profile.cpf,
                        'area_interesse': user_profile.area_interesse,
                        'nivel_experiencia': user_profile.nivel_experiencia,
                        'habilidades': skills_data,
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
                        'habilidades': [],
                        'is_superuser': user.is_superuser,
                        'is_staff': user.is_staff,
                        'is_admin': user.is_superuser or user.is_staff
                    }
                
                response = JsonResponse({
                    'success': True,
                    'message': 'Login realizado com sucesso',
                    'user': user_data
                })
                
                # Session cookie will be set automatically by Django
                
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
    """API endpoint to get and update authenticated user profile - returns JSON only"""
    
    def get(self, request):
        """Return authenticated user profile"""
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
            skills_data = _serialize_profile_skills(user_profile)
            profile_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'nome': request.user.get_full_name() or request.user.username,
                'idade': user_profile.idade,
                'cpf': user_profile.cpf,
                'area_interesse': user_profile.area_interesse,
                'nivel_experiencia': user_profile.nivel_experiencia,
                'habilidades': skills_data,
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
                'habilidades': [],
                'is_superuser': request.user.is_superuser,
                'is_staff': request.user.is_staff,
                'is_admin': request.user.is_superuser or request.user.is_staff,
            }
        
        return JsonResponse(profile_data)
    
    def put(self, request):
        """Update authenticated user profile"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Usuário não autenticado'}, status=401)
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        
        # Get or create StudentProfile
        user_profile, created = StudentProfile.objects.get_or_create(user=request.user)
        
        # Update fields if provided
        if 'area_interesse' in data:
            user_profile.area_interesse = data['area_interesse'] or ''
        if 'nivel_experiencia' in data:
            user_profile.nivel_experiencia = data['nivel_experiencia'] or 'sem_experiencia'
        if 'bio' in data:
            user_profile.bio = data['bio'] or ''
        if 'telefone' in data:
            user_profile.telefone = data['telefone'] or ''
        if 'endereco' in data:
            user_profile.endereco = data['endereco'] or ''
        if 'cidade' in data:
            user_profile.cidade = data['cidade'] or ''
        if 'estado' in data:
            user_profile.estado = data['estado'] or ''
        if 'cep' in data:
            user_profile.cep = data['cep'] or ''
        
        user_profile.save()
        
        # Return updated profile
        skills_data = _serialize_profile_skills(user_profile)
        return JsonResponse({
            'success': True,
            'message': 'Perfil atualizado com sucesso',
            'profile': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'nome': request.user.get_full_name() or request.user.username,
                'idade': user_profile.idade,
                'cpf': user_profile.cpf,
                'area_interesse': user_profile.area_interesse,
                'nivel_experiencia': user_profile.nivel_experiencia,
                'habilidades': skills_data,
                'is_superuser': request.user.is_superuser,
                'is_staff': request.user.is_staff,
                'is_admin': request.user.is_superuser or request.user.is_staff,
            }
        })


@method_decorator(csrf_exempt, name='dispatch')
class AdminStatsView(View):
    """Return admin-only stats such as student count for dashboard cards"""

    def get(self, request):
        if not request.user.is_authenticated or not (request.user.is_staff or request.user.is_superuser):
            return JsonResponse({'error': _('Acesso negado. Apenas administradores.')}, status=403)

        students_count = StudentProfile.objects.count()

        return JsonResponse({
            'students_count': students_count
        })
