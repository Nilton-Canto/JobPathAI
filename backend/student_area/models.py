from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


# Model para StudentProfile - informações pessoais do estudante, um perfil estendido.
class StudentProfile(models.Model):

    # Relacionamento com User do Django (1 para 1)
    user = models.OneToOneField(
        User,  # User é o modelo de usuário do Django
        on_delete=models.CASCADE,  # CASCADE: se o usuário for deletado, o perfil do estudante também será deletado
        related_name='student_profile',  # related_name: nome do relacionamento com o usuário
        verbose_name='Usuário'  # verbose_name: nome do campo no admin
    )

    # Informações pessoais
    foto = models.ImageField(
        upload_to='students/photos/',
        null=True,
        blank=True,
        verbose_name='Foto de Perfil'
    )

    bio = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='Biografia',
        help_text='Conte um pouco sobre você (máx. 500 caracteres)'
    )

    data_nascimento = models.DateField(
        null=True,
        blank=True,
        verbose_name='Data de Nascimento'
    )

    # Contato
    telefone_validator = RegexValidator(  # RegexValidator é usado para validar o formato do telefone
        regex=r'^\+?1?\d{9,15}$',
        message="Formato: '+999999999'. Até 15 dígitos permitidos."
    )

    telefone = models.CharField(
        validators=[telefone_validator],
        max_length=17,
        blank=True,
        verbose_name='Telefone'
    )

    # Endereço
    endereco = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Endereço'
    )

    cidade = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Cidade'
    )

    estado = models.CharField(
        max_length=2,
        blank=True,
        verbose_name='Estado (UF)',
        help_text='Ex: SP, RJ, MG'
    )

    cep = models.CharField(
        max_length=9,
        blank=True,
        verbose_name='CEP',
        help_text='Formato: 00000-000'
    )

    # Informações acadêmicas/profissionais
    area_interesse = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Área de Interesse',
        help_text='Ex: Desenvolvimento Web, Design, Marketing'
    )

    nivel_experiencia = models.CharField(
        max_length=20,
        choices=[
            ('estagiario', 'Estagiário'),
            ('junior', 'Júnior'),
            ('pleno', 'Pleno'),
            ('senior', 'Sênior'),
            ('sem_experiencia', 'Sem Experiência'),
        ],
        default='sem_experiencia',
        verbose_name='Nível de Experiência'
    )

    # Campos adicionais (migrados de Users para consolidar dados)
    idade = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Idade'
    )
    
    cpf = models.CharField(
        max_length=11,
        unique=True,
        null=True,
        blank=True,
        verbose_name='CPF',
        help_text='CPF do usuário (único)'
    )

    disponibilidade = models.CharField(
        max_length=20,
        choices=[
            ('integral', 'Tempo Integral'),
            ('parcial', 'Meio Período'),
            ('freelancer', 'Freelancer'),
            ('estagio', 'Estágio'),
        ],
        default='integral',
        verbose_name='Disponibilidade'
    )

    # Links profissionais
    linkedin_url = models.URLField(
        max_length=200,
        blank=True,
        verbose_name='LinkedIn'
    )

    github_url = models.URLField(
        max_length=200,
        blank=True,
        verbose_name='GitHub'
    )

    portfolio_url = models.URLField(
        max_length=200,
        blank=True,
        verbose_name='Portfólio'
    )

    # Metadados; Por que criar? Para saber quando o perfil foi criado e atualizado
    criado_em = models.DateTimeField(  # auto_now_add=True: cria o campo com a data e hora atuais quando o objeto é criado
        auto_now_add=True,
        verbose_name='Criado em'
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,  # Mesmo raciocínio do auto_now_add=True, mas atualiza o campo com a data e hora atuais quando o objeto é atualizado
        verbose_name='Atualizado em'
    )

    perfil_completo = models.BooleanField(  # True: perfil completo, False: perfil incompleto
        default=False,  # False: perfil incompleto
        verbose_name='Perfil Completo',
        help_text='Indica se o perfil tem todas as informações preenchidas'
    )

    ativo = models.BooleanField(
        default=True,
        verbose_name='Ativo',
        help_text='Indica se o perfil está ativo e visível para empresas'
    )

    class Meta:  # Meta é usado para definir metadados do modelo. Qual o motivo de criar uma classe Meta? Para definir metadados do modelo
        verbose_name = 'Perfil do Estudante'
        verbose_name_plural = 'Perfis dos Estudantes'
        ordering = ['-criado_em']  # ordering é usado para ordenar os objetos do modelo

    def __str__(self):  # __str__ é usado para retornar uma string que representa o objeto
        # Exemplo: "Mariana Menezes - Arquitetura"
        return f"{self.user.get_full_name() or self.user.username} - {self.area_interesse or 'Sem área definida'}"

    def calcular_completude_perfil(self):  # Percentual de completude do perfil
        campos_obrigatorios = [  # Por que "CPF" não está aqui? Porque o CPF é único e não pode ser alterado após o cadastro.
            self.foto,
            self.bio,
            self.data_nascimento,
            self.telefone,
            self.cidade,
            self.estado,
            self.area_interesse,
        ]

        # 1 for campo in campos_obrigatorios if campo: para cada campo em campos_obrigatorios, se o campo for preenchido, soma 1
        preenchidos = sum(1 for campo in campos_obrigatorios if campo)
        # A partir daqui é possível calcular o percentual de completude do perfil
        return int((preenchidos / len(campos_obrigatorios)) * 100)

    def save(self, *args, **kwargs):
        """
        Override save method to automatically update perfil_completo field.
        Profile is considered complete if at least 80% of required fields are filled.
        """
        self.perfil_completo = self.calcular_completude_perfil() >= 80
        super().save(*args, **kwargs)


class Resume(models.Model):  # Model para Resume - informações do currículo do estudante

    # Relacionamento com StudentProfile (1 para 1). Isso quer dizer que um estudante só pode ter um currículo.
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,  # CASCADE: se o estudante for deletado, o currículo também será deletado
        related_name='resume',  # related_name: nome do relacionamento com o estudante. "resume" = currículo do estudante
        verbose_name='Estudante'  # verbose_name: nome do campo no admin
    )

    # Objetivo/Resumo Profissional
    objetivo_profissional = models.TextField(
        max_length=1000,
        blank=True,
        verbose_name='Objetivo Profissional',
        help_text='Descreva seus objetivos de carreira e o que você busca'
    )

    # Metadados
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    visivel = models.BooleanField(
        default=True,
        verbose_name='Visível para Empresas'
    )

    class Meta:
        verbose_name = 'Currículo'
        verbose_name_plural = 'Currículos'

    def __str__(self):
        # Exemplo: "Currículo de Mariana Menezes"
        return f"Currículo de {self.student.user.get_full_name() or self.student.user.username}"


class WorkExperience(models.Model):  # Model para WorkExperience - informações da experiência profissional do estudante

    resume = models.ForeignKey(  # ForeignKey é usado para criar um relacionamento com o modelo Resume. Importante para a realização do modelo conceitual.
        Resume,
        on_delete=models.CASCADE,  # CASCADE: se o currículo for deletado, a experiência profissional também será deletada
        # related_name: nome do relacionamento com o currículo. "experiencias" = experiências profissionais do estudante
        related_name='experiencias',
        verbose_name='Currículo'  # verbose_name: nome do campo no admin
    )

    cargo = models.CharField(
        max_length=200,
        verbose_name='Cargo'
    )

    empresa = models.CharField(
        max_length=200,
        verbose_name='Empresa'
    )

    localizacao = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Localização',
        help_text='Ex: São Paulo, SP'
    )

    tipo_emprego = models.CharField(
        max_length=20,
        choices=[
            ('clt', 'CLT'),
            ('pj', 'PJ'),
            ('estagio', 'Estágio'),
            ('freelance', 'Freelance'),
            ('autonomo', 'Autônomo'),
        ],
        default='clt',
        verbose_name='Tipo de Emprego'
    )

    data_inicio = models.DateField(verbose_name='Data de Início')

    data_fim = models.DateField(
        null=True,  # null=True: permite que o campo seja deixado em branco
        blank=True,  # blank=True: permite que o campo seja deixado em branco
        verbose_name='Data de Término',
        help_text='Deixe em branco se ainda trabalha aqui'
    )

    trabalho_atual = models.BooleanField(
        default=False,
        verbose_name='Trabalho Atual'
    )

    descricao = models.TextField(
        max_length=2000,
        blank=True,
        verbose_name='Descrição das Atividades',
        help_text='Descreva suas principais responsabilidades e conquistas. Seja criativo!'
    )

    ordem = models.IntegerField(  # Ordem de exibição da experiência profissional. 0 = primeira, 1 = segunda, etc.
        default=0,
        verbose_name='Ordem de Exibição'
    )

    class Meta:
        verbose_name = 'Experiência Profissional'
        verbose_name_plural = 'Experiências Profissionais'
        ordering = ['-data_inicio', 'ordem']

    def __str__(self):
        return f"{self.cargo} - {self.empresa}"  # Exemplo: "Desenvolvedor - Google"


class Education(models.Model):  # Model para Education - informações da formação acadêmica do estudante

    resume = models.ForeignKey(  # ForeignKey é usado para criar um relacionamento com o modelo Resume. Importante para a realização do modelo conceitual.
        Resume,
        on_delete=models.CASCADE,  # CASCADE: se o currículo for deletado, a formação acadêmica também será deletada
        related_name='formacoes',  # related_name: nome do relacionamento com o currículo. "formacoes" = formações acadêmicas do estudante
        verbose_name='Currículo'  # verbose_name: nome do campo no admin
    )

    instituicao = models.CharField(
        max_length=200,
        verbose_name='Instituição de Ensino'
    )

    curso = models.CharField(
        max_length=200,
        verbose_name='Curso/Formação'
    )

    nivel = models.CharField(
        max_length=20,
        choices=[
            # Por que ([x], [X])? Porque o campo é um choices, ou seja, só pode ser um dos valores listados.
            ('medio', 'Ensino Médio'),
            ('tecnico', 'Técnico'),
            ('graduacao', 'Graduação'),
            ('pos', 'Pós-Graduação'),
            ('mestrado', 'Mestrado'),
            ('doutorado', 'Doutorado'),
        ],
        verbose_name='Nível de Formação'
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ('cursando', 'Cursando'),
            ('concluido', 'Concluído'),
            ('trancado', 'Trancado'),
            ('incompleto', 'Incompleto'),
        ],
        default='cursando',
        verbose_name='Status'
    )

    data_inicio = models.DateField(verbose_name='Data de Início')

    data_conclusao = models.DateField(
        null=True,
        blank=True,
        verbose_name='Data de Conclusão/Previsão'
    )

    descricao = models.TextField(
        max_length=1000,
        blank=True,
        verbose_name='Descrição',
        help_text='Principais disciplinas, projetos ou conquistas'
    )

    ordem = models.IntegerField(
        default=0,
        verbose_name='Ordem de Exibição'
    )

    class Meta:
        verbose_name = 'Formação Acadêmica'
        verbose_name_plural = 'Formações Acadêmicas'
        ordering = ['-data_inicio', 'ordem']

    def __str__(self):
        return f"{self.curso} - {self.instituicao}"


class Skill(models.Model):  # Model para Skill - informações das habilidades do estudante

    nome = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nome da Habilidade'
    )

    categoria = models.CharField(
        max_length=20,
        choices=[
            ('tecnica', 'Técnica'),
            ('idioma', 'Idioma'),
            ('soft', 'Soft Skill'),
            ('ferramenta', 'Ferramenta'),
        ],
        default='tecnica',
        verbose_name='Categoria'
    )

    class Meta:
        verbose_name = 'Habilidade'
        verbose_name_plural = 'Habilidades'
        ordering = ['categoria', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.get_categoria_display()})"


class StudentSkill(models.Model):  # Model para StudentSkill - informações das habilidades do estudante. Relacionamento ManyToMany customizado entre Estudante e Habilidadescom nível de proficiência

    student = models.ForeignKey(  # ForeignKey é usado para criar um relacionamento com o modelo StudentProfile. Importante para a realização do modelo conceitual.
        StudentProfile,
        on_delete=models.CASCADE,  # CASCADE: se o estudante for deletado, a habilidade também será deletada
        related_name='habilidades',  # related_name: nome do relacionamento com o estudante. "habilidades" = habilidades do estudante
        verbose_name='Estudante'  # verbose_name: nome do campo no admin
    )

    skill = models.ForeignKey(  # Também é um ForeignKey, mas relaciona com o modelo Skill. Ambas relacionam-se com o modelo StudentSkill.
        Skill,
        on_delete=models.CASCADE,
        related_name='estudantes',
        verbose_name='Habilidade'
    )

    nivel = models.CharField(  # Nível de proficiência da habilidade.
        max_length=20,
        choices=[
            ('basico', 'Básico'),
            ('intermediario', 'Intermediário'),
            ('avancado', 'Avançado'),
            ('expert', 'Expert'),
        ],
        default='intermediario',
        verbose_name='Nível de Proficiência'
    )

    anos_experiencia = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Anos de Experiência'
    )

    adicionado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Habilidade do Estudante'
        verbose_name_plural = 'Habilidades dos Estudantes'
        unique_together = ['student', 'skill']
        ordering = ['-nivel', 'skill__nome']

    def __str__(self):
        # Exemplo: "Mariana Menezes - Design de Interiores (Intermediário)"
        return f"{self.student.user.username} - {self.skill.nome} ({self.get_nivel_display()})"


class Certification(models.Model):  # Model para Certification - informações das certificações do estudante

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='certificacoes',
        verbose_name='Currículo'
    )

    nome = models.CharField(
        max_length=200,
        verbose_name='Nome da Certificação/Curso'
    )

    instituicao = models.CharField(
        max_length=200,
        verbose_name='Instituição Emissora'
    )

    data_emissao = models.DateField(
        verbose_name='Data de Emissão'
    )

    data_validade = models.DateField(
        null=True,
        blank=True,
        verbose_name='Data de Validade',
        help_text='Deixe em branco se não expira'
    )

    codigo_credencial = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Código/ID da Credencial'
    )

    url_credencial = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='URL da Credencial',
        help_text='Link para verificação da certificação'
    )

    descricao = models.TextField(
        max_length=1000,
        blank=True,
        verbose_name='Descrição'
    )

    ordem = models.IntegerField(
        default=0,
        verbose_name='Ordem de Exibição'
    )

    class Meta:
        verbose_name = 'Certificação'
        verbose_name_plural = 'Certificações'
        ordering = ['-data_emissao', 'ordem']

    def __str__(self):
        return f"{self.nome} - {self.instituicao}"


class Language(models.Model):  # Model para Language - informações dos idiomas do estudante

    resume = models.ForeignKey(  # ForeignKey é usado para criar um relacionamento com o modelo Resume. Importante para a realização do modelo conceitual.
        Resume,
        on_delete=models.CASCADE,  # CASCADE: se o currículo for deletado, o idioma também será deletado
        related_name='idiomas',  # related_name: nome do relacionamento com o currículo. "idiomas" = idiomas do estudante
        verbose_name='Currículo'
    )

    idioma = models.CharField(
        max_length=50,
        verbose_name='Idioma'
    )

    nivel_leitura = models.CharField(
        max_length=20,
        choices=[
            ('basico', 'Básico'),
            ('intermediario', 'Intermediário'),
            ('avancado', 'Avançado'),
            ('fluente', 'Fluente'),
            ('nativo', 'Nativo'),
        ],
        verbose_name='Nível de Leitura'
    )

    nivel_escrita = models.CharField(
        max_length=20,
        choices=[
            ('basico', 'Básico'),
            ('intermediario', 'Intermediário'),
            ('avancado', 'Avançado'),
            ('fluente', 'Fluente'),
            ('nativo', 'Nativo'),
        ],
        verbose_name='Nível de Escrita'
    )

    nivel_conversacao = models.CharField(
        max_length=20,
        choices=[
            ('basico', 'Básico'),
            ('intermediario', 'Intermediário'),
            ('avancado', 'Avançado'),
            ('fluente', 'Fluente'),
            ('nativo', 'Nativo'),
        ],
        verbose_name='Nível de Conversação'
    )

    ordem = models.IntegerField(
        default=0,
        verbose_name='Ordem de Exibição'
    )

    class Meta:
        verbose_name = 'Idioma'
        verbose_name_plural = 'Idiomas'
        ordering = ['ordem', 'idioma']  # ordering é usado para ordenar os objetos do modelo

    def __str__(self):
        return f"{self.idioma} - {self.get_nivel_conversacao_display()}"  # Exemplo: "Inglês - Fluente"


class JobOpportunity(models.Model):  # Model para JobOpportunity - informações das vagas de emprego disponíveis para estudante

    # Informações básicas da vaga
    titulo = models.CharField(
        max_length=200,
        verbose_name='Título da Vaga'
    )

    empresa = models.CharField(
        max_length=200,
        verbose_name='Nome da Empresa'
    )

    logo_empresa = models.ImageField(  # ImageField é usado para armazenar imagens.
        # upload_to é usado para especificar o diretório onde as imagens serão armazenadas. Onde ficaram armazenadas? No diretório 'companies/logos/' dentro da pasta 'backend/media/'.
        upload_to='companies/logos/',
        null=True,
        blank=True,
        verbose_name='Logo da Empresa'
    )

    # Descrição e requisitos
    descricao = models.TextField(
        verbose_name='Descrição da Vaga',
        help_text='Descreva as responsabilidades e atividades do cargo'
    )

    requisitos = models.TextField(
        verbose_name='Requisitos',
        help_text='Liste os requisitos obrigatórios para a vaga'
    )

    requisitos_desejaveis = models.TextField(
        blank=True,
        verbose_name='Requisitos Desejáveis',
        help_text='Liste os requisitos opcionais/desejáveis'
    )

    beneficios = models.TextField(
        blank=True,
        verbose_name='Benefícios',
        help_text='Liste os benefícios oferecidos pela empresa'
    )

    # Tipo de vaga
    tipo_vaga = models.CharField(
        max_length=20,
        choices=[
            ('clt', 'CLT'),
            ('pj', 'PJ'),
            ('estagio', 'Estágio'),
            ('freelance', 'Freelance'),
            ('temporario', 'Temporário'),
        ],
        verbose_name='Tipo de Contratação'
    )

    modalidade = models.CharField(
        max_length=20,
        choices=[
            ('presencial', 'Presencial'),
            ('remoto', 'Remoto'),
            ('hibrido', 'Híbrido'),
        ],
        default='presencial',
        verbose_name='Modalidade de Trabalho'
    )

    jornada = models.CharField(
        max_length=20,
        choices=[
            ('integral', 'Tempo Integral'),
            ('parcial', 'Meio Período'),
            ('flexivel', 'Flexível'),
        ],
        default='integral',
        verbose_name='Jornada de Trabalho'
    )

    # Localização
    cidade = models.CharField(
        max_length=100,
        verbose_name='Cidade'
    )

    estado = models.CharField(
        max_length=2,
        verbose_name='Estado (UF)'
    )

    endereco_completo = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Endereço Completo'
    )

    # Remuneração
    faixa_salarial_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Salário Mínimo'
    )

    faixa_salarial_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Salário Máximo'
    )

    salario_a_combinar = models.BooleanField(
        default=False,
        verbose_name='Salário a Combinar'
    )

    # Nível de experiência
    nivel_experiencia = models.CharField(
        max_length=20,
        choices=[
            ('estagiario', 'Estagiário'),
            ('junior', 'Júnior'),
            ('pleno', 'Pleno'),
            ('senior', 'Sênior'),
            ('sem_experiencia', 'Sem Experiência'),
        ],
        verbose_name='Nível de Experiência Requerido'
    )

    # Áreas e categorias
    area_atuacao = models.CharField(
        max_length=100,
        verbose_name='Área de Atuação',
        help_text='Ex: Tecnologia, Marketing, Design, etc.'
    )

    categoria = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Categoria',
        help_text='Ex: Desenvolvimento Web, UX/UI, Marketing Digital'
    )

    # Habilidades requeridas (ManyToMany)
    habilidades_requeridas = models.ManyToManyField(
        Skill,
        blank=True,
        related_name='vagas',
        verbose_name='Habilidades Requeridas'
    )

    # Número de vagas
    numero_vagas = models.IntegerField(
        default=1,
        verbose_name='Número de Vagas Disponíveis'
    )

    # Contato
    email_contato = models.EmailField(
        verbose_name='Email para Contato'
    )

    telefone_contato = models.CharField(
        max_length=17,
        blank=True,
        verbose_name='Telefone para Contato'
    )

    site_empresa = models.URLField(
        max_length=300,
        blank=True,
        verbose_name='Site da Empresa'
    )

    url_aplicacao_externa = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='URL de Candidatura Externa',
        help_text='Link externo para aplicação (se houver)'
    )

    # Status e datas
    status = models.CharField(
        max_length=20,
        choices=[
            ('ativa', 'Ativa'),
            ('pausada', 'Pausada'),
            ('encerrada', 'Encerrada'),
            ('preenchida', 'Preenchida'),
        ],
        default='ativa',
        verbose_name='Status da Vaga'
    )

    data_publicacao = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Publicação'
    )

    data_expiracao = models.DateField(
        null=True,
        blank=True,
        verbose_name='Data de Expiração',
        help_text='Data limite para candidaturas'
    )

    data_atualizacao = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Atualização'
    )

    # Metadados
    destaque = models.BooleanField(
        default=False,
        verbose_name='Vaga em Destaque',
        help_text='Vagas em destaque aparecem no topo das listagens'
    )

    urgente = models.BooleanField(
        default=False,
        verbose_name='Vaga Urgente'
    )

    visualizacoes = models.IntegerField(
        default=0,
        verbose_name='Número de Visualizações'
    )

    numero_candidaturas = models.IntegerField(
        default=0,
        verbose_name='Número de Candidaturas'
    )

    # Quem publicou (pode ser admin ou empresa)
    publicado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='vagas_publicadas',
        verbose_name='Publicado por'
    )

    class Meta:
        verbose_name = 'Vaga de Emprego'
        verbose_name_plural = 'Vagas de Emprego'
        ordering = ['-destaque', '-data_publicacao']
        indexes = [
            models.Index(fields=['-data_publicacao']),
            models.Index(fields=['status', '-data_publicacao']),
            models.Index(fields=['area_atuacao', 'status']),
        ]

    def __str__(self):
        return f"{self.titulo} - {self.empresa} ({self.get_status_display()})"

    def is_ativa(self):  # Verifica se a vaga está ativa e dentro do prazo

        from django.utils import timezone
        if self.status != 'ativa':
            return False
        if self.data_expiracao and self.data_expiracao < timezone.now().date():
            return False
        return True

    def incrementar_visualizacao(self):  # Incrementa contador de visualizações

        self.visualizacoes += 1
        self.save(update_fields=['visualizacoes'])

    def incrementar_candidatura(self):  # Incrementa contador de candidaturas

        self.numero_candidaturas += 1
        self.save(update_fields=['numero_candidaturas'])

    def get_faixa_salarial_display(self):  # Retorna string formatada da faixa salarial

        if self.salario_a_combinar:
            return "A combinar"
        if self.faixa_salarial_min and self.faixa_salarial_max:
            return f"R$ {self.faixa_salarial_min:,.2f} - R$ {self.faixa_salarial_max:,.2f}"
        elif self.faixa_salarial_min:
            return f"A partir de R$ {self.faixa_salarial_min:,.2f}"
        return "Não informado"

    def dias_publicada(self):  # Retorna quantos dias a vaga foi publicada

        from django.utils import timezone
        delta = timezone.now() - self.data_publicacao
        return delta.days


class JobApplication(models.Model):  # Candidaturas dos estudantes às vagas

    # Relacionamentos
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='candidaturas',
        verbose_name='Estudante'
    )

    vaga = models.ForeignKey(
        JobOpportunity,
        on_delete=models.CASCADE,
        related_name='candidaturas',
        verbose_name='Vaga'
    )

    # Dados da candidatura
    carta_motivacao = models.TextField(
        max_length=2000,
        blank=True,
        verbose_name='Carta de Motivação',
        help_text='Explique por que você é o candidato ideal para esta vaga'
    )

    curriculo_anexado = models.FileField(
        upload_to='applications/resumes/',  # Atentar-se à criação destes diretórios
        null=True,
        blank=True,
        verbose_name='Currículo Anexado (PDF)',
        help_text='Anexe seu currículo em PDF'
    )

    # Status da candidatura
    status = models.CharField(
        max_length=20,
        choices=[
            ('enviada', 'Enviada'),
            ('em_analise', 'Em Análise'),
            ('pre_selecionado', 'Pré-selecionado'),
            ('entrevista', 'Entrevista Agendada'),
            ('aprovado', 'Aprovado'),
            ('rejeitado', 'Rejeitado'),
            ('cancelada', 'Cancelada'),
        ],
        default='enviada',
        verbose_name='Status'
    )

    # Datas
    data_candidatura = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data da Candidatura'
    )

    data_atualizacao_status = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Atualização'
    )

    # Feedback (opcional, preenchido pela empresa)
    feedback_empresa = models.TextField(
        blank=True,
        verbose_name='Feedback da Empresa'
    )

    # Metadados
    visualizada_empresa = models.BooleanField(
        default=False,
        verbose_name='Visualizada pela Empresa'
    )

    data_visualizacao = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Visualização'
    )

    class Meta:
        verbose_name = 'Candidatura'
        verbose_name_plural = 'Candidaturas'
        ordering = ['-data_candidatura']
        unique_together = ['student', 'vaga']  # Um estudante só pode se candidatar uma vez por vaga
        indexes = [
            models.Index(fields=['student', '-data_candidatura']),
            models.Index(fields=['vaga', 'status']),
        ]

    def __str__(self):
        return f"{self.student.user.username} → {self.vaga.titulo} ({self.get_status_display()})"

    def pode_cancelar(self):  # Verifica se é possível cancelar a candidatura

        return self.status in ['enviada', 'em_analise']

    def dias_candidatura(self):  # Retorna quantos dias desde a candidatura

        from django.utils import timezone
        delta = timezone.now() - self.data_candidatura
        return delta.days
