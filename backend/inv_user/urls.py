from django.conf.urls import url, include
from inv_user.views import CreateInvUserAPIView, LogoutInvUserAPIView, LoginInvUserAPIView, FacebookLogin, FacebookConnect


urlpatterns = [
    url(r'login/$',
        LoginInvUserAPIView.as_view(),
        name='auth_user_login'),
    url(r'register/$',
        CreateInvUserAPIView.as_view(),
        name='auth_user_create'),
    url(r'logout/$',
        LogoutInvUserAPIView.as_view(),
        name='auth_user_logout'),
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^allauth/', include('allauth.urls')),
    url(r'^rest-auth/facebook/$', FacebookLogin.as_view(), name='fb_login'),
    url(r'^rest-auth/facebook/connect/$', FacebookConnect.as_view(), name='fb_connect')
]
