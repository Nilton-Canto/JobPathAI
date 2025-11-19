"""Views HTML tradicionais para a área do estudante."""

from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from .models import JobApplication, JobOpportunity, Resume, StudentProfile


@login_required
def dashboard_view(request):
    """
    Dashboard principal: mostra perfil e estatísticas rápidas.
    Usamos getattr para garantir que o atributo relacionado exista
    (o related_name definido no model é ``student_profile``).
    """
    profile = getattr(request.user, "student_profile", None)
    stats = {
        "jobs_count": JobOpportunity.objects.count(),
        "applications_count": JobApplication.objects.filter(student=profile).count()
        if profile
        else 0,
    }
    return render(
        request,
        "student_area/dashboard.html",
        {"profile": profile, "stats": stats},
    )


@login_required
def profile_view(request):
    """
    Permite que o estudante visualize e edite informações básicas do perfil.
    """
    profile, _ = StudentProfile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        profile.bio = request.POST.get("bio", profile.bio)
        profile.telefone = request.POST.get("telefone", profile.telefone)
        profile.cidade = request.POST.get("cidade", profile.cidade)
        profile.estado = request.POST.get("estado", profile.estado)
        profile.area_interesse = request.POST.get("area_interesse", profile.area_interesse)
        profile.save()
        return redirect("student:profile")

    return render(request, "student_area/profile.html", {"profile": profile})


@login_required
def resume_view(request):
    """
    View simples para visualizar/editar o currículo associado ao estudante.
    """
    profile, _ = StudentProfile.objects.get_or_create(user=request.user)
    resume, _ = Resume.objects.get_or_create(student=profile)

    if request.method == "POST":
        resume.objetivo_profissional = request.POST.get(
            "objetivo_profissional",
            resume.objetivo_profissional,
        )
        resume.save()
        return redirect("student:resume")

    return render(request, "student_area/resume.html", {"resume": resume})


def job_list_view(request):
    """Lista pública de vagas."""
    jobs = JobOpportunity.objects.all()
    return render(request, "student_area/job_list.html", {"jobs": jobs})


def job_detail_view(request, pk):
    """Detalhe público da vaga."""
    job = get_object_or_404(JobOpportunity, pk=pk)
    return render(request, "student_area/job_detail.html", {"job": job})


@login_required
def applications_view(request):
    """Lista candidaturas do estudante autenticado."""
    profile, _ = StudentProfile.objects.get_or_create(user=request.user)
    applications = JobApplication.objects.filter(student=profile)
    return render(
        request,
        "student_area/applications.html",
        {"applications": applications},
    )
