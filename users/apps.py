# Django imports.
from django.apps import AppConfig

__author__ = 'Jason Parent'


class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        import users.signals
