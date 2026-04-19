from django.db import models
from accounts.models import Userregister,Profile
class Notes(models.Model):
    user=models.ForeignKey('accounts.Userregister',on_delete=models.CASCADE, related_name="notes")
    profile=models.ForeignKey(Profile ,on_delete=models.CASCADE,related_name='profile',)
    title=models.CharField(max_length=100)
    description=models.TextField(blank=True,null=True)
    subject=models.CharField(max_length=100)
    university=models.CharField(max_length=100,blank=True,null=True)
    pdf_file=models.FileField(upload_to='pdfs/', max_length=500)
    download_count=models.IntegerField(default=0)
    likes_count=models.IntegerField(default=0)
    comments_count=models.IntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    
    
class Likes(models.Model):
    user=models.ForeignKey(Userregister,on_delete=models.CASCADE,related_name="likes")
    note=models.ForeignKey(Notes,on_delete=models.CASCADE,related_name="note_like")
    sender=models.CharField(max_length=50,blank=True, null=True)
    receiver=models.CharField(max_length=50,blank=True, null=True)
    receiver_id=models.IntegerField(null=True)
    note_title=models.CharField(max_length=100,null=True)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together=('user','note')


class Notification(models.Model):
    user=models.ForeignKey(Userregister,on_delete=models.CASCADE,related_name="user_notification")
    note=models.ForeignKey(Notes,on_delete=models.CASCADE,related_name="note_notification")
    sender=models.CharField(max_length=50,blank=True, null=True)
    receiver=models.CharField(max_length=50,blank=True, null=True)
    receiver_id=models.IntegerField(null=True)
    note_title=models.CharField(max_length=100,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    
    
class Comments(models.Model):
    user=models.ForeignKey(Userregister,on_delete=models.CASCADE,related_name="user_comment")
    note=models.ForeignKey(Notes,on_delete=models.CASCADE,related_name="note_comments")
    sender=models.CharField(max_length=100)
    comment=models.CharField(max_length=256,null=True)
    receiver_id=models.IntegerField(null=True)
    
    class Meta:
        unique_together=('user','note')



class Download(models.Model):
    user = models.ForeignKey(Userregister, on_delete=models.CASCADE, related_name='user_downloads')
    note = models.ForeignKey(Notes, on_delete=models.CASCADE, related_name='note_downloads')
    note_title = models.CharField(max_length=100)          
    note_subject = models.CharField(max_length=100, blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-downloaded_at']   #recent download will be displayed first 
