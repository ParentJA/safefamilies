# Third-party imports...
from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

# Local imports...
from .models import UserProfile
from .serializers import UserProfileSerializer

__author__ = 'Jason Parent'


def get_user_profile(user):
    return UserProfile.objects.select_related('user').get(user=user)


class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_profile = get_user_profile(request.user)
        return Response(status=HTTP_200_OK, data=UserProfileSerializer(user_profile).data)
