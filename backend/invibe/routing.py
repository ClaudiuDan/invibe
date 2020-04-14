from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import chat.routing
from channels.sessions import CookieMiddleware, SessionMiddleware

CookieMiddlewareStack = lambda inner: CookieMiddleware(
    SessionMiddleware(inner)
)

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': CookieMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
