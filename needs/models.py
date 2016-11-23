# Django imports.
from django.conf import settings
from django.db import models

# Third-party imports.
from localflavor.us.models import PhoneNumberField

# Local imports.
from users.models import Address

__author__ = 'Jason Parent'


class Need(models.Model):
    """An item that a person is requesting."""

    name = models.CharField(max_length=255)

    description = models.TextField()

    class Meta(object):
        app_label = 'needs'
        default_related_name = 'needs'

    def __unicode__(self):
        return self.name

    @staticmethod
    def autocomplete_search_fields():
        return ['name__icontains']


class Recipient(Address):
    """A person is in need of an item."""

    first_name = models.CharField(max_length=255)

    last_name = models.CharField(max_length=255)

    phone_number = PhoneNumberField(blank=True, null=True)

    email = models.EmailField(null=True, blank=True)

    needs = models.ManyToManyField('needs.Need', through='needs.RecipientNeed', through_fields=('recipient', 'need'))

    def get_full_name(self):
        return '{} {}'.format(self.first_name, self.last_name)

    class Meta(object):
        app_label = 'needs'
        default_related_name = 'recipients'

    def __unicode__(self):
        return self.get_full_name()

    @staticmethod
    def autocomplete_search_fields():
        return ['first_name__icontains', 'last_name__icontains']


class RecipientNeed(models.Model):
    """A conjunction between a person in need and the item that they need."""

    REQUESTED = 'REQ'
    PENDING = 'PEN'
    RECEIVED = 'REC'

    RECIPIENT_NEED_STATUSES = (
        (REQUESTED, 'requested'),
        (PENDING, 'pending'),
        (RECEIVED, 'received'),
    )

    recipient = models.ForeignKey('needs.Recipient')

    need = models.ForeignKey('needs.Need')

    quantity = models.IntegerField()

    due_date = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=3, choices=RECIPIENT_NEED_STATUSES, default=REQUESTED)

    created = models.DateTimeField(auto_now_add=True, editable=False)

    updated = models.DateTimeField(auto_now=True)

    class Meta(object):
        app_label = 'needs'
        default_related_name = 'recipient_needs'

    def __unicode__(self):
        return '{recipient}-{need}'.format(recipient=self.recipient.get_full_name(), need=self.need.name)

    @staticmethod
    def autocomplete_search_fields():
        return ['recipient__first_name__icontains', 'recipient__last_name__icontains']


class Commitment(models.Model):
    """A promise to fulfill a need."""

    ASSIGNED = 'A'
    FINISHED = 'F'

    COMMITMENT_STATUSES = (
        (ASSIGNED, 'assigned'),
        (FINISHED, 'finished'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL)

    recipient_need = models.ForeignKey('needs.RecipientNeed')

    status = models.CharField(max_length=1, choices=COMMITMENT_STATUSES, default=ASSIGNED)

    created = models.DateTimeField(auto_now_add=True, editable=False)

    updated = models.DateTimeField(auto_now=True)

    class Meta(object):
        app_label = 'needs'
        default_related_name = 'commitments'

    def __unicode__(self):
        return '{user}-{recipient_need}'.format(user=self.user.get_full_name(), recipient_need=self.recipient_need)

    @staticmethod
    def autocomplete_search_fields():
        return ['user__first_name__icontains', 'user__last_name__icontains', 'user__email__icontains']
