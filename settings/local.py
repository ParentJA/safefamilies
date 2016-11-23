# Local imports.
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

THIRD_PARTY_APPS = [
    'accounts',
    'lettuce.django',
    'localflavor',
    'rest_framework',
]

INSTALLED_APPS = ['grappelli'] + DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

LETTUCE_USE_TEST_DATABASE = True
