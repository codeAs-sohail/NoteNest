 
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed,ValidationError,NotFound
from .helper import get_user_from_token
from .repository import noteRepository
from accounts.models import Profile
from .models import Notes
from rest_framework import status
from django.shortcuts import get_object_or_404
class Noteservice:
    def __init__(self):
        self.repo=noteRepository()
            
    def create_note(self,request):
        try:
            user_id,auth_error=get_user_from_token(request)
            print(f"{user_id} get user from token ")
            if auth_error:
                raise AuthenticationFailed("invalid Token or Expired token !")
        except Exception as err:
            raise AuthenticationFailed("Invalid or Expired Token")
        
        data=request.data 
        files=request.FILES 
        
        #Profile id 
        try:
            
            temp=Profile.objects.get(user_id=user_id)
            prof_id=temp.id
        except Exception as err:
            raise ValidationError(str(err),status=status.HTTP_400_BAD_REQUEST)
        print(prof_id)
        
        if not data.get('title'):
            raise ValidationError(" Title Not Found !")
        
        if not data.get('description'):
            raise ValidationError(" Profile Not Found !")
        
        if not data.get('pdf_file'):
            raise ValidationError(" Pdf file Not Found !")
        
        
        
        note=self.repo.create_note_repo(user_id,data,files,prof_id)
        return note
    
        
    def update_note(self,request,id):
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed(str(auth_error))
        
        files=request.FILES
        
        # if  not files:
        #     raise ValidationError("PDF Not Found")
        
        
        if not user_id:
            raise AuthenticationFailed("user id not found from helper.py ",status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user=Notes.objects.get(user_id=user_id,id=id)
            if not user:

                raise ValidationError("user not found ! ",status=status.HTTP_404_NOT_FOUND)
            
        except Exception as err:
            
            print(err)
            raise ValidationError(str(err))

        temp=self.repo.update_note_repo(request,files,user_id,id)
        note=temp
        print(f"{note} from service layer ")
        return note
        
        
            
    def get_notes(self,request,id):
        user_id,auth_error=get_user_from_token(request)
       
        if auth_error:
            print(auth_error)
            raise AuthenticationFailed("user_id  not found ")
        
        data=Notes.objects.get(user_id=user_id,id=id)
        if not data:
            raise ValidationError("user not found ! ",status=status.HTTP_404_NOT_FOUND)
        return data        

    def delete_note(self,request,id):
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed("Invalid Token or Expired  ")
        data=Notes.objects.filter(user_id=user_id,id=id)
        
        if not data:
            raise NotFound("user not found !")
        data.delete()
        return "Deleted Sucessfully !"
    
    def get_all_notes(self,request):
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed("Invalid Token or Expired Token !")
        if not user_id:
            raise AuthenticationFailed("user id not found !")
        note=Notes.objects.filter(user_id=user_id)
        if not note:
            raise NotFound("Notes Not Found !")
        return note 

