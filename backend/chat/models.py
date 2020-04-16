from django.db import models
from django.utils.translation import gettext_lazy as _
from inv_user.models import User


# Create your models here.


class Message(models.Model):
    text = models.CharField(_('Text'),
                            max_length=1000,
                            null=False,
                            blank=False)
    datetime = models.DateTimeField(_('message date time'))
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_receiver')
    is_seen = models.BooleanField(_('Is Message Seen'),
                                  default=False)

    def __str__(self):
        return self.text

    class Meta:
        db_table = 'messages'


class Chat(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_owner')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_receiver')

    class Meta:
        db_table = 'chats'