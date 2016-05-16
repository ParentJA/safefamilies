# Third-party imports...
from rest_framework import serializers

# Local imports...
from .models import Commitment, Need, Recipient, RecipientNeed

__author__ = 'Jason Parent'


class CommitmentSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return Commitment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.user = validated_data.get('user', instance.user)
        instance.recipient_need = validated_data.get('recipient_need', instance.recipient_need)
        instance.status = validated_data.get('status', instance.status)
        instance.save()

        return instance

    class Meta:
        model = Commitment
        fields = ('id', 'user', 'recipient_need', 'status')


class NeedSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return Need.objects.create(**validated_data)

    class Meta:
        model = Need
        fields = ('id', 'name', 'description')


class RecipientSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return Recipient.objects.create(**validated_data)

    class Meta:
        model = Recipient
        fields = ('id', 'first_name', 'last_name', 'address_1')


class RecipientNeedSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return RecipientNeed.objects.create(**validated_data)

    class Meta:
        model = RecipientNeed
        fields = ('id', 'recipient', 'need', 'quantity', 'due_date', 'status')
