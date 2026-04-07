from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
import bcrypt
from accounts.serializer import Registerserializer,Profileserializer
from .models import Userregister,Profile
from .helper import get_user_from_token
from rest_framework.permissions import IsAuthenticated
class Register(APIView):
    def post(self,request):
        username=request.data.get('username')
        email=request.data.get('email')
    
        if Userregister.objects.filter(username=username,email=email).exists():
            return Response({"error":"user already exists"})
        serialized=Registerserializer(data=request.data)
        if serialized.is_valid():
             #password hashing
            try:
                password=request.data.get('password')
                hashed=bcrypt.hashpw(password.encode(),bcrypt.gensalt()).decode()
            except Exception as err:
                return Response({"error":err})
            
            Userregister.objects.create(
                username=username,
                university=request.data.get('university'),
                year=request.data.get('year'),
                email=request.data.get('email'),
                password=hashed,
                bio=request.data.get('bio')
            )
            print(f"{username} registered sucessfully !")
            return Response({"message":f"{username} Registered Sucessfully !"},status=status.HTTP_201_CREATED)
            
        

class Login(APIView):
    def post(self,request):
        username=request.data.get('username')
        email=request.data.get('email')
        password=request.data.get('password')
        try:
            user=get_object_or_404(Userregister,username=username,email=email)
        except Exception as err:
            return Response({"error":err})
        
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return Response({"error":"Invalid Credentials"},status=status.HTTP_400_BAD_REQUEST)
        
        refresh=RefreshToken()
        refresh['user_id']=user.id
        refresh['username']=user.username
        refresh['email']=user.email
        
        return Response({"refresh":str(refresh), "access":str(refresh.access_token)})
    
    
    
class Logout(APIView):
    #refresh token is used to create new access token(JWT) when old access token expires , without refresh token new access tokens cannot be generated 
    def post(self,request):
        user_id, auth_error = get_user_from_token(request)
        if auth_error:
            return auth_error
        if not Userregister.objects.filter(id=user_id).exists():
            return Response({"error":"User not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh_token=request.data.get('refresh')
        if not refresh_token:
            return Response({"error":"Refresh token is required "},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token=RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message":"Logged out Sucessfully !"},status=status.HTTP_200_OK)
        except Exception as err:
            return Response({"error":err},status=status.HTTP_400_BAD_REQUEST)
        
class Userprofile(APIView):
    
    def get(self,request):
        user_id, auth_error = get_user_from_token(request)
        if auth_error:
            return auth_error
            
        try:
            user_profile=Profile.objects.get(user_id=user_id)
        except Profile.DoesNotExist:
            return Response({"error":"Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        serialized=Profileserializer(user_profile)
        return Response(serialized.data,status=status.HTTP_200_OK)
    
    
    def put(self,request):
            user_id, auth_error = get_user_from_token(request)
            if auth_error:
                return auth_error
            user = Profile.objects.filter(user_id=user_id).first()
            if not user:
                return Response({"error":"User profile not found"}, status=status.HTTP_404_NOT_FOUND)

            user.username=request.data.get("username",user.username)
            user.university=request.data.get("university",user.university)
            user.bio=request.data.get("bio",user.bio)
            user.year=request.data.get("year", user.year)
            user.email=request.data.get("email", user.email)
            user.save()
            return Response({"message":"Profile updated successfully!"}, status=status.HTTP_200_OK)

    def delete(self,request):
        user_id, auth_error = get_user_from_token(request)
        if auth_error:
            return auth_error
            
        user_data = Profile.objects.filter(user_id=user_id).first()
        if not user_data:
            return Response({"error":"user profile Not Found !"},status=status.HTTP_400_BAD_REQUEST)
        user_data.delete()
        return Response({"message":"Profile Deleted SUcessfully !"})