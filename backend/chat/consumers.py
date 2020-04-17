import json
from django.core.serializers.json import DjangoJSONEncoder

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.utils import timezone
from inv_user.models import User
from rest_framework.authtoken.models import Token
from .models import Message


class ChatConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.receiver = ""

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        if data['type'] == 'handshake':
            self.scope['user'] = Token.objects.get(key=data['token']).user
            self._handshake()

        elif data['type'] == 'message':
            replies = self._message(data)

            # Broadcast - send to receiver
            async_to_sync(self.channel_layer.group_send)(str(data["receiver"]), {
                'type': 'new.message',
                'text': json.dumps(replies[0])
            })

            # Message echo - inform me the message was received by server
            self.send(json.dumps(replies[1]))

        elif data['type'] == 'messages_read':
            self._messages_read(data)

    def new_message(self, message):
        self.send(message['text'])

    def _handshake(self):
        async_to_sync(self.channel_layer.group_add)(str(self.scope["user"].pk), self.channel_name)

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
            'receiver': data['receiver'],
            'text': data['text'],
            'frontend_id': data['frontend_id'],
            'datetime': json.dumps(new_message.datetime, cls=DjangoJSONEncoder),
            'id': new_message.pk,
        }

        reply = {
            'type': 'message_echo',
            'sender': self.scope["user"].pk,
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
        async_to_sync(self.channel_layer.group_discard)(str(self.scope["user"].pk), self.channel_name)
