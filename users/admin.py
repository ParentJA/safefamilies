# Django imports...
from django.contrib import admin

# Local imports...
from .models import UserProfile

__author__ = 'Jason Parent'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    pass
