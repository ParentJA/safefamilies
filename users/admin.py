# Django imports.
from django.contrib import admin

# Local imports.
from .models import UserProfile

__author__ = 'Jason Parent'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    fields = ('user', 'photo', 'phone_number', 'address_1', 'address_2', 'city', 'state', 'zip_code')
    list_display = ('user', 'photo', 'phone_number', 'address_1', 'address_2', 'city', 'state', 'zip_code')
    raw_id_fields = ('user',)
    list_select_related = ('user',)
    autocomplete_lookup_fields = {
        'fk': ('user',)
    }
