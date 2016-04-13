# Django imports...
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import TemplateView

__author__ = 'Jason Parent'

MEDIA_ROOT = getattr(settings, 'MEDIA_ROOT')
MEDIA_URL = getattr(settings, 'MEDIA_URL')

urlpatterns = [
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^api/v1/accounts/', include('accounts.urls')),
    url(r'^api/v1/users/', include('users.urls')),
    url(r'^api/v1/needs/', include('needs.urls')),
    url(r'^$', TemplateView.as_view(template_name='index.html')),
]

# Serves media files in development environment.
urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)
