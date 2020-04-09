from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from .forms import LoginForm, RegisterForm
from .models import InvUserSerializer
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken

User = get_user_model()

# Create your views here
class LoginInvUserAPIView(ObtainAuthToken):

    def post(self, request):
        result = super().post(request)
        token = Token.objects.get(key=result.data['token'])
        update_last_login(None, token.user)
        return result

# API to create a new Invibe User by email
class CreateInvUserAPIView(CreateAPIView):
    serializer_class = InvUserSerializer
    permission_classes = [AllowAny]

    def create(self, request):
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

class LogoutInvUserAPIView(APIView):
    queryset = get_user_model().objects.all()
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # simply delete the token to force a login
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)
