from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('alba_security_app', '0013_connection_connectionvulnerability'),
    ]

    operations = [
        migrations.AlterField(
            model_name='connection',
            name='first_device',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='firstdevice', to='alba_security_app.device'),
        ),
        migrations.AlterField(
            model_name='connection',
            name='second_device',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seconddevice', to='alba_security_app.device'),
        ),
    ]
