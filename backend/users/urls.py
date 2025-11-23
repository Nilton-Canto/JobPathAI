"""
URL configuration for users app - API endpoints only
Frontend React handles all UI
"""

from django.urls import path
from . import views

urlpatterns = [
    # API endpoints - JSON only
    path('api/login/', views.LoginView.as_view(), name='api_login'),
    path('api/register/', views.RegisterView.as_view(), name='api_register'),
    path('api/logout/', views.LogoutView.as_view(), name='api_logout'),
    path('api/user-profile/', views.UserProfileView.as_view(), name='api_user_profile'),
    
    # Keep old routes for backward compatibility (redirect to API)
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]
