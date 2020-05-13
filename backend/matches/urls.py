from django.conf.urls import url

from .views import MatchesApiView

urlpatterns = [
    url(r'$', MatchesApiView.as_view(), name='matches'),
]
