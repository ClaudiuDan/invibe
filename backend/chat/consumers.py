import json
from datetime import datetime

from django.core.serializers.json import DjangoJSONEncoder

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.db.models import Q
from django.db import IntegrityError
from inv_user.models import User
from rest_framework.authtoken.models import Token

from .views import get_message_dictionary_from_message
from .models import Message, Chat, TextMessage, MessageTypes, ImageMessage, decode_base64_to_image_field


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

                resp = get_message_dictionary_from_message(message)
                resp['type'] = 'message_echo'

                self.send(json.dumps(resp, cls=DjangoJSONEncoder))

        elif data['type'] == 'messages_read':
            self._messages_read(data)

        elif data['type'] == '__ping__':
            self.send(json.dumps({'type': '__pong__'}))


    def new_message(self, message):
        print ("\n \n in new message ", message['text'], "\n\n")
        self.send(message['text'])

    def messages_read(self, message):
        self.send(message['text'])

    def _handshake(self):
        async_to_sync(self.channel_layer.group_add)(str(self.scope["user"].pk), self.channel_name)

    def _message(self, data):
        receiver = User.objects.get(pk=data['receiver'])

        # Save message data(not message type dependent)
        try:
            message_type = MessageTypes(data['message_type'])
        except:
            raise ValueError('message_type not supported')

        new_message = Message.objects.create(
            created_timestamp=data['created_timestamp'],
            sender=self.scope["user"],
            receiver=receiver,
            message_type=message_type.value
        )

        response_dic = {
            'message_type': message_type.value,
            'sender': self.scope["user"].pk,
            'receiver': data['receiver'],
            'created_timestamp': new_message.created_timestamp,
            'datetime': json.dumps(new_message.server_received_datetime, cls=DjangoJSONEncoder),
            'id': new_message.pk,
            'seen': new_message.is_seen,
        }

        # Save type specific message data
        if message_type == MessageTypes.TEXT_MESSAGE:

            specific_new_message = TextMessage.objects.create(messageData=new_message, text=data['text'])
            response_dic['text'] = data['text']

        elif message_type == MessageTypes.IMAGE_MESSAGE:

            specific_new_message = ImageMessage.objects.create(
                messageData=new_message,
                image=decode_base64_to_image_field(data['base64_content'], data['image_extension'], new_message.pk),
                image_extension=data['image_extension']
            )

            response_dic['base64_content'] = data['base64_content']
            response_dic['image_extension'] = data['image_extension']

        else:
            raise ValueError('message_type not supported')

        new_message.save()
        specific_new_message.save()

        # Update last message datetime for chats related to this message
        Chat.objects \
            .filter(Q(owner=self.scope["user"], receiver=receiver) | Q(owner=receiver, receiver=self.scope["user"])) \
            .update(last_msg_datetime=new_message.server_received_datetime)

        # Finalise responses
        broadcast = response_dic.copy()  # The response sent to the receiver
        broadcast['type'] = 'new_message'

        reply = response_dic.copy()  # The response sent back to the owner
        reply['type'] = 'message_echo'

        return broadcast, reply

    def _messages_read(self, data):
        sender = str(data["sender"])
        receiver = self.scope["user"].pk

        query = Message.objects.filter(is_seen=False, sender=sender, receiver=receiver,
                                       created_timestamp__lte=data["created_timestamp"])
        for message in query:
            message.is_seen = True
            message.save()

        resp = {
            'type': 'messages_read',
            'receiver': receiver,
            'up_to_created_timestamp': data["created_timestamp"]
        }

        async_to_sync(self.channel_layer.group_send)(sender, {
            'type': 'messages.read',
            'text': json.dumps(resp, cls=DjangoJSONEncoder)
        })

        resp['type'] = 'messages_read_echo'
        resp['receiver'] = sender
        self.send(json.dumps(resp, cls=DjangoJSONEncoder))

    def disconnect(self, close_code):
        print ("\n in disconnect func\n")
        async_to_sync(self.channel_layer.group_discard)(str(self.scope["user"].pk), self.channel_name)
