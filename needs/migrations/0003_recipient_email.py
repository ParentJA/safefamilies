# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-19 21:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('needs', '0002_auto_20160402_2208'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipient',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]