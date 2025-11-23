"""
API views for LLM integration
- Chat with mentor (users)
- Admin insights (admins)
"""

import json
import traceback
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.db.models import Count, Q

from .services import get_gemini_service
from .prompts import (
    get_career_plan_prompt, 
    get_mentor_chat_system_instruction,
    get_admin_insights_system_instruction
)
from .utils import (
    get_user_context,
    format_user_context_for_prompt,
    get_or_create_conversation,
    save_message,
    get_conversation_history,
    update_user_memory
)
from career.models import CareerPath, CareerStage, Skill


@method_decorator(csrf_exempt, name='dispatch')
class GeneratePlanView(View):
    """
    API endpoint to generate personalized career plan using LLM
    POST /api/llm/generate-plan/
    """
    
    def post(self, request):
        """Generate career plan from user description"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            data = json.loads(request.body)
            description = data.get('description', '').strip()
            
            if not description:
                return JsonResponse({'error': 'Description is required'}, status=400)
            
            if len(description) < 20:
                return JsonResponse({
                    'error': 'Description must be at least 20 characters long'
                }, status=400)
            
            # Get user context for better personalization
            user_context = get_user_context(request.user)
            user_profile = {
                'nome': request.user.username,
                'email': request.user.email,
            }
            
            # Add context from user_context if available
            if user_context.get('profile', {}).get('area_interesse'):
                user_profile['area_interesse'] = user_context['profile']['area_interesse']
            
            # Generate prompt with user context
            prompt = get_career_plan_prompt(description, user_profile)
            
            # Call Gemini API
            gemini_service = get_gemini_service()
            system_instruction = "You are a career planning expert. Always return valid JSON."
            
            plan_data = gemini_service.generate_structured_content(
                prompt=prompt,
                system_instruction=system_instruction
            )
            
            # Validate response structure
            if not plan_data.get('title') or not plan_data.get('stages'):
                return JsonResponse({
                    'error': 'Invalid response format from LLM'
                }, status=500)
            
            # Create CareerPath in database
            career_path = CareerPath.objects.create(
                title=plan_data['title'],
                description=plan_data.get('description', ''),
                user=request.user,
                path_type='PER'  # Personalizada
            )
            
            # Create CareerStages
            created_stages = []
            for stage_data in plan_data['stages']:
                stage = CareerStage.objects.create(
                    career_path=career_path,
                    title=stage_data['title'],
                    description=stage_data.get('description', ''),
                    order=stage_data.get('order', len(created_stages) + 1)
                )
                
                # Create or get Skills and associate with stage
                for skill_name in stage_data.get('skills', []):
                    skill, _ = Skill.objects.get_or_create(
                        name=skill_name.strip(),
                        defaults={'description': f'Habilidade relacionada a {skill_name}'}
                    )
                    stage.skills.add(skill)
                
                created_stages.append({
                    'id': stage.id,
                    'title': stage.title,
                    'description': stage.description,
                    'order': stage.order,
                    'skills': [s.name for s in stage.skills.all()]
                })
            
            # Update user memory with new career goal
            if description:
                update_user_memory(
                    request.user,
                    career_goals=description[:500]  # Limit length
                )
            
            return JsonResponse({
                'success': True,
                'career_path': {
                    'id': career_path.id,
                    'title': career_path.title,
                    'description': career_path.description,
                    'path_type': career_path.path_type,
                    'stages': created_stages
                }
            }, status=201)
            
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=500)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            # Log full traceback for debugging
            error_trace = traceback.format_exc()
            print(f"[ERROR] GeneratePlanView: {str(e)}")
            print(f"[ERROR] Traceback: {error_trace}")
            return JsonResponse({
                'error': f'Error generating plan: {str(e)}'
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ChatView(View):
    """
    API endpoint for chat with mentor AI (for regular users)
    POST /api/llm/chat/
    Includes conversation history and user memory
    """
    
    def post(self, request):
        """Handle chat message with history and context"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            data = json.loads(request.body)
            message = data.get('message', '').strip()
            conversation_id = data.get('conversation_id')
            
            if not message:
                return JsonResponse({'error': 'Message is required'}, status=400)
            
            # Get or create conversation
            conversation = get_or_create_conversation(request.user, conversation_id)
            
            # Save user message
            save_message(conversation, 'user', message)
            
            # Get user context for personalized responses
            user_context = get_user_context(request.user)
            user_context_str = format_user_context_for_prompt(user_context)
            
            # Get conversation history (last 10 messages)
            history = get_conversation_history(conversation, limit=10)
            
            # Build full prompt with history
            if history:
                history_text = "\n\n".join(history)
                full_message = f"{history_text}\n\nUsuário: {message}"
            else:
                full_message = message
            
            # Call Gemini API with user context
            gemini_service = get_gemini_service()
            system_instruction = get_mentor_chat_system_instruction(user_context_str)
            
            response_text = gemini_service.chat(
                message=full_message,
                conversation_history=None,  # Already included in full_message
                system_instruction=system_instruction
            )
            
            # Save assistant response
            save_message(conversation, 'assistant', response_text)
            
            return JsonResponse({
                'success': True,
                'response': response_text,
                'conversation_id': conversation.conversation_id
            })
            
        except ValueError as e:
            # API key not configured or import error
            error_msg = str(e)
            if 'GEMINI_API_KEY' in error_msg or 'not installed' in error_msg:
                return JsonResponse({
                    'error': 'LLM service not configured. Please check backend configuration.',
                    'details': error_msg
                }, status=500)
            return JsonResponse({'error': str(e)}, status=500)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            # Log full traceback for debugging
            error_trace = traceback.format_exc()
            print(f"[ERROR] ChatView: {str(e)}")
            print(f"[ERROR] Traceback: {error_trace}")
            return JsonResponse({
                'error': f'Error in chat: {str(e)}',
                'details': error_trace if request.user.is_superuser else None  # Only show details to admins
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AdminInsightsView(View):
    """
    API endpoint for admin dashboard insights
    POST /api/llm/admin-insights/
    Provides AI-powered insights about platform metrics and usage
    """
    
    def post(self, request):
        """Get AI insights about dashboard and platform metrics"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not (request.user.is_superuser or request.user.is_staff):
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        try:
            data = json.loads(request.body)
            question = data.get('question', '').strip()
            metrics = data.get('metrics', {})  # Optional: pass specific metrics
            
            # Build dashboard metrics context
            dashboard_context = self._get_dashboard_metrics()
            
            # If specific metrics provided, use them
            if metrics:
                dashboard_context.update(metrics)
            
            # Format context for prompt
            context_str = self._format_dashboard_context(dashboard_context)
            
            # Build prompt
            if question:
                prompt = f"{context_str}\n\nPergunta do administrador: {question}"
            else:
                prompt = f"{context_str}\n\nForneça insights e recomendações sobre o dashboard e uso da plataforma."
            
            # Call Gemini API
            gemini_service = get_gemini_service()
            system_instruction = get_admin_insights_system_instruction()
            
            response_text = gemini_service.generate_content(
                prompt=prompt,
                system_instruction=system_instruction
            )
            
            return JsonResponse({
                'success': True,
                'insights': response_text,
                'metrics': dashboard_context
            })
            
        except ValueError as e:
            error_msg = str(e)
            if 'GEMINI_API_KEY' in error_msg or 'not installed' in error_msg:
                return JsonResponse({
                    'error': 'LLM service not configured. Please check backend configuration.',
                    'details': error_msg
                }, status=500)
            return JsonResponse({'error': str(e)}, status=500)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"[ERROR] AdminInsightsView: {str(e)}")
            print(f"[ERROR] Traceback: {error_trace}")
            return JsonResponse({
                'error': f'Error generating insights: {str(e)}',
                'details': error_trace
            }, status=500)
    
    def _get_dashboard_metrics(self) -> dict:
        """Collect dashboard metrics for context"""
        metrics = {}
        
        # User metrics
        metrics['total_users'] = User.objects.count()
        metrics['active_users'] = User.objects.filter(is_active=True).count()
        metrics['staff_users'] = User.objects.filter(is_staff=True).count()
        metrics['superusers'] = User.objects.filter(is_superuser=True).count()
        
        # Career paths metrics
        metrics['total_career_paths'] = CareerPath.objects.count()
        metrics['predefined_paths'] = CareerPath.objects.filter(path_type='PRE').count()
        metrics['personalized_paths'] = CareerPath.objects.filter(path_type='PER').count()
        
        # Stages metrics
        metrics['total_stages'] = CareerStage.objects.count()
        metrics['completed_stages'] = CareerStage.objects.filter(is_completed=True).count()
        metrics['completion_rate'] = (
            (metrics['completed_stages'] / metrics['total_stages'] * 100) 
            if metrics['total_stages'] > 0 else 0
        )
        
        # Skills metrics
        metrics['total_skills'] = Skill.objects.count()
        
        # Users with paths
        metrics['users_with_paths'] = CareerPath.objects.filter(
            user__isnull=False
        ).values('user').distinct().count()
        
        # Recent activity (last 7 days)
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        metrics['recent_paths'] = CareerPath.objects.filter(
            created_at__gte=week_ago
        ).count()
        metrics['recent_completions'] = CareerStage.objects.filter(
            completed_at__gte=week_ago
        ).count()
        
        return metrics
    
    def _format_dashboard_context(self, metrics: dict) -> str:
        """Format metrics into readable context string"""
        parts = [
            "Métricas do Dashboard JobPathAI:",
            "",
            f"Usuários:",
            f"- Total: {metrics.get('total_users', 0)}",
            f"- Ativos: {metrics.get('active_users', 0)}",
            f"- Com trilhas: {metrics.get('users_with_paths', 0)}",
            "",
            f"Trilhas de Carreira:",
            f"- Total: {metrics.get('total_career_paths', 0)}",
            f"- Pré-definidas: {metrics.get('predefined_paths', 0)}",
            f"- Personalizadas: {metrics.get('personalized_paths', 0)}",
            "",
            f"Etapas:",
            f"- Total: {metrics.get('total_stages', 0)}",
            f"- Concluídas: {metrics.get('completed_stages', 0)}",
            f"- Taxa de conclusão: {metrics.get('completion_rate', 0):.1f}%",
            "",
            f"Habilidades: {metrics.get('total_skills', 0)}",
            "",
            f"Atividade Recente (últimos 7 dias):",
            f"- Novas trilhas: {metrics.get('recent_paths', 0)}",
            f"- Etapas concluídas: {metrics.get('recent_completions', 0)}",
        ]
        
        return "\n".join(parts)
