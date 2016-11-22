# Third-party imports.
from rest_framework import serializers

# Local imports.
from .models import UserProfile

__author__ = 'Jason Parent'


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    def update(self, instance, validated_data):
        instance.photo = validated_data.get('photo', instance.photo)
        instance.address_1 = validated_data.get('address_1', instance.address_1)
        instance.address_2 = validated_data.get('address_2', instance.address_2)
        instance.city = validated_data.get('city', instance.city)
        instance.state = validated_data.get('state', instance.state)
        instance.zip_code = validated_data.get('zip_code', instance.zip_code)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.save()
        return instance

    class Meta:
        model = UserProfile
        fields = ('first_name', 'last_name', 'email', 'photo', 'address_1', 'address_2', 'city', 'state', 'zip_code',
                  'phone_number')
