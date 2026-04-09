from .models import Notes,Likes,Notification,Comments

from rest_framework import serializers
class noteSerializer(serializers.ModelSerializer):
    class Meta:
        model=Notes
        fields="__all__"
        
class likeserializer(serializers.ModelSerializer):
    class Meta:
        model=Likes
        fields="__all__"

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model=Notification
        fields="__all__"
        
class Commentserializer(serializers.ModelSerializer):
    class Meta:
        model=Comments
        fields="__all__"
               
        
        