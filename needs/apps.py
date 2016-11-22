# Django imports.
from django.apps import AppConfig

__author__ = 'Jason Parent'


class NeedsConfig(AppConfig):
    name = 'needs'

    def ready(self):
        pass
