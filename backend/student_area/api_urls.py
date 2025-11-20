"""Rotas da API REST da área do estudante."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import (
    JobApplicationViewSet,
    JobOpportunityViewSet,
    ResumeViewSet,
    StudentProfileViewSet,
)

router = DefaultRouter()
router.register(r"profiles", StudentProfileViewSet, basename="student-profiles")
router.register(r"resumes", ResumeViewSet, basename="student-resumes")
router.register(r"jobs", JobOpportunityViewSet, basename="student-jobs")
router.register(r"applications", JobApplicationViewSet, basename="student-applications")

urlpatterns = [
    path("", include(router.urls)),
]
