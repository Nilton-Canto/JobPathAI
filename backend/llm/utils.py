"""
Utility functions for LLM app
- User context building
- Memory management
"""

from typing import Dict, Optional
from django.contrib.auth.models import User
from career.models import CareerPath, CareerStage
from .models import UserMemory, Conversation, ConversationMessage


def get_user_context(user: User) -> Dict:
    """
    Build comprehensive user context for LLM prompts
    Includes profile, career paths, progress, etc.
    """
    context = {
        'username': user.username,
        'email': user.email,
        'profile': {},
        'career_paths': [],
        'active_paths': [],
        'completed_stages': 0,
        'total_stages': 0,
    }
    
    # Get user memory if exists
    try:
        memory = UserMemory.objects.get(user=user)
        context['memory'] = {
            'career_goals': memory.career_goals,
            'interests': memory.interests,
            'current_level': memory.current_level,
            'profile_summary': memory.profile_summary,
        }
    except UserMemory.DoesNotExist:
        context['memory'] = None
    
    # Get user profile from student_area if available
    try:
        from student_area.models import StudentProfile
        profile = StudentProfile.objects.filter(user=user).first()
        if profile:
            context['profile'] = {
                'bio': profile.bio,
                'area_interesse': profile.area_interesse,
                'telefone': profile.telefone,
                'cidade': profile.cidade,
                'estado': profile.estado,
            }
    except ImportError:
        pass
    
    # Get user's career paths
    user_paths = CareerPath.objects.filter(user=user)
    context['career_paths_count'] = user_paths.count()
    
    for path in user_paths[:5]:  # Limit to 5 most recent
        stages = path.stages.all()
        completed_stages = stages.filter(is_completed=True).count()
        
        path_info = {
            'id': path.id,
            'title': path.title,
            'description': path.description[:200],  # Truncate
            'path_type': path.path_type,
            'total_stages': stages.count(),
            'completed_stages': completed_stages,
            'progress_percent': int((completed_stages / stages.count() * 100) if stages.count() > 0 else 0),
        }
        
        context['career_paths'].append(path_info)
        
        if completed_stages < stages.count():
            context['active_paths'].append(path_info)
    
    # Calculate totals
    all_stages = CareerStage.objects.filter(career_path__user=user)
    context['total_stages'] = all_stages.count()
    context['completed_stages'] = all_stages.filter(is_completed=True).count()
    
    return context


def format_user_context_for_prompt(context: Dict) -> str:
    """
    Format user context into a readable string for LLM prompts
    """
    parts = []
    
    parts.append(f"Usuário: {context['username']} ({context['email']})")
    
    # Profile information
    if context.get('profile'):
        profile = context['profile']
        if profile.get('bio'):
            parts.append(f"Bio: {profile['bio']}")
        if profile.get('area_interesse'):
            parts.append(f"Área de interesse: {profile['area_interesse']}")
    
    # Memory information
    if context.get('memory'):
        memory = context['memory']
        if memory.get('career_goals'):
            parts.append(f"Objetivos de carreira: {memory['career_goals']}")
        if memory.get('interests'):
            parts.append(f"Interesses: {memory['interests']}")
        if memory.get('current_level'):
            parts.append(f"Nível atual: {memory['current_level']}")
    
    # Career paths summary
    if context.get('career_paths'):
        parts.append(f"\nTrilhas de carreira ({context['career_paths_count']} total):")
        for path in context['career_paths'][:3]:  # Show top 3
            parts.append(
                f"- {path['title']}: {path['completed_stages']}/{path['total_stages']} etapas concluídas "
                f"({path['progress_percent']}% completo)"
            )
    
    # Progress summary
    if context.get('total_stages', 0) > 0:
        parts.append(
            f"\nProgresso geral: {context['completed_stages']}/{context['total_stages']} etapas concluídas"
        )
    
    return "\n".join(parts) if parts else "Informações limitadas disponíveis sobre o usuário."


def get_or_create_conversation(user: User, conversation_id: Optional[str] = None) -> Conversation:
    """
    Get existing conversation or create new one
    """
    if conversation_id:
        try:
            return Conversation.objects.get(conversation_id=conversation_id, user=user)
        except Conversation.DoesNotExist:
            pass
    
    # Create new conversation
    import uuid
    new_id = conversation_id or str(uuid.uuid4())
    conversation = Conversation.objects.create(
        user=user,
        conversation_id=new_id
    )
    return conversation


def save_message(conversation: Conversation, role: str, content: str):
    """
    Save message to conversation history
    """
    ConversationMessage.objects.create(
        conversation=conversation,
        role=role,
        content=content
    )
    
    # Update conversation title from first user message if not set
    if not conversation.title and role == 'user':
        conversation.title = content[:200]  # Truncate to 200 chars
        conversation.save(update_fields=['title'])


def get_conversation_history(conversation: Conversation, limit: int = 10) -> list:
    """
    Get recent conversation history for LLM context
    Returns list of messages in format for Gemini API
    """
    messages = ConversationMessage.objects.filter(
        conversation=conversation
    ).order_by('-created_at')[:limit]
    
    # Reverse to get chronological order
    messages = list(reversed(messages))
    
    # Format for Gemini (simple text format for now)
    history = []
    for msg in messages:
        role_prefix = "Usuário" if msg.role == 'user' else "Mentor"
        history.append(f"{role_prefix}: {msg.content}")
    
    return history


def update_user_memory(user: User, **kwargs):
    """
    Update or create user memory with new information
    """
    memory, created = UserMemory.objects.get_or_create(user=user)
    
    if 'career_goals' in kwargs:
        memory.career_goals = kwargs['career_goals']
    if 'interests' in kwargs:
        memory.interests = kwargs['interests']
    if 'current_level' in kwargs:
        memory.current_level = kwargs['current_level']
    if 'profile_summary' in kwargs:
        memory.profile_summary = kwargs['profile_summary']
    
    memory.save()
    return memory

