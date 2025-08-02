"""VCiews For the user API"""

from rest_framework import generics, authentication, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings


from user.serializers import (UserSerializer, AuthTokenSerializer)

from drf_spectacular.utils import extend_schema


@extend_schema(tags=['Users'])
class CreateUserView(generics.CreateAPIView):
    """Create a new user in the system"""
    serializer_class = UserSerializer


@extend_schema(tags=['Users'])
class CreateTokenView(ObtainAuthToken):
    """create a new auth token for user"""
    serializer_class = AuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES


@extend_schema(tags=['Users'])
class ManageUserView(generics.RetrieveUpdateAPIView):
    """manage authenticated user"""
    serializer_class = UserSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """retrive and retrun the authenticated user"""
        return self.request.user
