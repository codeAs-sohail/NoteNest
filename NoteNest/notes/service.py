 
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed,ValidationError,NotFound
from .helper import get_user_from_token
from .repository import noteRepository
from accounts.models import Profile
from .models import Notes,Notification,Comments,Download
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import F
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
            raise ValidationError(" Description Not Found !")
        
        if not files.get('pdf_file'):
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
        
        
            
    def get_notes(self,request,id):# one specific note
        user_id,auth_error=get_user_from_token(request)
       
        if auth_error:
            print(auth_error)
            raise AuthenticationFailed("user_id  not found ")
        
        data=Notes.objects.get(user_id=user_id,id=id)
        if not data:
            raise ValidationError("user not found ! ",status=status.HTTP_404_NOT_FOUND)
        return data        

    def delete_note(self,request,id):#delet specific note ONLY ADMIN 
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed("Invalid Token or Expired  ")
        data=Notes.objects.filter(user_id=user_id,id=id)
        
        if not data:
            raise NotFound("user not found !")
        data.delete()
        return "Deleted Sucessfully !"
    
    def get_all_notes(self,request):#displays all note of sepcific user 
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed("Invalid Token or Expired Token !")
        if not user_id:
            raise AuthenticationFailed("user id not found !")
        note=Notes.objects.filter(user_id=user_id)
        if not note:
            raise NotFound("Notes Not Found !")
        return note 
    
    
    def explore_notes(self,request):# Displays all notes for admin dashboard
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed("Invalid Token or Expired Token !")
        
        note=Notes.objects.exclude(user_id=user_id)
        if not note:
            raise NotFound("Notes Not Found !")
        
        query_params=request.query_params
         
        if title := query_params.get('title'):
            note=note.filter(title__icontains=title)
        
        if subject :=query_params.get('subject'):
            note=note.filter(subject__icontains=subject)
        if university :=query_params.get('university'):
            note=note.filter(university__icontains=university)
                        
        return note
    
    def create_like(self,request,id):#when  user click like button
        
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise Exception((auth_error))
        if not user_id:
            raise AuthenticationFailed("Invalid Token or Expired Token")
        like=self.repo.create_like_repo(request,user_id,id)
        # if not like:
        #     raise Exception("like from service didn't received data !")
        print("like from service has been send")
        return like

        
    def get_all_likes(self,request):# all likes to display as a notification 
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise Exception(auth_error)
        if not user_id:
            raise Exception("Invalid Token or Expired Token !")
        
        data=Notification.objects.filter(receiver_id=user_id)
        if not data:
            raise NotFound("Data Not Found !")
        print(data.values)
        return data
    
    def create_comment(self,request,id):# everyone can create comment 
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise Exception(auth_error)
        if not user_id:
            raise Exception("Invalid Token or Expired Token !")
        comment=self.repo.create_comment_repo(request,user_id,id)
        return comment
        
    def get_comment(self,request,id):# getting one sepcific comment
        data=Comments.objects.filter(note_id=id)
        if not data:
            raise NotFound("comments not found !")
        
        return data
    
    def delete_comment(self,request,id):# Deletes one specific comment
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise Exception(auth_error)
        if not user_id:
            raise Exception("Invalid Token or Expired Token !")
        
        comment=self.repo.delete_comment_repo(request,user_id,id)
        return comment

    def get_user_downloads(self, request):
        user_id, auth_error = get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed("No authentic user found")
        return Download.objects.filter(user_id=user_id)

    def record_download(self, request, note_id):
        user_id, auth_error = get_user_from_token(request)
        if auth_error:
            raise AuthenticationFailed("Authentication required")
        
        note = get_object_or_404(Notes, id=note_id)
        
        
        download = Download.objects.create(
            user_id=user_id,
            note=note,
            note_title=note.title,
            note_subject=note.subject
        )
        
        note.download_count = F('download_count') + 1
        note.save()
        
        return download
    
    def get_notification(self,request):
        user_id,auth_error=get_user_from_token(request)
        if auth_error:
            raise Exception(auth_error)
        if not user_id:
            raise Exception("Invalid Token or Expired Token !")
        
        data=Notification.objects.filter(receiver_id=user_id)
        if not data:
            raise NotFound("Data Not Found !")
        print(data.values)
        return data
        
        