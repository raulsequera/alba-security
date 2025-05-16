from django.apps import AppConfig

class albaAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'alba_security_app'

    def ready(self):
        import alba_security_app.signals