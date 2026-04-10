from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import Likes, Notification

@receiver(post_save, sender=Likes)
def notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user_id=instance.user_id,
            note_id=instance.note_id,
            sender=instance.sender,
            receiver=instance.receiver,
            note_title=instance.note_title,
            receiver_id=instance.receiver_id,
        )



