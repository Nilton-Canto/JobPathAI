# Generated migration to migrate area data from CharField to ForeignKey

from django.db import migrations


def migrate_area_data(apps, schema_editor):
    """
    Migrate area data: Create Area objects for existing area choices
    This ensures all standard areas exist in the database
    """
    Area = apps.get_model('career', 'Area')
    
    # Old area choices - create these as Area objects
    AREA_CHOICES = [
        ('Tecnologia', 'Tecnologia'),
        ('Design', 'Design'),
        ('Negócios', 'Negócios'),
        ('Dados', 'Dados'),
        ('Marketing', 'Marketing'),
        ('Vendas', 'Vendas'),
        ('Recursos Humanos', 'Recursos Humanos'),
        ('Finanças', 'Finanças'),
        ('Outras', 'Outras'),
    ]
    
    # Create Area objects for each choice if they don't exist
    for area_value, area_label in AREA_CHOICES:
        Area.objects.get_or_create(
            name=area_label,
            defaults={
                'description': f'Área profissional: {area_label}',
                'is_active': True
            }
        )


def reverse_migrate_area_data(apps, schema_editor):
    """
    Reverse migration - remove Area objects (optional, can be left empty)
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('career', '0004_create_area_model_and_migrate_careerpath'),
    ]

    operations = [
        migrations.RunPython(migrate_area_data, reverse_migrate_area_data),
    ]

