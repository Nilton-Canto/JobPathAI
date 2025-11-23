"""
Admin configuration for llm app
"""

from django.contrib import admin
from .models import Conversation, ConversationMessage, UserMemory


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin interface for conversations"""
    list_display = ['conversation_id', 'user', 'title', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['conversation_id', 'user__username', 'title']
    readonly_fields = ['conversation_id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(ConversationMessage)
class ConversationMessageAdmin(admin.ModelAdmin):
    """Admin interface for conversation messages"""
    list_display = ['conversation', 'role', 'content_preview', 'created_at']
    list_filter = ['role', 'created_at', 'conversation']
    search_fields = ['content', 'conversation__conversation_id']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        """Show content preview"""
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'


@admin.register(UserMemory)
class UserMemoryAdmin(admin.ModelAdmin):
    """Admin interface for user memory"""
    list_display = ['user', 'current_level', 'updated_at', 'created_at']
    list_filter = ['current_level', 'updated_at', 'created_at']
    search_fields = ['user__username', 'career_goals', 'interests']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'updated_at'
