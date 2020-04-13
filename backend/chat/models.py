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
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    is_seen = models.BooleanField(_('Is Message Seen'),
                                  default=False)

    def __str__(self):
        return self.text
