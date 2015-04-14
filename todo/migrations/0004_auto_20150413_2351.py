# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0003_todoitem_done'),
    ]

    operations = [
        migrations.AlterField(
            model_name='todolist',
            name='desc',
            field=models.TextField(null=True, blank=True),
        ),
    ]
