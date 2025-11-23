from django.contrib import admin
from .models import (
    StudentProfile,
    Resume,
    WorkExperience,
    Education,
    Skill,
    StudentSkill,
    Certification,
    Language,
    JobOpportunity,
    JobApplication,
)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    """Admin configuration for StudentProfile model"""
    list_display = ('user', 'idade', 'cpf', 'area_interesse', 'nivel_experiencia', 'ativo', 'perfil_completo', 'criado_em')
    list_filter = ('ativo', 'perfil_completo', 'nivel_experiencia', 'disponibilidade', 'criado_em')
    search_fields = ('user__username', 'user__email', 'cpf', 'area_interesse', 'cidade', 'estado')
    readonly_fields = ('criado_em', 'atualizado_em')
    fieldsets = (
        ('Usuário', {
            'fields': ('user',)
        }),
        ('Informações Pessoais', {
            'fields': ('foto', 'bio', 'data_nascimento', 'idade', 'cpf')
        }),
        ('Contato', {
            'fields': ('telefone', 'endereco', 'cidade', 'estado', 'cep')
        }),
        ('Profissional', {
            'fields': ('area_interesse', 'nivel_experiencia', 'disponibilidade')
        }),
        ('Links', {
            'fields': ('linkedin_url', 'github_url', 'portfolio_url')
        }),
        ('Status', {
            'fields': ('perfil_completo', 'ativo', 'criado_em', 'atualizado_em')
        }),
    )


class WorkExperienceInline(admin.TabularInline):
    """Inline admin for WorkExperience"""
    model = WorkExperience
    extra = 1
    fields = ('cargo', 'empresa', 'data_inicio', 'data_fim', 'trabalho_atual', 'ordem')


class EducationInline(admin.TabularInline):
    """Inline admin for Education"""
    model = Education
    extra = 1
    fields = ('instituicao', 'curso', 'nivel', 'status', 'data_inicio', 'data_conclusao', 'ordem')


class CertificationInline(admin.TabularInline):
    """Inline admin for Certification"""
    model = Certification
    extra = 1
    fields = ('nome', 'instituicao', 'data_emissao', 'data_validade', 'ordem')


class LanguageInline(admin.TabularInline):
    """Inline admin for Language"""
    model = Language
    extra = 1
    fields = ('idioma', 'nivel_leitura', 'nivel_escrita', 'nivel_conversacao', 'ordem')


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    """Admin configuration for Resume with inline related models"""
    list_display = ('student', 'visivel', 'criado_em', 'atualizado_em')
    list_filter = ('visivel', 'criado_em')
    search_fields = ('student__user__username', 'objetivo_profissional')
    inlines = [WorkExperienceInline, EducationInline, CertificationInline, LanguageInline]
    fields = ('student', 'objetivo_profissional', 'visivel', 'criado_em', 'atualizado_em')
    readonly_fields = ('criado_em', 'atualizado_em')


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    """Admin configuration for WorkExperience model"""
    list_display = ('cargo', 'empresa', 'resume', 'data_inicio', 'data_fim', 'trabalho_atual', 'ordem')
    list_filter = ('trabalho_atual', 'tipo_emprego', 'data_inicio')
    search_fields = ('cargo', 'empresa', 'resume__student__user__username')


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    """Admin configuration for Education model"""
    list_display = ('curso', 'instituicao', 'nivel', 'status', 'resume', 'data_inicio', 'data_conclusao')
    list_filter = ('nivel', 'status', 'data_inicio')
    search_fields = ('curso', 'instituicao', 'resume__student__user__username')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin configuration for Skill model (student_area)"""
    list_display = ('nome', 'categoria')
    list_filter = ('categoria',)
    search_fields = ('nome',)


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    """Admin configuration for StudentSkill model"""
    list_display = ('student', 'skill', 'nivel', 'anos_experiencia', 'adicionado_em')
    list_filter = ('nivel', 'skill__categoria', 'adicionado_em')
    search_fields = ('student__user__username', 'skill__nome')


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    """Admin configuration for Certification model"""
    list_display = ('nome', 'instituicao', 'resume', 'data_emissao', 'data_validade', 'ordem')
    list_filter = ('data_emissao', 'data_validade')
    search_fields = ('nome', 'instituicao', 'resume__student__user__username')


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    """Admin configuration for Language model"""
    list_display = ('idioma', 'resume', 'nivel_leitura', 'nivel_escrita', 'nivel_conversacao', 'ordem')
    list_filter = ('nivel_leitura', 'nivel_escrita', 'nivel_conversacao')
    search_fields = ('idioma', 'resume__student__user__username')


@admin.register(JobOpportunity)
class JobOpportunityAdmin(admin.ModelAdmin):
    """Admin configuration for JobOpportunity model"""
    list_display = ('titulo', 'empresa', 'tipo_vaga', 'modalidade', 'status', 'numero_vagas', 'numero_candidaturas', 'data_publicacao')
    list_filter = ('status', 'tipo_vaga', 'modalidade', 'nivel_experiencia', 'area_atuacao', 'destaque', 'urgente', 'data_publicacao')
    search_fields = ('titulo', 'empresa', 'descricao', 'area_atuacao', 'categoria')
    readonly_fields = ('visualizacoes', 'numero_candidaturas', 'data_publicacao', 'data_atualizacao')
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'empresa', 'logo_empresa', 'descricao')
        }),
        ('Requisitos', {
            'fields': ('requisitos', 'requisitos_desejaveis', 'beneficios', 'habilidades_requeridas')
        }),
        ('Tipo e Modalidade', {
            'fields': ('tipo_vaga', 'modalidade', 'jornada', 'nivel_experiencia')
        }),
        ('Localização', {
            'fields': ('cidade', 'estado', 'endereco_completo')
        }),
        ('Remuneração', {
            'fields': ('faixa_salarial_min', 'faixa_salarial_max', 'salario_a_combinar')
        }),
        ('Categorização', {
            'fields': ('area_atuacao', 'categoria')
        }),
        ('Vagas e Contato', {
            'fields': ('numero_vagas', 'email_contato', 'telefone_contato', 'site_empresa', 'url_aplicacao_externa')
        }),
        ('Status e Datas', {
            'fields': ('status', 'data_publicacao', 'data_expiracao', 'data_atualizacao', 'destaque', 'urgente')
        }),
        ('Estatísticas', {
            'fields': ('visualizacoes', 'numero_candidaturas', 'publicado_por')
        }),
    )


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    """Admin configuration for JobApplication model"""
    list_display = ('student', 'vaga', 'status', 'data_candidatura', 'visualizada_empresa', 'data_atualizacao_status')
    list_filter = ('status', 'visualizada_empresa', 'data_candidatura', 'data_atualizacao_status')
    search_fields = ('student__user__username', 'vaga__titulo', 'vaga__empresa', 'carta_motivacao')
    readonly_fields = ('data_candidatura', 'data_atualizacao_status', 'data_visualizacao')
    fieldsets = (
        ('Candidatura', {
            'fields': ('student', 'vaga', 'carta_motivacao', 'curriculo_anexado')
        }),
        ('Status', {
            'fields': ('status', 'data_candidatura', 'data_atualizacao_status')
        }),
        ('Visualização', {
            'fields': ('visualizada_empresa', 'data_visualizacao')
        }),
        ('Feedback', {
            'fields': ('feedback_empresa',)
        }),
    )
