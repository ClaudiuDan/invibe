from django.conf.urls import url

from .views import ChatAPIView, ChatsAPIView

urlpatterns = [
    url(r'get_chat/$', ChatAPIView.as_view(), name='get_chat'),

    url(r'active_chats/$', ChatsAPIView.as_view(), name='get_chats'),
]
