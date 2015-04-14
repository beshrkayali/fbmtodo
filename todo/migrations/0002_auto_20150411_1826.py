# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='todoitem',
            old_name='user',
            new_name='owner',
        ),
        migrations.AlterField(
            model_name='todoitem',
            name='priority',
            field=models.IntegerField(default=1, choices=[(1, b'Low'), (2, b'Medium'), (3, b'High')]),
        ),
    ]
