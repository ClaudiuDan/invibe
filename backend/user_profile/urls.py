from django.conf.urls import url

from .views import UserProfileChatApiView

urlpatterns = [
    url(r'$', UserProfileChatApiView.as_view(), name='profile'),
]
