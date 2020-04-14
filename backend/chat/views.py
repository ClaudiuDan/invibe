import json
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q

from rest_framework.response import Response
from rest_framework import status

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import Message


class GetChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u1 = self.request.query_params.get('receiver')
        u2 = request.user.pk
        query = Message.objects.filter(Q(sender=u1, receiver=u2) | Q(sender=u2, receiver=u1))
        messages = []
        for message in query:
            messages.append(
                {
                    "id": message.pk,
                    "text": message.text,
                    "datetime": message.datetime,
                    "is_seen": message.is_seen,
                    "receiver": message.receiver.pk,
                    "sender": message.sender.pk

                })
        print(messages)
        return Response(json.dumps({"messages": messages}, cls=DjangoJSONEncoder), status=status.HTTP_200_OK)
