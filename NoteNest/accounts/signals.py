from django.db.models.signals import post_save
from .models import Userregister,Profile
from django.dispatch import receiver
from django.core.mail import send_mail

#Registraton Email
@receiver(post_save, sender=Userregister)
def register_email(sender, instance, created, **kwargs):
    if created:
        subject = "Welcome"
        message = f"Hi {instance.username}, welcome to NoteNest"

        send_mail(
            subject,
            message,
            "alimd187788@gmail.com",
            [instance.email],
            fail_silently=False,
        )

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

