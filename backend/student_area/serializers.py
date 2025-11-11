from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import (
    StudentProfile,
    Skill,
    StudentSkill,
    Resume,
    WorkExperience,
    Education,
    Certification,
    Language,
    JobOpportunity,
    JobApplication,
)

# SkillSerializer #
class SkillSerializer(serializers.ModelSerializer): # Serializer simples para o modelo Skill (CRUD)
    class Meta:
        model = Skill
        fields = ['id', 'nome', 'categoria']  # ajuste conforme seus campos reais

class StudentSkillSerializer(serializers.ModelSerializer): # helper, nested (aninhado). Serializer para a relação StudentSkill (through). 
    # Usado de forma aninhada dentro de StudentProfileSerializer.
    # Referenciamos Skill pelo campo 'nome' para payloads legíveis:
    # Ex. -> {"skill": "Python", "nivel": "avancado", "anos_experiencia": 2}
    skill = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Skill.objects.all()
    )

    class Meta:
        model = StudentSkill
        fields = ['skill', 'nivel', 'anos_experiencia', 'adicionado_em']
        read_only_fields = ['adicionado_em']


# StudentProfileSerializer #
class StudentProfileSerializer(serializers.ModelSerializer):
    # Serializer principal para StudentProfile.
    # - aceita nested 'habilidades' (lista de StudentSkillSerializer - feito acima).
    #- se 'user' não for enviado, tenta usar request.user automaticamente.
    
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False) # Se user não for enviado, tenta preencher com request.user
    habilidades = StudentSkillSerializer(many=True, source='habilidades', required=False) # nested list de habilidades

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'foto', 'bio', 'data_nascimento', 'telefone', 'endereco',
            'cidade', 'estado', 'cep', 'area_interesse', 'nivel_experiencia',
            'disponibilidade', 'linkedin_url', 'github_url', 'portfolio_url',
            'perfil_completo', 'ativo', 'criado_em', 'atualizado_em', 'habilidades',
        ]
        read_only_fields = ['perfil_completo', 'criado_em', 'atualizado_em']

    def validate_habilidades(self, value):
        # Evita skills duplicadas no payload — verifica cada item na lista.
        # Garante que 'nivel' pertença às opções (choices) do model StudentSkill.
        # Verifica 'anos_experiencia' ser inteiro >= 0 quando fornecido.
        
        seen = set() # para rastrear skills já vistas.
        valid_niveis = {choice[0] for choice in StudentSkill._meta.get_field('nivel').choices} # obtém opções válidas.

        for item in value:
            skill_name = item.get('skill')
            if skill_name in seen:
                raise ValidationError(f"Habilidade '{skill_name}' está duplicada no payload.")
            seen.add(skill_name)

            nivel = item.get('nivel')
            if nivel is None:
                raise ValidationError("Cada habilidade deve conter o campo 'nivel'.")
            if nivel not in valid_niveis:
                raise ValidationError(f"Nível inválido '{nivel}'. Opções: {sorted(valid_niveis)}")

            anos = item.get('anos_experiencia')
            if anos is not None and (not isinstance(anos, int) or anos < 0): # se fornecido, deve ser inteiro >= 0 (anos de experiência)
                raise ValidationError("'anos_experiencia' deve ser inteiro >= 0.")
        return value

    def create(self, validated_data):
        habilidades_data = validated_data.pop('habilidades', [])

        # Se user não foi enviado, tenta preencher com request.user
        if 'user' not in validated_data:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                validated_data['user'] = request.user

        with transaction.atomic():
            student = StudentProfile.objects.create(**validated_data)

            # Cria/obtém skills e as relações StudentSkill
            for h in habilidades_data:
                skill_name = h['skill']
                skill_obj, _ = Skill.objects.get_or_create(nome=skill_name)
                StudentSkill.objects.create(
                    student=student,
                    skill=skill_obj,
                    nivel=h['nivel'],
                    anos_experiencia=h.get('anos_experiencia')
                )

        return student

    def update(self, instance, validated_data):
        habilidades_data = validated_data.pop('habilidades', None)

        with transaction.atomic():
            # Atualiza campos simples do profile
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            # Se vierem habilidades, sincroniza (criar/atualizar). Não remove por padrão.
            if habilidades_data is not None:
                enviados = []
                for h in habilidades_data:
                    skill_name = h['skill']
                    enviados.append(skill_name)
                    skill_obj, _ = Skill.objects.get_or_create(nome=skill_name)

                    student_skill, _ = StudentSkill.objects.get_or_create(
                        student=instance,
                        skill=skill_obj
                    )
                    student_skill.nivel = h['nivel']
                    student_skill.anos_experiencia = h.get('anos_experiencia')
                    student_skill.save()

                # Se você quer que o payload substitua completamente as habilidades do profile
                # (removendo as que não foram enviadas), descomente a linha abaixo:
                # StudentSkill.objects.filter(student=instance).exclude(skill__nome__in=enviados).delete()

        return instance

# ResumeSerializer (com nested para peças) #
class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = [
            'id', 'cargo', 'empresa', 'localizacao', 'tipo_emprego',
            'data_inicio', 'data_fim', 'trabalho_atual', 'descricao', 'ordem'
        ]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'instituicao', 'curso', 'nivel', 'status',
            'data_inicio', 'data_conclusao', 'descricao', 'ordem'
        ]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            'id', 'nome', 'instituicao', 'data_emissao', 'data_validade',
            'codigo_credencial', 'url_credencial', 'descricao', 'ordem'
        ]


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = [
            'id', 'idioma', 'nivel_leitura', 'nivel_escrita', 'nivel_conversacao', 'ordem'
        ]


class ResumeSerializer(serializers.ModelSerializer):
    # Resume com nested lists para experiencias/formacoes/certificacoes/idiomas (feitas acima).
    # A estratégia adotada aqui é: ao atualizar, remover e recriar as listas recebidas
    # (implementação simples e robusta). Se preferir atualização por ID, isso exige lógica extra.
    
    experiencias = WorkExperienceSerializer(many=True, required=False)
    formacoes = EducationSerializer(many=True, required=False)
    certificacoes = CertificationSerializer(many=True, required=False)
    idiomas = LanguageSerializer(many=True, required=False)

    class Meta:
        model = Resume
        fields = [
            'id', 'student', 'objetivo_profissional', 'criado_em', 'atualizado_em', 'visivel',
            'experiencias', 'formacoes', 'certificacoes', 'idiomas'
        ]
        read_only_fields = ['criado_em', 'atualizado_em']

    def create(self, validated_data):
        experiencias = validated_data.pop('experiencias', [])
        formacoes = validated_data.pop('formacoes', [])
        certificacoes = validated_data.pop('certificacoes', [])
        idiomas = validated_data.pop('idiomas', [])

        with transaction.atomic():
            resume = Resume.objects.create(**validated_data)
            for e in experiencias:
                WorkExperience.objects.create(resume=resume, **e)
            for f in formacoes:
                Education.objects.create(resume=resume, **f)
            for c in certificacoes:
                Certification.objects.create(resume=resume, **c)
            for l in idiomas:
                Language.objects.create(resume=resume, **l)
        return resume

    def update(self, instance, validated_data):
        experiencias = validated_data.pop('experiencias', None)
        formacoes = validated_data.pop('formacoes', None)
        certificacoes = validated_data.pop('certificacoes', None)
        idiomas = validated_data.pop('idiomas', None)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if experiencias is not None:
                instance.experiencias.all().delete()
                for e in experiencias:
                    WorkExperience.objects.create(resume=instance, **e)

            if formacoes is not None:
                instance.formacoes.all().delete()
                for f in formacoes:
                    Education.objects.create(resume=instance, **f)

            if certificacoes is not None:
                instance.certificacoes.all().delete()
                for c in certificacoes:
                    Certification.objects.create(resume=instance, **c)

            if idiomas is not None:
                instance.idiomas.all().delete()
                for l in idiomas:
                    Language.objects.create(resume=instance, **l)

        return instance


# JobOpportunitySerializer #
class JobOpportunitySerializer(serializers.ModelSerializer):
    # Serializer para vagas. 'habilidades_requeridas' aceita lista de nomes de Skill
    # (SlugRelatedField) como: ["Python", "SQL"]. Por exemplo: em vez de enviar "skill": 3, você envia "skill": "Python" — mais humano e legível.
    
    habilidades_requeridas = serializers.SlugRelatedField(
        many=True,
        slug_field='nome',
        queryset=Skill.objects.all(),
        required=False
    )

    class Meta:
        model = JobOpportunity
        fields = [
            'id', 'titulo', 'empresa', 'logo_empresa', 'descricao', 'requisitos',
            'requisitos_desejaveis', 'beneficios', 'tipo_vaga', 'modalidade', 'jornada',
            'cidade', 'estado', 'endereco_completo',
            'faixa_salarial_min', 'faixa_salarial_max', 'salario_a_combinar',
            'nivel_experiencia', 'area_atuacao', 'categoria', 'habilidades_requeridas',
            'numero_vagas', 'email_contato', 'telefone_contato', 'site_empresa',
            'url_aplicacao_externa', 'status', 'data_publicacao', 'data_expiracao',
            'destaque', 'urgente', 'visualizacoes', 'numero_candidaturas', 'publicado_por',
        ]
        read_only_fields = ['data_publicacao', 'visualizacoes', 'numero_candidaturas']

    def create(self, validated_data):
        # Para este caso, DRF já manipula many-to-many de habilidades_requeridas.
        return super().create(validated_data) # chama o create padrão do ModelSerializer (herança)


# JobApplicationSerializer #
class JobApplicationSerializer(serializers.ModelSerializer):
    
    # Serializer para candidaturas.
    # tenta inferir 'student' a partir de request.user caso não enviado.
    # previne candidaturas duplicadas (student + vaga).
    
    student = serializers.PrimaryKeyRelatedField(queryset=StudentProfile.objects.all(), required=False)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'student', 'vaga', 'carta_motivacao', 'curriculo_anexado',
            'status', 'data_candidatura', 'data_atualizacao_status', 'feedback_empresa',
            'visualizada_empresa', 'data_visualizacao'
        ]
        read_only_fields = ['status', 'data_candidatura', 'data_atualizacao_status', 'visualizada_empresa', 'data_visualizacao']

    def validate(self, attrs):
        request = self.context.get('request')
        if 'student' not in attrs and request and getattr(request, 'user', None) and request.user.is_authenticated:
            # tenta recuperar StudentProfile relacionado ao user autenticado
            try:
                attrs['student'] = request.user.student_profile
            except StudentProfile.DoesNotExist:
                raise ValidationError("Usuário autenticado não possui StudentProfile.")

        # se student e vaga disponíveis, evita duplicata
        student = attrs.get('student')
        vaga = attrs.get('vaga')
        if student and vaga:
            if JobApplication.objects.filter(student=student, vaga=vaga).exists():
                raise ValidationError("Já existe uma candidatura para este estudante nesta vaga.")
        return attrs

    def create(self, validated_data):
        vaga = validated_data.get('vaga')
        with transaction.atomic():
            app = super().create(validated_data)
            # no model de JobOpportunity tem um método para incrementar contagem. Imagino que deva funcionar.
            if vaga and hasattr(vaga, 'incrementar_candidatura'):
                vaga.incrementar_candidatura()
            return app

# Próximo passo: criar views (HTML + Vite) e View para API.
'''
4. Implementar Views e APIs
Arquivos: student_area/views.py e student_area/api_views.py

Views Tradicionais (HTML):
dashboard_view - Dashboard principal com estatísticas
profile_view - Visualizar/editar perfil
resume_view - Visualizar/editar currículo
job_list_view - Listar vagas disponíveis
job_detail_view - Detalhes da vaga
applications_view - Minhas candidaturas
API REST (JSON):
ProfileAPIView - GET, PUT, PATCH para perfil
ResumeAPIView - GET, PUT, PATCH para currículo
JobOpportunityListAPIView - GET para listar vagas
JobOpportunityDetailAPIView - GET para detalhes
JobApplicationAPIView - POST (candidatar), GET (listar), DELETE (cancelar)
DashboardStatsAPIView - GET para estatísticas"


Criar rotas:

/student/ - Dashboard
/student/profile/ - Perfil (HTML e API)
/student/resume/ - Currículo (HTML e API)
/student/jobs/ - Listar vagas (HTML e API)
/student/jobs/<id>/ - Detalhes vaga
/student/applications/ - Candidaturas (HTML e API)
/api/student/* - Endpoints API REST
Arquivo: config/urls.py

Incluir rotas: path('student/', include('student_area.urls'))

6. Criar Templates HTML (No caso, isso faz parte do front-end com Vite)
Diretório: student_area/templates/student_area/

Criar templates:

dashboard.html - Dashboard principal
profile.html - Perfil do estudante
profile_edit.html - Editar perfil
resume.html - Visualizar currículo
resume_edit.html - Editar currículo
job_list.html - Listar vagas
job_detail.html - Detalhes da vaga
applications.html - Minhas candidaturas
base_student.html - Template base para área do estudante
7. Implementar Permissões e Autenticação
Decorators @login_required para views HTML
IsAuthenticated permission para API REST
Verificar que apenas o próprio estudante pode editar seu perfil/currículo
Middleware para CORS (já configurado)
8. Criar Migrations e Admin
Executar python manage.py makemigrations student_area
Executar python manage.py migrate
Registrar modelos em student_area/admin.py para gerenciamento via Django Admin
9. Criar Testes Unitários
Arquivo: student_area/tests.py

Testes para:

Criação/edição de perfil
Criação/edição de currículo
Listagem de vagas
Candidatura a vagas
Permissões (apenas dono pode editar)
API endpoints (status codes, JSON responses)
10. Documentação e Organização
Adicionar docstrings em todas as views e models
Criar arquivo student_area/README.md documentando endpoints e funcionalidades
Atualizar requirements.txt com novas dependências
Arquivos Principais a Criar/Modificar
student_area/ (nova app)
student_area/models.py - 5 modelos principais
student_area/serializers.py - serializers DRF
student_area/views.py - views HTML tradicionais
student_area/api_views.py - views API REST
student_area/urls.py - rotas da app
student_area/admin.py - registro no admin
student_area/tests.py - testes unitários
student_area/templates/student_area/ - 8 templates HTML
config/settings.py - adicionar app e DRF
config/urls.py - incluir rotas
requirements.txt - adicionar djangorestframework

'''