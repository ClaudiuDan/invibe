from django.conf.urls import url
from inv_user.views import CreateInvUserAPIView, LogoutInvUserAPIView, LoginInvUserAPIView


urlpatterns = [
    url(r'login/$',
        LoginInvUserAPIView.as_view(),
        name='auth_user_login'),
    url(r'register/$',
        CreateInvUserAPIView.as_view(),
        name='auth_user_create'),
    url(r'logout/$',
        LogoutInvUserAPIView.as_view(),
        name='auth_user_logout')
]
