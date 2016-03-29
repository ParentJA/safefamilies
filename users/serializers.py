# Third-party imports...
from rest_framework import serializers

__author__ = 'Jason Parent'


class UserProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    photo = serializers.ImageField()
