from django.conf.urls import url

from .views import GetChatAPIView

urlpatterns = [
    url(r'get_chat/$',
        GetChatAPIView.as_view(),
        name='get_chat'),
]
