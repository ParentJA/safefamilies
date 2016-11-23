# Django imports.
from django.contrib import admin

# Local imports.
from .models import Commitment, Need, Recipient, RecipientNeed

__author__ = 'Jason Parent'


class RecipientNeedInline(admin.TabularInline):
    autocomplete_lookup_fields = {
        'fk': ('need',)
    }
    extra = 0
    fields = ('need', 'quantity', 'due_date', 'status', 'created', 'updated',)
    list_select_related = ('need',)
    model = RecipientNeed
    raw_id_fields = ('need',)
    readonly_fields = ('created', 'updated',)


@admin.register(Recipient)
class RecipientAdmin(admin.ModelAdmin):
    fields = ('first_name', 'last_name', 'phone_number', 'email', 'address_1', 'address_2', 'city', 'state',
              'zip_code',)
    inlines = (RecipientNeedInline,)
    list_display = ('first_name', 'last_name', 'phone_number', 'email', 'address_1', 'address_2', 'city', 'state',
                    'zip_code',)


@admin.register(Need)
class Need(admin.ModelAdmin):
    fields = ('name', 'description',)
    list_display = ('name', 'description',)


@admin.register(RecipientNeed)
class RecipientNeedAdmin(admin.ModelAdmin):
    autocomplete_lookup_fields = {
        'fk': ('recipient', 'need',)
    }
    fields = ('recipient', 'need', 'quantity', 'due_date', 'status', 'created', 'updated',)
    list_display = ('recipient', 'need', 'quantity', 'due_date', 'status', 'created', 'updated',)
    list_select_related = ('recipient', 'need',)
    raw_id_fields = ('recipient', 'need',)
    readonly_fields = ('created', 'updated',)


@admin.register(Commitment)
class CommitmentAdmin(admin.ModelAdmin):
    autocomplete_lookup_fields = {
        'fk': ('user', 'recipient_need',)
    }
    fields = ('user', 'recipient_need', 'status', 'created', 'updated',)
    list_display = ('user', 'recipient_need', 'status', 'created', 'updated',)
    list_select_related = ('user', 'recipient_need',)
    raw_id_fields = ('user', 'recipient_need',)
    readonly_fields = ('created', 'updated',)
