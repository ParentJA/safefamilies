# Django imports...
from django.contrib import admin

# Local imports...
from .models import Commitment, Need, Recipient, RecipientNeed


@admin.register(Commitment)
class CommitmentAdmin(admin.ModelAdmin):
    fields = ('user', 'recipient_need', 'status', 'created', 'updated')
    readonly_fields = ('created', 'updated')
    list_display = ('user', 'recipient_need', 'status', 'created', 'updated')
    # raw_id_fields = ('user', 'recipient_need')
    # list_select_related = ('user', 'recipient_need')
    # autocomplete_lookup_fields = {
    #     'fk': ('user', 'recipient_need')
    # }


@admin.register(Need)
class Need(admin.ModelAdmin):
    fields = ('name', 'description')
    list_display = ('name', 'description')


@admin.register(Recipient)
class RecipientAdmin(admin.ModelAdmin):
    fields = ('first_name', 'last_name', 'phone_number', 'email', 'address_1', 'address_2', 'city', 'state', 'zip_code')
    list_display = ('first_name', 'last_name', 'phone_number', 'email', 'address_1', 'address_2', 'city', 'state', 'zip_code')


@admin.register(RecipientNeed)
class RecipientNeedAdmin(admin.ModelAdmin):
    fields = ('recipient', 'need', 'quantity', 'due_date', 'address_1', 'status', 'created', 'updated')
    readonly_fields = ('created', 'updated')
    list_display = ('recipient', 'need', 'quantity', 'due_date', 'address_1', 'status', 'created', 'updated')
    # raw_id_fields = ('recipient', 'need')
    # list_select_related = ('recipient', 'need')
    # autocomplete_lookup_fields = {
    #     'fk': ('recipient', 'need')
    # }
