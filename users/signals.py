# Django imports.
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save

# Local imports.
from .models import UserProfile

__author__ = 'Jason Parent'

User = get_user_model()


def create_user_profile(sender, created, instance, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)
