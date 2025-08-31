from django.urls import path
from . import views
from .views import LoginView  # Importa a view de login
from .views import NovoUsuarioView  # Importa a view de novo usuário

urlpatterns = [
    path("", views.index, name="index"),  # Maps the root URL to the index
        path('login/', LoginView.as_view(), name='login'),  # Rota para a página de login
        path('novo_usuario/', NovoUsuarioView.as_view(), name='novo_usuario'),  # Rota para a página de cadastro de novo usuário
]