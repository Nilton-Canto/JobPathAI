# Generated migration to migrate data from Users to StudentProfile

from django.db import migrations


def migrate_users_to_student_profile(apps, schema_editor):
    """
    Migra dados de Users para StudentProfile
    Conecta Users com User do Django pelo email e cria/atualiza StudentProfile
    """
    try:
        Users = apps.get_model('users', 'Users')
        User = apps.get_model('auth', 'User')
        StudentProfile = apps.get_model('student_area', 'StudentProfile')
        
        migrated_count = 0
        skipped_count = 0
        
        for users_obj in Users.objects.all():
            try:
                # Buscar User do Django pelo email
                user = User.objects.get(email=users_obj.email)
                
                # Criar ou atualizar StudentProfile
                profile, created = StudentProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'idade': users_obj.idade,
                        'cpf': users_obj.cpf,
                    }
                )
                
                if not created:
                    # Atualizar se já existe (mas não sobrescrever se já tem dados)
                    if not profile.idade and users_obj.idade:
                        profile.idade = users_obj.idade
                    if not profile.cpf and users_obj.cpf:
                        profile.cpf = users_obj.cpf
                    profile.save()
                
                migrated_count += 1
            except User.DoesNotExist:
                # User do Django não existe, pular este registro
                skipped_count += 1
                continue
            except Exception as e:
                # Erro ao migrar, continuar com próximo
                print(f"Erro ao migrar Users id={users_obj.id}: {e}")
                skipped_count += 1
                continue
        
        print(f"Migração concluída: {migrated_count} registros migrados, {skipped_count} pulados")
    except Exception as e:
        # Se o modelo Users não existir, não fazer nada (já foi removido)
        print(f"Modelo Users não encontrado ou já removido: {e}")


def reverse_migration(apps, schema_editor):
    """
    Reverter migração (não necessário, mas mantido para compatibilidade)
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('student_area', '0002_studentprofile_cpf_studentprofile_idade'),
        ('users', '0001_initial'),  # Dependência do modelo Users
    ]

    operations = [
        migrations.RunPython(migrate_users_to_student_profile, reverse_migration),
    ]

