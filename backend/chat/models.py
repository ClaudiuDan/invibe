from enum import Enum
from django.db import models
from django.utils.translation import gettext_lazy as _
from inv_user.models import User
from django.utils import timezone


class MessageTypes(Enum):
    TEXT_MESSAGE = "text_message"
    IMAGE_MESSAGE = "image_message"


class Message(models.Model):
    created_timestamp = models.BigIntegerField()
    server_received_datetime = models.DateTimeField(_('message was received by server at date time'),
                                                    default=timezone.now)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_receiver')
    is_seen = models.BooleanField(_('Was Message Seen'),
                                  default=False)
    message_type = models.CharField(
        max_length=30,
        choices=[(member.value, member.value) for member in MessageTypes]
    )

    def __str__(self):
        return self.text

    class Meta:
        db_table = 'chat_messages_data'
        constraints = [
            models.UniqueConstraint(fields=['sender', 'created_timestamp'], name='unique_message')
        ]


class TextMessage(models.Model):
    messageData = models.OneToOneField(
        Message,
        on_delete=models.CASCADE,
        primary_key=True,
    )
    text = models.CharField(_('Text'),
                            max_length=1000,
                            null=False,
                            blank=False)

    class Meta:
        db_table = 'chat_text_messages'


class Chat(models.Model):
    last_msg_datetime = models.DateTimeField(_('chat\'s last message date time'), default=timezone.now)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_owner')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_receiver')

    class Meta:
        db_table = 'chats'
        constraints = [
            models.UniqueConstraint(fields=['owner', 'receiver'], name='unique_chat')
        ]
