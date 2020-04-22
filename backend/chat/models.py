from django.db import models
from django.utils.translation import gettext_lazy as _
from inv_user.models import User
from django.utils import timezone
from django_unixdatetimefield import UnixDateTimeField


# Create your models here.


class Message(models.Model):
    text = models.CharField(_('Text'),
                            max_length=1000,
                            null=False,
                            blank=False)
    created_timestamp = UnixDateTimeField()
    server_received_datetime = models.DateTimeField(_('message was received by server at date time'),
                                                    default=timezone.now)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_receiver')
    is_seen = models.BooleanField(_('Was Message Seen'),
                                  default=False)

    def __str__(self):
        return self.text

    class Meta:
        db_table = 'messages'
        constraints = [
            models.UniqueConstraint(fields=['sender', 'created_timestamp'], name='unique_message')
        ]


class Chat(models.Model):
    last_msg_datetime = models.DateTimeField(_('chat\'s last message date time'), default=timezone.now)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_owner')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_receiver')

    class Meta:
        db_table = 'chats'
        constraints = [
            models.UniqueConstraint(fields=['owner', 'receiver'], name='unique_chat')
        ]
