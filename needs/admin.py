# Django imports...
from django.contrib import admin

# Local imports...
from .models import Commitment, Need, Recipient, RecipientNeed


@admin.register(Commitment)
class CommitmentAdmin(admin.ModelAdmin):
    pass


@admin.register(Need)
class Need(admin.ModelAdmin):
    pass


@admin.register(Recipient)
class RecipientAdmin(admin.ModelAdmin):
    pass


@admin.register(RecipientNeed)
class RecipientNeedAdmin(admin.ModelAdmin):
    pass
