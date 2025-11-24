"""
Backend views for JobPathAI
- Root redirects to Django Admin
- API status and health check endpoints
"""

from django.http import JsonResponse, HttpResponseRedirect
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.db import connection
from django.contrib.auth.models import User
from django.conf import settings
from django.middleware.csrf import get_token


class RootRedirectView(View):
    """
    Redirects root URL to Django Admin
    Backend (porta 8000) is primarily for admin and API access
    """
    
    def get(self, request):
        """Redirect to Django Admin"""
        return HttpResponseRedirect('/admin/')


class StatusView(View):
    """
    API status endpoint for developers
    Returns information about available endpoints and system status
    """
    
    def get(self, request):
        """Return API status and available endpoints"""
        return JsonResponse({
            'status': 'online',
            'message': 'JobPathAI Backend API',
            'version': '1.0.0',
            'endpoints': {
                'authentication': {
                    'login': '/api/login/',
                    'register': '/api/register/',
                    'logout': '/api/logout/',
                    'user_profile': '/api/user-profile/',
                },
                'career': {
                    'career_paths': '/api/v1/career-paths/',
                },
                'student_area': {
                    'base': '/api/student/',
                },
                'llm': {
                    'generate_plan': '/api/llm/generate-plan/',
                    'chat': '/api/llm/chat/',
                    'admin_insights': '/api/llm/admin-insights/',
                },
                'admin': {
                    'django_admin': '/admin/',
                }
            },
            'note': 'Frontend React handles all UI. This backend provides REST APIs only.'
        })


class HealthCheckView(View):
    """
    Health check endpoint for monitoring
    Returns system health status including database connectivity
    """
    
    def get(self, request):
        """Check system health"""
        health_status = {
            'status': 'healthy',
            'checks': {}
        }
        
        # Database check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_status['checks']['database'] = 'ok'
        except Exception as e:
            health_status['status'] = 'unhealthy'
            health_status['checks']['database'] = f'error: {str(e)}'
        
        # User count (basic check)
        try:
            user_count = User.objects.count()
            health_status['checks']['users'] = f'{user_count} users'
        except Exception as e:
            health_status['checks']['users'] = f'error: {str(e)}'
        
        # Debug mode check
        health_status['checks']['debug_mode'] = settings.DEBUG
        
        return JsonResponse(health_status)


class DatabaseStatsView(View):
    """
    Database statistics endpoint (admin only)
    Shows useful stats about the database
    """
    
    def get(self, request):
        """Return database statistics"""
        if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        
        stats = {}
        
        try:
            # User stats
            stats['users'] = {
                'total': User.objects.count(),
                'active': User.objects.filter(is_active=True).count(),
                'staff': User.objects.filter(is_staff=True).count(),
                'superusers': User.objects.filter(is_superuser=True).count(),
            }
            
            # Try to get stats from other apps
            try:
                from users.models import Users
                stats['user_profiles'] = Users.objects.count()
            except:
                pass
            
            try:
                from career.models import CareerPath, CareerStage
                stats['career'] = {
                    'paths': CareerPath.objects.count(),
                    'stages': CareerStage.objects.count(),
                }
            except:
                pass
            
            try:
                from student_area.models import StudentProfile, JobOpportunity, JobApplication
                stats['student_area'] = {
                    'profiles': StudentProfile.objects.count(),
                    'jobs': JobOpportunity.objects.count(),
                    'applications': JobApplication.objects.count(),
                }
            except:
                pass
            
        except Exception as e:
            return JsonResponse({'error': f'Error getting stats: {str(e)}'}, status=500)
        
        return JsonResponse({
            'status': 'ok',
            'stats': stats
        })


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfTokenView(View):
    """
    Endpoint to get CSRF token
    This ensures the CSRF cookie is set in the response
    """
    
    def get(self, request):
        """Return CSRF token"""
        token = get_token(request)
        return JsonResponse({'csrfToken': token})
