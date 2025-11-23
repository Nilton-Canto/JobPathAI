# Migration to manually remove users_users table if it still exists
# This is a safety migration in case the table wasn't removed by 0002_delete_users

from django.db import migrations


def remove_users_table_if_exists(apps, schema_editor):
    """
    Remove users_users table if it still exists
    This is a safety measure in case the table wasn't properly removed
    """
    from django.db import connection
    
    with connection.cursor() as cursor:
        # Check if table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='users_users'
        """)
        
        if cursor.fetchone():
            # Table exists, drop it
            cursor.execute("DROP TABLE IF EXISTS users_users")
            print("Tabela users_users removida com sucesso")


def reverse_migration(apps, schema_editor):
    """Reverse migration - não faz nada"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_delete_users'),
    ]

    operations = [
        migrations.RunPython(remove_users_table_if_exists, reverse_migration),
    ]

