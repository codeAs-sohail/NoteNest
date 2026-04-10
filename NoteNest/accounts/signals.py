from django.db.models.signals import post_save
from .models import Userregister,Profile
from django.dispatch import receiver


#Profile creation 
@receiver(post_save,sender=Userregister)
def user_profile(sender,instance,created,**kwargs):
    if created:
            
        Profile.objects.create(
            user_id=instance.id,
            username=instance.username,
            university=instance.university,
            bio=instance.bio,
            email=instance.email,
            year=instance.year
        )

