# Django imports...
from django.conf.urls import url

# Local imports...
from .views import UserProfileView

__author__ = 'Jason Parent'

urlpatterns = [
    url(r'user_profile/$', UserProfileView.as_view()),
]
