# Django imports.
from django.conf.urls import url

# Local imports.
from .views import UserProfileView, ChangePasswordView

__author__ = 'Jason Parent'

urlpatterns = [
    url(r'user_profile/$', UserProfileView.as_view(), name='profile_retrieve_update'),
    url(r'change_password/$', ChangePasswordView.as_view(), name='change_password'),
]
