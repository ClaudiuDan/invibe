import json
from django.core.serializers.json import DjangoJSONEncoder

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.utils import timezone
from inv_user.models import User
from rest_framework.authtoken.models import Token
from .models import Message


def group_name(u1, u2):
    return "u1-" + str(u1) + "u2-" + str(u2)


class ChatConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.receiver = ""

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        if data['type'] == 'handshake':
            self.scope['user'] = Token.objects.get(key=data['token']).user
            self._handshake(data)

        elif data['type'] == 'message':
            replies = self._message(data)

            async_to_sync(self.channel_layer.group_send)(group_name(data["receiver"], self.scope["user"].pk), {
                'type': 'new.message',
                'text': json.dumps(replies[0])
            })

            self.send(json.dumps(replies[1]))

        elif data['type'] == 'messages_read':
            self._messages_read(data)

    def new_message(self, message):
        self.send(message['text'])

    def _handshake(self, data):
        self.receiver = data["receiver"]
        print(group_name(self.scope["user"].pk, data["receiver"]))
        async_to_sync(self.channel_layer.group_add)(group_name(self.scope["user"].pk, data["receiver"]),
                                                    self.channel_name)

    def _message(self, data):

        new_message = Message.objects.create(
            text=data['text'],
            datetime=timezone.now(),
            sender=self.scope["user"],
            receiver=User.objects.get(pk=data['receiver'])
        )
        new_message.save()

        print(data['text'])

        broadcast = {
            'type': 'new_message',
            'sender': self.scope["user"].pk,
            'text': data['text'],
            'frontend_id': data['frontend_id'],
            'datetime': json.dumps(new_message.datetime, cls=DjangoJSONEncoder),
            'id': new_message.pk,
        }

        reply = {
            'type': 'message_echo',
            'receiver': data['receiver'],
            'text': data['text'],
            'frontend_id': data['frontend_id'],
            'datetime': json.dumps(new_message.datetime, cls=DjangoJSONEncoder),
            'id': new_message.pk,
        }
        return broadcast, reply

    def _messages_read(self, data):
        sender = self.scope["user"].pk
        receiver = data['receiver']

        query = Message.objects.filter(sender=sender, receiver=receiver)
        for message in query:
            message.read = True
            message.save()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(group_name(self.scope["user"].pk, self.receiver),
                                                        self.channel_name)
