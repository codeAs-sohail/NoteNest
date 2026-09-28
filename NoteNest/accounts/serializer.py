from .models import Userregister,Profile

from rest_framework import serializers

class Registerserializer(serializers.ModelSerializer):
    class Meta:
        model=Userregister
        fields="__all__"



class Profileserializer(serializers.ModelSerializer):
    class Meta:
        model=Profile
        fields="__all__" 
        
        
        
        