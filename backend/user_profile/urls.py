from django.conf.urls import url

from .views import UserProfileChatApiView, AlbumImagesApiView

urlpatterns = [
    url(r'album_images/$', AlbumImagesApiView.as_view(), name='album_images'),
    url(r'$', UserProfileChatApiView.as_view(), name='profile'),
]
