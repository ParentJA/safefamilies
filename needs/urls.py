# Django imports...
from django.conf.urls import url

# Local imports...
from .views import CommitmentView, NeedView, RecipientView, RecipientNeedView

__author__ = 'Jason Parent'

urlpatterns = [
    url(r'^commitment/$', CommitmentView.as_view({
        'get': 'list',
        'post': 'create'
    })),
    url(r'^commitment/(?P<pk>\d+)/$', CommitmentView.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    })),
    url(r'^need/$', NeedView.as_view()),
    url(r'^recipient/$', RecipientView.as_view()),
    url(r'^recipient_need/$', RecipientNeedView.as_view()),
]
