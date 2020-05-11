from django.db import models

from inv_user.models import User
from django.utils.translation import gettext_lazy as _


class UserProfile(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

    name = models.CharField(_('Name'), max_length=50, default="")

    short_description = models.CharField(_('Short Description'), max_length=100, default="")

    long_description = models.CharField(_('Long Description'), max_length=250, default="")

    profile_image = models.ImageField(_('Profile Image'), upload_to='profile/profile_image/')

    profile_image_extension = models.CharField(max_length=10)

    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    latitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'user_profile'


class AlbumImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='image_owner')

    image = models.ImageField(_('Image'), upload_to='profile/album/')

    image_extension = models.CharField(max_length=10)

    created_timestamp = models.BigIntegerField()

    class Meta:
        db_table = 'user_album_image'
        constraints = [
            models.UniqueConstraint(fields=['user', 'created_timestamp'], name='unique_album_image')
        ]
