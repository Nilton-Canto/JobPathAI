"""ViewSets para a API REST da área do estudante."""

from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from .models import JobApplication, JobOpportunity, Resume, StudentProfile
from .serializers import (
    JobApplicationSerializer,
    JobOpportunitySerializer,
    ResumeSerializer,
    StudentProfileSerializer,
)


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Permissão customizada que garante que apenas o dono do objeto
    ou um usuário staff consiga acessá-lo/modificá-lo.
    """

    def has_object_permission(self, request, view, obj):
        # owner or staff may access/modify
        user = getattr(request, 'user', None)
        if user is None or not user.is_authenticated:
            return False
        # StudentProfile and Resume reference user/student; handle common cases
        if hasattr(obj, 'user'):
            return obj.user == user or user.is_staff
        if hasattr(obj, 'student'):
            return obj.student.user == user or user.is_staff
        return user.is_staff

class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return StudentProfile.objects.all()
        return StudentProfile.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Resume.objects.all()
        profile = getattr(user, "student_profile", None)
        if user.is_staff:
            return Resume.objects.all()
        if profile:
            return Resume.objects.filter(student=profile)
        return Resume.objects.none()

    def perform_create(self, serializer):
        profile = getattr(self.request.user, "student_profile", None)
        if profile is None:
            raise ValidationError("StudentProfile não encontrado para o usuário autenticado.")
        serializer.save(student=profile)

class JobOpportunityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobOpportunity.objects.all()
    serializer_class = JobOpportunitySerializer
    permission_classes = [permissions.AllowAny]

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return JobApplication.objects.all()
        profile = getattr(user, "student_profile", None)
        if user.is_staff:
            return JobApplication.objects.all()
        if profile:
            return JobApplication.objects.filter(student=profile)
        return JobApplication.objects.none()

    def perform_create(self, serializer):
        profile = getattr(self.request.user, "student_profile", None)
        if profile is None:
            raise ValidationError("StudentProfile não encontrado para o usuário autenticado.")
        serializer.save(student=profile)