from rest_framework import serializers
from .models import Userregister,Profile
class Registerserializer(serializers.ModelSerializer):
    class Meta:
        model=Userregister
        fields='__all__'
        
class Profileserializer(serializers.ModelSerializer):
    class Meta:
        model=Profile
        fields='_all__'
        
        
        


