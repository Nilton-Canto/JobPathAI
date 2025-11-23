"""
Views for Career API
Includes ViewSets with custom actions for associate, progress, etc.
"""

from django.db import models as django_models
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import ValidationError, PermissionDenied

from .models import Skill, CareerPath, CareerStage, UserCareerPath, UserStageProgress, Favorite
from .serializers import (
    SkillSerializer, 
    CareerPathSerializer, 
    CareerStageSerializer,
    UserCareerPathSerializer,
    UserStageProgressSerializer,
    FavoriteSerializer
)


class SkillViewSet(viewsets.ModelViewSet):
    """ViewSet for Skills"""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CareerPathViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Career Paths with custom actions:
    - associate: Associate user with a career path
    - progress: Get progress for a specific path
    - users: Get users associated with a path (admin only)
    """
    queryset = CareerPath.objects.all()
    serializer_class = CareerPathSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """
        Custom queryset with filtering support
        Supports: path_type, user, search (title/description)
        """
        queryset = CareerPath.objects.all()
        
        # Filter by path_type (PRE or PER)
        path_type = self.request.query_params.get('path_type', None)
        if path_type:
            queryset = queryset.filter(path_type=path_type)
        
        # Filter by user (for personalized paths)
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Search by title or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                django_models.Q(title__icontains=search) | 
                django_models.Q(description__icontains=search)
            )
        
        # Filter by area (if we add area field later)
        # area = self.request.query_params.get('area', None)
        # if area:
        #     queryset = queryset.filter(area=area)
        
        return queryset.select_related('user').prefetch_related('stages', 'stages__skills')
    
    def get_serializer_context(self):
        """Add request to serializer context for computed fields"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def associate(self, request, pk=None):
        """
        Associate current user with a career path
        POST /api/v1/career-paths/{id}/associate/
        """
        career_path = self.get_object()
        user = request.user
        
        # Check if already associated
        association, created = UserCareerPath.objects.get_or_create(
            user=user,
            career_path=career_path,
            defaults={'is_active': True}
        )
        
        if not created:
            # Reactivate if was deactivated
            if not association.is_active:
                association.is_active = True
                association.save()
            return Response({
                'message': 'Você já está associado a esta trilha',
                'association': UserCareerPathSerializer(association, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Trilha associada com sucesso',
            'association': UserCareerPathSerializer(association, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def progress(self, request, pk=None):
        """
        Get progress for current user on this career path
        GET /api/v1/career-paths/{id}/progress/
        """
        career_path = self.get_object()
        user = request.user
        
        try:
            user_path = UserCareerPath.objects.get(user=user, career_path=career_path, is_active=True)
        except UserCareerPath.DoesNotExist:
            return Response({
                'error': 'Você não está associado a esta trilha',
                'progress_percent': 0,
                'stages': []
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all stages for this path
        stages = career_path.stages.all().order_by('order')
        
        # Get user progress for each stage
        stage_progress = []
        completed_count = 0
        
        for stage in stages:
            try:
                progress = UserStageProgress.objects.get(user=user, stage=stage)
                is_completed = progress.is_completed
                if is_completed:
                    completed_count += 1
            except UserStageProgress.DoesNotExist:
                is_completed = False
            
            stage_progress.append({
                'id': stage.id,
                'title': stage.title,
                'description': stage.description,
                'order': stage.order,
                'is_completed': is_completed,
                'skills': [skill.name for skill in stage.skills.all()]
            })
        
        total_stages = stages.count()
        progress_percent = int((completed_count / total_stages) * 100) if total_stages > 0 else 0
        
        return Response({
            'career_path_id': career_path.id,
            'career_path_title': career_path.title,
            'progress_percent': progress_percent,
            'completed_stages': completed_count,
            'total_stages': total_stages,
            'stages': stage_progress,
            'started_at': user_path.started_at,
            'updated_at': user_path.updated_at
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def users(self, request, pk=None):
        """
        Get list of users associated with this career path (admin only)
        GET /api/v1/career-paths/{id}/users/
        """
        if not (request.user.is_staff or request.user.is_superuser):
            raise PermissionDenied('Apenas administradores podem ver usuários associados')
        
        career_path = self.get_object()
        associations = UserCareerPath.objects.filter(
            career_path=career_path,
            is_active=True
        ).select_related('user')
        
        users_data = []
        for assoc in associations:
            users_data.append({
                'user_id': assoc.user.id,
                'username': assoc.user.username,
                'email': assoc.user.email,
                'started_at': assoc.started_at,
                'progress_percent': assoc.get_progress()
            })
        
        return Response({
            'career_path_id': career_path.id,
            'career_path_title': career_path.title,
            'total_users': len(users_data),
            'users': users_data
        })
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy to prevent deletion if path has associated users
        """
        career_path = self.get_object()
        
        # Check if path has active associations
        active_associations = UserCareerPath.objects.filter(
            career_path=career_path,
            is_active=True
        ).count()
        
        if active_associations > 0:
            return Response({
                'error': f'Não é possível deletar esta trilha. Ela possui {active_associations} usuário(s) associado(s).',
                'active_users_count': active_associations
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().destroy(request, *args, **kwargs)


class CareerStageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Career Stages with validation for marking as completed
    """
    queryset = CareerStage.objects.all()
    serializer_class = CareerStageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def partial_update(self, request, *args, **kwargs):
        """
        Override partial_update to validate stage completion order
        Prevents users from skipping stages
        """
        instance = self.get_object()
        
        # Check if trying to mark as completed
        if 'is_completed' in request.data and request.data['is_completed']:
            if not request.user.is_authenticated:
                raise PermissionDenied('Autenticação necessária para marcar etapas')
            
            # Check if previous stages are completed
            previous_stages = CareerStage.objects.filter(
                career_path=instance.career_path,
                order__lt=instance.order
            ).order_by('order')
            
            # Check user's progress on previous stages
            for prev_stage in previous_stages:
                try:
                    progress = UserStageProgress.objects.get(
                        user=request.user,
                        stage=prev_stage
                    )
                    if not progress.is_completed:
                        return Response({
                            'error': f'Você precisa completar a etapa anterior primeiro: "{prev_stage.title}"',
                            'required_stage_id': prev_stage.id,
                            'required_stage_title': prev_stage.title,
                            'required_stage_order': prev_stage.order
                        }, status=status.HTTP_400_BAD_REQUEST)
                except UserStageProgress.DoesNotExist:
                    return Response({
                        'error': f'Você precisa completar a etapa anterior primeiro: "{prev_stage.title}"',
                        'required_stage_id': prev_stage.id,
                        'required_stage_title': prev_stage.title,
                        'required_stage_order': prev_stage.order
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # All previous stages completed, allow marking this one
            # Create or update UserStageProgress
            user_progress, created = UserStageProgress.objects.get_or_create(
                user=request.user,
                stage=instance,
                defaults={
                    'is_completed': True,
                    'completed_at': timezone.now()
                }
            )
            
            if not created:
                user_progress.is_completed = True
                user_progress.completed_at = timezone.now()
                user_progress.save()
        
        return super().partial_update(request, *args, **kwargs)


class FavoriteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Favorites
    Users can favorite/unfavorite career paths
    """
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only current user's favorites"""
        return Favorite.objects.filter(user=self.request.user).select_related('career_path')
    
    def perform_create(self, serializer):
        """Automatically set user to current user"""
        career_path_id = self.request.data.get('career_path_id') or self.request.data.get('career_path')
        
        if isinstance(career_path_id, dict):
            career_path_id = career_path_id.get('id')
        
        try:
            career_path = CareerPath.objects.get(pk=career_path_id)
        except CareerPath.DoesNotExist:
            raise ValidationError('Trilha de carreira não encontrada')
        
        # Check if already favorited
        if Favorite.objects.filter(user=self.request.user, career_path=career_path).exists():
            raise ValidationError('Você já favoritou esta trilha')
        
        serializer.save(user=self.request.user, career_path=career_path)
    
    def destroy(self, request, *args, **kwargs):
        """Override to allow deletion by career_path_id"""
        # If pk is provided, use it
        if 'pk' in kwargs:
            return super().destroy(request, *args, **kwargs)
        
        # Otherwise, try to find by career_path_id
        career_path_id = request.data.get('career_path_id') or request.query_params.get('career_path_id')
        if career_path_id:
            try:
                favorite = Favorite.objects.get(
                    user=request.user,
                    career_path_id=career_path_id
                )
                favorite.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Favorite.DoesNotExist:
                return Response({
                    'error': 'Favorito não encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'error': 'career_path_id é necessário'
        }, status=status.HTTP_400_BAD_REQUEST)
