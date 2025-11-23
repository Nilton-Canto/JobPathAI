# Migration to remove old cadastro_cadastro table if it exists

from django.db import migrations


def remove_cadastro_table_if_exists(apps, schema_editor):
    """
    Remove cadastro_cadastro table if it exists
    This is an old table from when the app was called 'cadastro'
    """
    from django.db import connection
    
    with connection.cursor() as cursor:
        # Check if table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='cadastro_cadastro'
        """)
        
        result = cursor.fetchone()
        if result:
            # Check if table has data
            cursor.execute("SELECT COUNT(*) FROM cadastro_cadastro")
            count = cursor.fetchone()[0]
            
            if count == 0:
                # Table is empty, safe to remove
                cursor.execute("DROP TABLE IF EXISTS cadastro_cadastro")
                print(f"Tabela cadastro_cadastro removida (estava vazia)")
            else:
                print(f"ATENÇÃO: Tabela cadastro_cadastro tem {count} registros. Não foi removida automaticamente.")
                print("Verifique manualmente se os dados são necessários antes de remover.")
        else:
            print("Tabela cadastro_cadastro não existe")


def reverse_migration(apps, schema_editor):
    """Reverse migration - não faz nada"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_remove_users_table'),
    ]

    operations = [
        migrations.RunPython(remove_cadastro_table_if_exists, reverse_migration),
    ]

