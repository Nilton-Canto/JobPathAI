"""
Models for LLM app
- Conversation history
- User memory/context
"""

from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):
    """
    Stores conversation history for chat with mentor
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='llm_conversations')
    conversation_id = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=200, blank=True)  # Auto-generated from first message
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title or self.conversation_id}"


class ConversationMessage(models.Model):
    """
    Individual messages in a conversation
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.conversation.conversation_id} - {self.role} - {self.content[:50]}"


class UserMemory(models.Model):
    """
    Stores important information about user for LLM context
    This helps the LLM remember user preferences, goals, and progress
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='llm_memory')
    
    # Career goals and preferences
    career_goals = models.TextField(blank=True, help_text="User's career goals and aspirations")
    interests = models.TextField(blank=True, help_text="Areas of interest")
    current_level = models.CharField(max_length=50, blank=True, help_text="Current career level")
    
    # Context from user profile
    profile_summary = models.TextField(blank=True, help_text="Summary of user profile")
    
    # Last updated
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Memory for {self.user.username}"
    
    def get_context_summary(self) -> str:
        """Get formatted context summary for LLM prompts"""
        context_parts = []
        
        if self.career_goals:
            context_parts.append(f"Objetivos de carreira: {self.career_goals}")
        
        if self.interests:
            context_parts.append(f"Áreas de interesse: {self.interests}")
        
        if self.current_level:
            context_parts.append(f"Nível atual: {self.current_level}")
        
        if self.profile_summary:
            context_parts.append(f"Perfil: {self.profile_summary}")
        
        return "\n".join(context_parts) if context_parts else "Sem informações adicionais disponíveis."
