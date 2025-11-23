"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    # Root redirects to Django Admin (main purpose of backend)
    path("", views.RootRedirectView.as_view(), name="root"),
    
    # Django Admin - for superusers/staff only
    path("admin/", admin.site.urls),
    
    # API endpoints - JSON only, frontend React handles UI
    path("api/v1/", include("career.urls")),  # Career paths API
    path('api/student/', include('student_area.api_urls')),  # Student area API REST
    path("", include("users.urls")),  # User authentication API
    
    # Utility endpoints for developers/admins
    path("api/status/", views.StatusView.as_view(), name="api_status"),  # API status and endpoints info
    path("api/health/", views.HealthCheckView.as_view(), name="api_health"),  # Health check
    path("api/stats/", views.DatabaseStatsView.as_view(), name="api_stats"),  # Database stats (admin only)
]
