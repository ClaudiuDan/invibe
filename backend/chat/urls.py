from django.conf.urls import url

from .views import GetChatAPIView, GetChatsAPIView

urlpatterns = [
    url(r'get_chat/$',
        GetChatAPIView.as_view(),
        name='get_chat'),
    url(r'active_chats/$',
        GetChatsAPIView.as_view(),
        name='get_chats'),
]
