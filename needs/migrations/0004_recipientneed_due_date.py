# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-10 16:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('needs', '0003_recipient_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipientneed',
            name='due_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
