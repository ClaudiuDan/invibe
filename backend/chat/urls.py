from django.conf.urls import url

from .views import ChatAPIView, ChatsAPIView, ChatImageAPIView

urlpatterns = [
    url(r'get_chat/$', ChatAPIView.as_view(), name='get_chat'),
    url(r'get_message_image/$', ChatImageAPIView.as_view(), name='get_message_image'),
    url(r'active_chats/$', ChatsAPIView.as_view(), name='get_chats'),
]
