from django.db import models
from accounts.models import Userregister,Profile
class Notes(models.Model):
    user=models.ForeignKey('accounts.Userregister',on_delete=models.CASCADE, related_name="notes")
    profile=models.ForeignKey(Profile ,on_delete=models.CASCADE,related_name='profile',)
    title=models.CharField(max_length=100)
    description=models.TextField(blank=True,null=True)
    subject=models.CharField(max_length=100)
    university=models.CharField(max_length=100,blank=True,null=True)
    pdf_file=models.FileField(upload_to='pdfs/')
    download_count=models.IntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    
    



