"""
App configuration for config project
"""

from django.apps import AppConfig


class ConfigConfig(AppConfig):
    """
    Configuration for the config app.
    Customizes Django Admin when apps are ready.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'config'

    def ready(self):
        """
        Called when Django has finished loading all apps.
        This is the right place to customize admin site.
        """
        # Import here to avoid AppRegistryNotReady error
        from django.contrib import admin
        from django.conf import settings
        
        # Customize admin site using settings
        admin.site.site_header = getattr(settings, 'ADMIN_SITE_HEADER', "JobPathAI - Administração")
        admin.site.site_title = getattr(settings, 'ADMIN_SITE_TITLE', "JobPathAI Admin")
        admin.site.index_title = getattr(settings, 'ADMIN_INDEX_TITLE', "Painel de Administração")


