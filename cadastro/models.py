from django.db import models

# Create your models here.
class Cadastro(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    idade = models.PositiveBigIntegerField()

    def __str__(self): 
        return f"{self.nome} ({self.email})"