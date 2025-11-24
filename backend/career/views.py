"""
Views for Career API
Includes ViewSets with custom actions for associate, progress, etc.
"""

from django.db import models as django_models
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import ValidationError, PermissionDenied

from .models import Skill, Area, CareerPath, CareerStage, UserCareerPath, UserStageProgress, Favorite
from .serializers import (
    SkillSerializer,
    AreaSerializer,
    CareerPathSerializer, 
    CareerStageSerializer,
    UserCareerPathSerializer,
    UserStageProgressSerializer,
    FavoriteSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Only admins can create/edit/delete.
    Others can only read.
    """
    def has_permission(self, request, view):
        # Read permissions for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for authenticated staff/superusers
        return request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for authenticated staff/superusers
        return request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)


class SkillViewSet(viewsets.ModelViewSet):
    """ViewSet for Skills"""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]


class AreaViewSet(viewsets.ModelViewSet):
    """ViewSet for Professional Areas with CRUD operations"""
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        """Filter by active status if requested"""
        queryset = Area.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        return queryset.order_by('name')
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy to prevent deletion if area has associated career paths
        """
        area = self.get_object()
        
        # Check if area has associated career paths
        path_count = area.get_path_count()
        
        if path_count > 0:
            return Response({
                'error': f'Não é possível deletar esta área. Ela possui {path_count} trilha(s) associada(s).',
                'path_count': path_count
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().destroy(request, *args, **kwargs)


class CareerPathViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Career Paths with custom actions:
    - associate: Associate user with a career path
    - progress: Get progress for a specific path
    - users: Get users associated with a path (admin only)
    """
    queryset = CareerPath.objects.all()
    serializer_class = CareerPathSerializer
    permission_classes = [IsAdminOrReadOnly]
    
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
        
        # Filter by area
        area = self.request.query_params.get('area', None)
        if area:
            queryset = queryset.filter(area=area)
        
        # Filter by level
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(level=level)
        
        # Filter by active status (default: only active paths for general users).
        # But always allow the owner (or staff) to see their own pending/declined paths.
        is_active = self.request.query_params.get('is_active', 'true')
        user = getattr(self.request, "user", None)
        if is_active.lower() == 'true':
            if user and user.is_authenticated and not user.is_staff:
                queryset = queryset.filter(
                    django_models.Q(is_active=True) | django_models.Q(user=user)
                )
            else:
                queryset = queryset.filter(is_active=True)
        elif is_active.lower() == 'false':
            queryset = queryset.filter(is_active=False)
        
        # Filter by status if provided (e.g., pending, approved, declined)
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.select_related('user').prefetch_related('stages', 'stages__skills')
    
    def get_serializer_context(self):
        """Add request to serializer context for computed fields"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def _get_user_skill_names(self, user):
        """
        Return set of skill names already present in the student's profile.
        Helps flag skills that the user ja tem ao montar o progresso.
        """
        try:
            from student_area.models import StudentProfile, StudentSkill as StudentProfileSkill
        except Exception:
            return set()

        profile = StudentProfile.objects.filter(user=user).first()
        if not profile:
            return set()

        return set(
            StudentProfileSkill.objects.filter(student=profile).values_list('skill__nome', flat=True)
        )
    
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
        stages = career_path.stages.all().order_by('order').prefetch_related('skills')
        
        # Get user progress for each stage
        stage_progress = []
        completed_count = 0
        user_skill_names = self._get_user_skill_names(user)
        
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
                'skills': [
                    {
                        'id': skill.id,
                        'name': skill.name,
                        'description': skill.description,
                        'has_skill': skill.name in user_skill_names
                    } for skill in stage.skills.all()
                ]
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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Aprova a trilha gerada (ativa e marca status)."""
        path = self.get_object()
        if not (request.user.is_staff or request.user == path.user):
            raise PermissionDenied('Apenas o criador ou um admin pode aprovar.')
        path.status = 'approved'
        path.is_active = True
        path.save(update_fields=['status', 'is_active', 'updated_at'])
        serializer = self.get_serializer(path)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def decline(self, request, pk=None):
        """Recusa a trilha gerada (desativa)."""
        path = self.get_object()
        if not (request.user.is_staff or request.user == path.user):
            raise PermissionDenied('Apenas o criador ou um admin pode recusar.')
        path.status = 'declined'
        path.is_active = False
        path.save(update_fields=['status', 'is_active', 'updated_at'])
        serializer = self.get_serializer(path)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def request_refinement(self, request, pk=None):
        """Coloca a trilha em modo pendente para ajustes antes de aprovar."""
        path = self.get_object()
        if not (request.user.is_staff or request.user == path.user):
            raise PermissionDenied('Apenas o criador ou um admin pode refinar.')
        path.status = 'pending'
        path.is_active = False
        path.save(update_fields=['status', 'is_active', 'updated_at'])
        serializer = self.get_serializer(path)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='my-paths'
    )
    def my_paths(self, request):
        """
        Get list of career paths associated with current user
        GET /api/v1/career-paths/my-paths/
        """
        user = request.user
        
        # Get all active associations for this user
        associations = UserCareerPath.objects.filter(
            user=user,
            is_active=True
        ).select_related('career_path').prefetch_related('career_path__stages', 'career_path__stages__skills')
        user_skill_names = self._get_user_skill_names(user)
        
        # Serialize career paths with user-specific progress
        paths_data = []
        for assoc in associations:
            career_path = assoc.career_path
            
            # Get stages with user progress
            stages = career_path.stages.all().order_by('order')
            stage_progress = []
            completed_count = 0
            
            for stage in stages:
                progress = None
                is_completed = False
                completed_at = None
                
                try:
                    progress = UserStageProgress.objects.get(user=user, stage=stage)
                    is_completed = progress.is_completed
                    if is_completed:
                        completed_count += 1
                        completed_at = progress.completed_at
                except UserStageProgress.DoesNotExist:
                    is_completed = False
                
                stage_progress.append({
                    'id': stage.id,
                    'title': stage.title,
                    'description': stage.description,
                    'order': stage.order,
                    'is_completed': is_completed,
                    'completed_at': completed_at,
                    'skills': [
                        {
                            'id': skill.id,
                            'name': skill.name,
                            'description': skill.description,
                            'has_skill': skill.name in user_skill_names
                        } for skill in stage.skills.all()
                    ]
                })
            
            # Serialize career path
            path_data = CareerPathSerializer(career_path, context={'request': request}).data
            # Override stages with user-specific progress
            path_data['stages'] = stage_progress
            path_data['progress_percent'] = assoc.get_progress()
            path_data['started_at'] = assoc.started_at
            path_data['updated_at'] = assoc.updated_at
            
            paths_data.append(path_data)
        
        return Response(paths_data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        """
        Deactivate association with a career path (leave path)
        POST /api/v1/career-paths/{id}/leave/
        """
        career_path = self.get_object()
        user = request.user
        
        try:
            association = UserCareerPath.objects.get(user=user, career_path=career_path, is_active=True)
            association.is_active = False
            association.save()
            
            return Response({
                'message': 'Você saiu desta trilha com sucesso',
                'association': UserCareerPathSerializer(association, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        except UserCareerPath.DoesNotExist:
            return Response({
                'error': 'Você não está associado a esta trilha'
            }, status=status.HTTP_404_NOT_FOUND)
    
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

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrReadOnly])
    def toggle_active(self, request, pk=None):
        """
        Toggle active status of a career path
        PATCH /api/v1/career-paths/{id}/toggle_active/
        """
        career_path = self.get_object()
        is_active = request.data.get('is_active')

        # Default: invert current state if not provided
        if is_active is None:
            is_active = not career_path.is_active

        career_path.is_active = bool(is_active)
        career_path.save(update_fields=['is_active'])

        serializer = self.get_serializer(career_path)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def areas(self, request):
        """
        Get list of available professional areas (legacy endpoint for compatibility)
        GET /api/v1/career-paths/areas/
        """
        # Get active areas from Area model
        areas = Area.objects.filter(is_active=True).order_by('name')
        areas_data = []
        
        for area in areas:
            path_count = area.get_path_count()
            areas_data.append({
                'value': area.name,
                'label': area.name,
                'id': area.id,
                'path_count': path_count
            })
        
        return Response({
            'areas': areas_data,
            'total': len(areas_data)
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def levels(self, request):
        """
        Get list of available difficulty levels
        GET /api/v1/career-paths/levels/
        """
        levels = CareerPath.LEVEL_CHOICES
        levels_data = []
        
        for level_value, level_label in levels:
            # Count paths in this level
            path_count = CareerPath.objects.filter(level=level_value, is_active=True).count()
            levels_data.append({
                'value': level_value,
                'label': level_label,
                'path_count': path_count
            })
        
        return Response({
            'levels': levels_data,
            'total': len(levels_data)
        })


class CareerStageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Career Stages with validation for marking as completed
    """
    queryset = CareerStage.objects.all()
    serializer_class = CareerStageSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_permissions(self):
        """
        Allow authenticated students to marcar etapa como concluida (PATCH is_completed).
        Admins keep full access for other operations.
        """
        if self.request.method == 'PATCH' and 'is_completed' in self.request.data:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def _sync_profile_skills(self, user, stage):
        """
        Add stage skills to StudentProfile.habilidades when a stage is concluida.
        Returns list of awarded skill dicts for feedback.
        """
        try:
            from student_area.models import StudentProfile, Skill as StudentSkillModel, StudentSkill as StudentProfileSkill
        except Exception:
            return []

        profile, _ = StudentProfile.objects.get_or_create(user=user)
        awarded = []

        for stage_skill in stage.skills.all():
            profile_skill, _ = StudentSkillModel.objects.get_or_create(
                nome=stage_skill.name,
                defaults={'categoria': 'tecnica'}
            )
            student_skill, created = StudentProfileSkill.objects.get_or_create(
                student=profile,
                skill=profile_skill,
                defaults={'nivel': 'intermediario'}
            )
            if created:
                awarded.append({
                    'id': student_skill.id,
                    'name': profile_skill.nome,
                    'categoria': profile_skill.categoria,
                })
        return awarded
    
    def partial_update(self, request, *args, **kwargs):
        """
        Override partial_update to validate stage completion order
        Prevents users from skipping stages
        """
        instance = self.get_object()
        awarded_skills = []
        marking_completed = bool(request.data.get('is_completed'))
        
        # Check if trying to mark as completed
        if marking_completed:
            if not request.user.is_authenticated:
                raise PermissionDenied('Autenticacao necessaria para marcar etapas')
            
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
                            'error': f'Voce precisa completar a etapa anterior primeiro: "{prev_stage.title}"',
                            'required_stage_id': prev_stage.id,
                            'required_stage_title': prev_stage.title,
                            'required_stage_order': prev_stage.order
                        }, status=status.HTTP_400_BAD_REQUEST)
                except UserStageProgress.DoesNotExist:
                    return Response({
                        'error': f'Voce precisa completar a etapa anterior primeiro: "{prev_stage.title}"',
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

            awarded_skills = self._sync_profile_skills(request.user, instance)
        
        response = super().partial_update(request, *args, **kwargs)

        if response.status_code < 400 and marking_completed:
            if awarded_skills is not None:
                response.data['awarded_skills'] = awarded_skills
            try:
                user_path = UserCareerPath.objects.get(user=request.user, career_path=instance.career_path, is_active=True)
                response.data['progress_percent'] = user_path.get_progress()
            except UserCareerPath.DoesNotExist:
                response.data['progress_percent'] = None

        return response


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
