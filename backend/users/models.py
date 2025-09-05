from django.db import models

# Create your models here.
class Users(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True) #unique=True impede emails duplicados
    idade = models.PositiveBigIntegerField()
    cpf = models.CharField(max_length=11, unique=True) #unique=True impede CPFs duplicados

    def __str__(self): 
        return f"{self.nome} ({self.email})"