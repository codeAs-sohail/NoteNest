from django.db.models.signals import post_save
from .models import Userregister,Profile
from django.dispatch import receiver
from django.core.mail import send_mail
import threading
from accounts.models import Userregister

def send_welcome_email(username, email):
    subject = "Welcome to NoteNest! 🎉"
    message = f"""Hi {username},

Welcome to NoteNest! We're glad you joined us.

You can now log in and start sharing your notes with the community.

Happy Learning!
— The NoteNest Team
"""
    send_mail(
        subject,
        message,
        "alimd187788@gmail.com",
        [email],
        fail_silently=True,
    )

@receiver(post_save, sender=Userregister)
def register_email(sender, instance, created, **kwargs):
    if created:
        thread = threading.Thread(
            target=send_welcome_email,
            args=(instance.username, instance.email)
        )
        thread.daemon = True
        thread.start()




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

