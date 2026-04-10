from django.db import models

class Userregister(models.Model):
    username=models.CharField(max_length=100)
    university=models.CharField(max_length=100)
    bio=models.TextField(default="",max_length=200)
    email=models.EmailField(unique=True,max_length=70)
    
    year_choices=[
    ('2020', '2020'),
    ('2021', '2021'),
    ('2022', '2022'),
    ('2023', '2023'),
    ('2024', '2024'),
    ('2025', '2025'),
    ]
    password=models.CharField(max_length=255,unique=True)
    year=models.CharField(choices=year_choices,max_length=10)
    created_at=models.DateTimeField(auto_now_add=True)
    
    
class Profile(models.Model):
    user=models.OneToOneField(Userregister, on_delete=models.CASCADE)
    username=models.CharField(max_length=100)
    university=models.CharField(max_length=100)
    bio=models.TextField(max_length=200)
    email=models.EmailField(unique=True,max_length=70)
    year=models.CharField(max_length=10)
    created_at=models.DateTimeField(auto_now_add=True)
    


