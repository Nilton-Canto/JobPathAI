from django.contrib import admin
from .models import (
    Skill, 
    CareerPath, 
    CareerStage,
    UserCareerPath,
    UserStageProgress,
    Favorite
)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin configuration for Skill model"""
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    list_filter = ('name',)


@admin.register(CareerPath)
class CareerPathAdmin(admin.ModelAdmin):
    """Admin configuration for CareerPath model"""
    list_display = ('title', 'path_type', 'user', 'created_at')
    list_filter = ('path_type', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ()  # Para ManyToMany fields se houver


@admin.register(CareerStage)
class CareerStageAdmin(admin.ModelAdmin):
    """Admin configuration for CareerStage model"""
    list_display = ('title', 'career_path', 'order', 'is_completed', 'completed_at')
    list_filter = ('is_completed', 'career_path', 'completed_at')
    search_fields = ('title', 'description', 'career_path__title')
    readonly_fields = ('completed_at',)
    ordering = ('career_path', 'order')


@admin.register(UserCareerPath)
class UserCareerPathAdmin(admin.ModelAdmin):
    """Admin configuration for UserCareerPath model"""
    list_display = ('user', 'career_path', 'is_active', 'started_at', 'updated_at')
    list_filter = ('is_active', 'started_at')
    search_fields = ('user__username', 'career_path__title')
    readonly_fields = ('started_at', 'updated_at')


@admin.register(UserStageProgress)
class UserStageProgressAdmin(admin.ModelAdmin):
    """Admin configuration for UserStageProgress model"""
    list_display = ('user', 'stage', 'is_completed', 'completed_at', 'started_at')
    list_filter = ('is_completed', 'completed_at')
    search_fields = ('user__username', 'stage__title')
    readonly_fields = ('started_at',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    """Admin configuration for Favorite model"""
    list_display = ('user', 'career_path', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'career_path__title')
    readonly_fields = ('created_at',)
