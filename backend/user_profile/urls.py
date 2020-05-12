from django.conf.urls import url

from .views import UserProfileApiView, AlbumImagesApiView, DiscoverUserProfilesApiView

urlpatterns = [
    url(r'album_images/$', AlbumImagesApiView.as_view(), name='album_images'),
    url(r'discover_profiles/$', DiscoverUserProfilesApiView.as_view(), name='discover_profiles'),
    url(r'$', UserProfileApiView.as_view(), name='profile'),
]
