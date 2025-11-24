from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Area(models.Model):
    """
    Professional Area Model
    Represents a professional area/category for career paths
    """
    name = models.CharField(max_length=100, unique=True, help_text='Nome da área profissional')
    description = models.TextField(blank=True, null=True, help_text='Descrição da área profissional')
    is_active = models.BooleanField(default=True, help_text='Se a área está ativa e disponível')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Área Profissional'
        verbose_name_plural = 'Áreas Profissionais'

    def __str__(self):
        return self.name
    
    def get_path_count(self):
        """Get count of active career paths in this area"""
        return CareerPath.objects.filter(area=self, is_active=True).count()


class CareerPath(models.Model):
    # Tipo de trilha: pré-definida ou personalizada
    PATH_TYPES = [
        ('PRE', 'Pré-definida'),
        ('PER', 'Personalizada'),
    ]


    # Níveis de dificuldade
    LEVEL_CHOICES = [
        ('Iniciante', 'Iniciante'),
        ('Intermediário', 'Intermediário'),
        ('Avançado', 'Avançado'),
        ('Iniciante a Intermediário', 'Iniciante a Intermediário'),
        ('Intermediário a Avançado', 'Intermediário a Avançado'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Para trilhas personalizadas
    path_type = models.CharField(max_length=3, choices=PATH_TYPES, default='PRE')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pendente'),
        ('approved', 'Aprovada'),
        ('declined', 'Recusada'),
    ], default='pending')
    
    # Novos campos para filtros e melhor organização
    area = models.ForeignKey('Area', on_delete=models.SET_NULL, blank=True, null=True, related_name='career_paths', help_text='Área profissional da trilha')
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES, blank=True, null=True, help_text='Nível de dificuldade')
    estimated_time_months = models.PositiveIntegerField(blank=True, null=True, help_text='Tempo estimado em meses')
    hours_per_week = models.PositiveIntegerField(blank=True, null=True, help_text='Horas de estudo por semana')
    is_active = models.BooleanField(default=True, help_text='Se a trilha está ativa e disponível para usuários')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['area']),
            models.Index(fields=['level']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.title
    
    def get_estimated_time_display(self):
        """Retorna uma string formatada do tempo estimado"""
        if not self.estimated_time_months:
            return None
        
        parts = [f"{self.estimated_time_months} {'mês' if self.estimated_time_months == 1 else 'meses'}"]

        if self.hours_per_week:
            parts.append(f"({self.hours_per_week}h/semana)")
        
        return " ".join(parts)


class CareerStage(models.Model):
    career_path = models.ForeignKey(CareerPath, on_delete=models.CASCADE, related_name='stages')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.IntegerField()  # Ordem da etapa na trilha
    skills = models.ManyToManyField(Skill, blank=True)  # Habilidades associadas a esta etapa
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ('career_path', 'order')  # Garante ordem única por trilha

    def __str__(self):
        return f'{self.career_path.title} - Etapa {self.order}: {self.title}'


class UserCareerPath(models.Model):
    """
    Model to associate users with career paths (both predefined and personalized).
    Tracks user progress through career paths.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_career_paths')
    career_path = models.ForeignKey(CareerPath, on_delete=models.CASCADE, related_name='user_associations')
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, help_text='Whether user is actively following this path')
    
    class Meta:
        unique_together = ('user', 'career_path')  # User can only associate once per path
        ordering = ['-started_at']
        verbose_name = 'User Career Path Association'
        verbose_name_plural = 'User Career Path Associations'
    
    def __str__(self):
        return f'{self.user.username} - {self.career_path.title}'
    
    def get_progress(self):
        """Calculate progress percentage for this user's path"""
        # Import here to avoid circular import
        stages = self.career_path.stages.all()
        if not stages.exists():
            return 0
        
        # Count completed stages for this user using UserStageProgress
        completed = UserStageProgress.objects.filter(
            user=self.user,
            stage__in=stages,
            is_completed=True
        ).count()
        
        total = stages.count()
        return int((completed / total) * 100) if total > 0 else 0


class UserStageProgress(models.Model):
    """
    Tracks individual user progress through specific stages.
    Allows multiple users to have different completion status for the same stage.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stage_progress')
    stage = models.ForeignKey(CareerStage, on_delete=models.CASCADE, related_name='user_progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'stage')  # One progress record per user per stage
        ordering = ['stage__order']
        verbose_name = 'User Stage Progress'
        verbose_name_plural = 'User Stage Progresses'
    
    def __str__(self):
        status = 'Completed' if self.is_completed else 'In Progress'
        return f'{self.user.username} - {self.stage.title} ({status})'


class Favorite(models.Model):
    """
    Model for user favorites (career paths they want to save for later)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    career_path = models.ForeignKey(CareerPath, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'career_path')  # User can only favorite once per path
        ordering = ['-created_at']
        verbose_name = 'Favorite'
        verbose_name_plural = 'Favorites'
    
    def __str__(self):
        return f'{self.user.username} favorited {self.career_path.title}'
