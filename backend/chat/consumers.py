import json
from datetime import datetime

from django.core.serializers.json import DjangoJSONEncoder

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.utils import timezone
from django.db.models import Q
from django.db import IntegrityError
from inv_user.models import User
from rest_framework.authtoken.models import Token
from .models import Message, Chat


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
            try:
                replies = self._message(data)

                # Broadcast - send to receiver
                async_to_sync(self.channel_layer.group_send)(str(data["receiver"]), {
                    'type': 'new.message',
                    'text': json.dumps(replies[0])
                })

                # Message echo - inform me the message was received by server
                self.send(json.dumps(replies[1]))

            except IntegrityError as e:
                # Message already in the db, just return the message information
                print(e)
                message = Message.objects.filter(
                    Q(sender=self.scope["user"], created_timestamp=data['created_timestamp'])).first()

                self.send(json.dumps({
                    'type': 'message_echo',
                    'sender': self.scope["user"].pk,
                    'receiver': data['receiver'],
                    'text': data['text'],
                    'created_timestamp': data['created_timestamp'],
                    'datetime': json.dumps(message.server_received_datetime, cls=DjangoJSONEncoder),
                    'id': message.pk,
                }))

        elif data['type'] == 'messages_read':
            self._messages_read(data)

        elif data['type'] == '__ping__':
            self.send(json.dumps({'type': '__pong__'}))

    def new_message(self, message):
        self.send(message['text'])

    def _handshake(self):
        async_to_sync(self.channel_layer.group_add)(str(self.scope["user"].pk), self.channel_name)

    def _message(self, data):
        receiver = User.objects.get(pk=data['receiver'])

        new_message = Message.objects.create(
            text=data['text'],
            created_timestamp=data['created_timestamp'],
            sender=self.scope["user"],
            receiver=receiver
        )
        new_message.save()

        Chat.objects \
            .filter(Q(owner=self.scope["user"], receiver=receiver) | Q(owner=receiver, receiver=self.scope["user"])) \
            .update(last_msg_datetime=new_message.server_received_datetime)

        broadcast = {
            'type': 'new_message',
            'sender': self.scope["user"].pk,
            'receiver': data['receiver'],
            'text': data['text'],
            'created_timestamp': new_message.created_timestamp,
            'datetime': json.dumps(new_message.server_received_datetime, cls=DjangoJSONEncoder),
            'id': new_message.pk,
        }

        reply = {
            'type': 'message_echo',
            'sender': self.scope["user"].pk,
            'receiver': data['receiver'],
            'text': data['text'],
            'created_timestamp': new_message.created_timestamp,
            'datetime': json.dumps(new_message.server_received_datetime, cls=DjangoJSONEncoder),
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
