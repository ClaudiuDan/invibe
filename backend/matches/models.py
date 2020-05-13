from django.db import models
from inv_user.models import User


# Might consider adding an expiry date
class Matches(models.Model):
    MATCH_CHOICES = (
        ('L', 'Liked'),
        ('P', 'Passed'),
    )

    user_action_maker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_matched')
    user_action_receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_matched_by')

    match_status = models.CharField(max_length=1, choices=MATCH_CHOICES)

    class Meta:
        db_table = 'matches'
        constraints = [
            models.UniqueConstraint(fields=['user_action_maker', 'user_action_receiver'], name='unique_match_action')
        ]
