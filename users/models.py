# Django imports...
from django.conf import settings
from django.db import models

__author__ = 'Jason Parent'

AUTH_USER_MODEL = getattr(settings, 'AUTH_USER_MODEL')


class UserProfile(models.Model):
    user = models.OneToOneField(AUTH_USER_MODEL)
    photo = models.ImageField(upload_to='photos', default='photos/no-image.jpg', blank=True, null=True)

    def __unicode__(self):
        return self.user.username