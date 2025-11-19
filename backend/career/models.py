from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class CareerPath(models.Model):
    # Tipo de trilha: pré-definida ou personalizada
    PATH_TYPES = [
        ('PRE', 'Pré-definida'),
        ('PER', 'Personalizada'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # Para trilhas personalizadas
    path_type = models.CharField(max_length=3, choices=PATH_TYPES, default='PRE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class CareerStage(models.Model):
    career_path = models.ForeignKey(CareerPath, on_delete=models.CASCADE, related_name='stages')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.IntegerField() # Ordem da etapa na trilha
    skills = models.ManyToManyField(Skill, blank=True) # Habilidades associadas a esta etapa
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ('career_path', 'order') # Garante ordem única por trilha

    def __str__(self):
        return f'{self.career_path.title} - Etapa {self.order}: {self.title}'
