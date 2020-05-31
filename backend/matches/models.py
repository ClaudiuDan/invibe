from django.db import models
from inv_user.models import User


# Might consider adding an expiry date
class Swipe(models.Model):
    SWIPE_CHOICES = (
        ('L', 'Liked'),
        ('P', 'Passed'),
    )

# are relations mandatory if you do not use them?
    user_action_maker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_swiped')
    user_action_receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_swiped_by')

    swipe_type = models.CharField(max_length=1, choices=SWIPE_CHOICES)

    class Meta:
        db_table = 'swipe'
        constraints = [
            models.UniqueConstraint(fields=['user_action_maker', 'user_action_receiver'], name='unique_swipe_action')
        ]

class Match(models.Model):
# TODO: would we be interested in who swiped last?
    user_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_matched_1')
    user_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_matched_2')

    class Meta:
        db_table = 'inv_match'
        constraints = [
            models.UniqueConstraint(fields=['user_1', 'user_2'], name='unique_match_action')
        ]