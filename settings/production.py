# Local imports.
from .base import *

DEBUG = False

ALLOWED_HOSTS = ['dc127resources.org']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, '../database/db.sqlite3'),
    }
}

STATIC_ROOT = os.path.abspath(os.path.join(BASE_DIR, '../static'))

MEDIA_ROOT = os.path.abspath(os.path.join(BASE_DIR, '../media'))
