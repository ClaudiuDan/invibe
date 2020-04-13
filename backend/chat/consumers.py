import json
from channels.generic.websocket import WebsocketConsumer
from django.utils import timezone

from inv_user.models import User
from .models import Message


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    # Receive message from WebSocket
    def receive(self, data):
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
            'author': self.scope["user"].get_full_name(),
            'text': data['text']
        }

        reply = {
            'type': 'message_echo',
            'recipient': data['receiver'],
            'text': data['text']
        }
        return broadcast, reply
