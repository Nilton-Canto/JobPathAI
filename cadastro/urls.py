from django.urls import path
from . import views
from .views import LoginView  # Importa a view de login

urlpatterns = [
    path("", views.index, name="index"),  # Maps the root URL to the index
        path('login/', LoginView.as_view(), name='login'),  # Rota para a página de login
]