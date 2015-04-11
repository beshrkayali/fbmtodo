# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='TodoItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('priority', models.IntegerField(default=1, choices=[(1, b'Low'), (2, b'Medium'), (3, b'High'), (4, b'Super high')])),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('lastedit', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='TodoList',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=256)),
                ('desc', models.TextField()),
                ('owner', models.ForeignKey(related_name='todolists', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='todoitem',
            name='todolist',
            field=models.ForeignKey(related_name='todos', to='todo.TodoList'),
        ),
        migrations.AddField(
            model_name='todoitem',
            name='user',
            field=models.ForeignKey(related_name='todos', to=settings.AUTH_USER_MODEL),
        ),
    ]
