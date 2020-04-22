from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from .models import InvUserSerializer
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from rest_auth.registration.views import SocialLoginView, SocialConnectView

# I think we can delete this?
User = get_user_model()


# Create your views here
class LoginInvUserAPIView(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        result = super().post(request)
        token = Token.objects.get(key=result.data['token'])
        update_last_login(None, token.user)
        print("in normal login")
        return result


# API to create a new Invibe User by email
class CreateInvUserAPIView(CreateAPIView):
    serializer_class = InvUserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        # Token to be used for future auth request validations
        token = Token.objects.create(user=serializer.instance)
        token_data = {"token": token.key}
        return Response(
            {**serializer.data, **token_data},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter

    def post(self, request, *args, **kwargs):
        result = super().post(request)
        token = Token.objects.get(key=result.data['key'])
        print ("in facebook login")
        return result


class FacebookConnect(SocialConnectView):
    adapter_class = FacebookOAuth2Adapter


    def process_login(self):
        super().process_login()
        print("aici")
    

class LogoutInvUserAPIView(APIView):
    queryset = get_user_model().objects.all()
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        # simply delete the token to force a login
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)
