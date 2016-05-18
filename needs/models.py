# Third-party imports...
from localflavor.us.models import PhoneNumberField

# Django imports...
from django.conf import settings
from django.db import models

# Local imports...
from users.models import Address


class Need(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __unicode__(self):
        return self.name


class Recipient(Address):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = PhoneNumberField(blank=True, null=True)
    email = models.EmailField(null=True, blank=True)
    needs = models.ManyToManyField(
        'needs.Need',
        through='needs.RecipientNeed',
        through_fields=('recipient', 'need'),
        related_name='recipients'
    )

    def get_full_name(self):
        return '{} {}'.format(self.first_name, self.last_name)

    def __unicode__(self):
        return self.get_full_name()


class RecipientNeed(models.Model):
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
    due_date = models.DateTimeField(null = True, blank = True)
    # 05/18 AK added next line
    address_1 = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=3, choices=RECIPIENT_NEED_STATUSES, default=REQUESTED)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    updated = models.DateTimeField(auto_now=True)\

    @staticmethod
    def autocomplete_search_fields():
        return ['recipient__first_name__icontains', 'recipient__last_name__icontains']

    def __unicode__(self):
        return '{recipient} {status} {quantity} {need}'.format(
            recipient=self.recipient.get_full_name(),
            status=self.get_status_display(),
            quantity=self.quantity,
            need=self.need.name
        )


class Commitment(models.Model):
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

    class Meta:
        default_related_name = 'commitments'

    def __unicode__(self):
        return '{user} {status} {quantity} {need} for {recipient}'.format(
            user=self.user.get_full_name(),
            status=self.get_status_display(),
            quantity=self.recipient_need.quantity,
            need=self.recipient_need.need,
            recipient=self.recipient_need.recipient
        )
