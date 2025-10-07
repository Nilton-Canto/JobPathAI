from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),  # Maps the root URL to the index
        path('login/', views.LoginView.as_view(), name='login'),  # Rota para a página de login
        path('register/', views.NewUsersView.as_view(), name='register'), # Atualizado de 'novo_usuario' para 'register'
]