"""
URL configuration for llm app
"""

from django.urls import path
from . import views

app_name = 'llm'

urlpatterns = [
    # User endpoints
    path('generate-plan/', views.GeneratePlanView.as_view(), name='generate_plan'),
    path('chat/', views.ChatView.as_view(), name='chat'),
    
    # Admin endpoints
    path('admin-insights/', views.AdminInsightsView.as_view(), name='admin_insights'),
]

