# Django imports.
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import TemplateView

__author__ = 'Jason Parent'

urlpatterns = [
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^api/v1/accounts/', include('accounts.urls', namespace='accounts')),
    url(r'^api/v1/users/', include('users.urls', namespace='users')),
    url(r'^api/v1/needs/', include('needs.urls', namespace='needs')),
    url(r'^$', TemplateView.as_view(template_name='index.html')),
]

# Serves media files in development environment.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
