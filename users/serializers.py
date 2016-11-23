# Django imports.
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import RegexValidator

# Third-party imports.
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

# Local imports.
from .models import UserProfile

__author__ = 'Jason Parent'

zip_code_validator = RegexValidator(r'^\d{5}(?:-\d{4})?$')


def validate_zip_code(value):
    return zip_code_validator(value)

phone_number_validator = RegexValidator(r'^(?:1-?)?(\d{3})[-.]?(\d{3})[-.]?(\d{4})$')


def validate_phone_number(value):
    return phone_number_validator(value)


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta(object):
        model = UserProfile
        fields = ('first_name', 'last_name', 'email', 'photo', 'address_1', 'address_2', 'city', 'state', 'zip_code',
                  'phone_number',)

    def update(self, instance, validated_data):
        instance.photo = validated_data.get('photo', instance.photo)
        instance.address_1 = validated_data.get('address_1', instance.address_1)
        instance.address_2 = validated_data.get('address_2', instance.address_2)
        instance.city = validated_data.get('city', instance.city)
        instance.state = validated_data.get('state', instance.state)
        instance.zip_code = validated_data.get('zip_code', instance.zip_code)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        return instance

    def validate_zip_code(self, value):
        if value:
            try:
                validate_zip_code(value)
            except DjangoValidationError:
                raise ValidationError('Not a valid zip code.')

        return value

    def validate_phone_number(self, value):
        if value:
            try:
                validate_phone_number(value)
            except DjangoValidationError:
                raise ValidationError('Not a valid phone number.')

        return value
