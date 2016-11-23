# Django imports.
from django.contrib.auth import password_validation, authenticate, login
from django.forms import ValidationError

# Third-party imports.
from rest_framework import views
from rest_framework.exceptions import APIException
from rest_framework.generics import get_object_or_404, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Local imports.
from .models import UserProfile
from .serializers import UserProfileSerializer

__author__ = 'Jason Parent'


class UserProfileView(RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(UserProfile.objects.select_related('user'), user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        user_profile = self.get_object()
        return Response(self.serializer_class(user_profile).data)

    def update(self, request, *args, **kwargs):
        # Update user data.
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()

        # Update user profile data.
        user_profile = self.get_object()
        serializer = self.serializer_class(user_profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user_profile = serializer.save()

        return Response(self.serializer_class(user_profile).data)


class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Check request data.
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            raise APIException(detail='You must provide both the old password and the new password.')

        if not user.check_password(old_password):
            raise APIException(detail='The old password is not correct.')

        try:
            password_validation.validate_password(new_password)
        except ValidationError:
            raise APIException(detail='The new password is not valid.')

        # Update the user's password.
        user.set_password(new_password)
        user.save()

        # Log in user with new password.
        user = authenticate(username=user.username, password=new_password)

        if user is not None and user.is_active:
            login(request, user)

        return Response()
