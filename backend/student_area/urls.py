"""Rotas HTML para a área do estudante."""

from django.urls import path

from . import views

app_name = "student"

urlpatterns = [
    path("", views.dashboard_view, name="dashboard"),
    path("profile/", views.profile_view, name="profile"),
    path("resume/", views.resume_view, name="resume"),
    path("jobs/", views.job_list_view, name="job_list"),
    path("jobs/<int:pk>/", views.job_detail_view, name="job_detail"),
    path("applications/", views.applications_view, name="applications"),
]
