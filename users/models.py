# Django imports.
from django.conf import settings
from django.db import models

# Third-party imports.
from localflavor.us.models import PhoneNumberField, USStateField, USZipCodeField

__author__ = 'Jason Parent'


class Address(models.Model):
    address_1 = models.CharField(max_length=255, blank=True, null=True)
    address_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = USStateField(blank=True, null=True)
    zip_code = USZipCodeField(blank=True, null=True)

    class Meta:
        abstract = True


class UserProfile(Address):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, primary_key=True)
    photo = models.ImageField(upload_to='photos', default='photos/no-image.jpg', blank=True, null=True)
    phone_number = PhoneNumberField(blank=True, null=True)

    def __unicode__(self):
        return self.user.username
