from .models import Notes
from rest_framework.exceptions import NotFound,ValidationError
from rest_framework.response import Response
from rest_framework import status
class noteRepository:
    
    def create_note_repo(self,user_id,data,files,prof_id):
     
        if not prof_id:
            raise NotFound("Profile id not found !") 
        try:
              
            note=Notes.objects.create(
                user_id=user_id,
                profile_id=prof_id,
                title=data.get('title'),
                description=data.get('description'),
                subject=data.get('subject'),
                university=data.get('university'),
                pdf_file=files.get('pdf_file'),
                download_count=data.get('download_count',0)
            )
        except Exception as err:
            print(err)
        return note

        
    """ mai profile ko as a foreign key use kar raha hu , so "profile" and by default uski 'id' ayegi(pk jo ha) which forms 'profile_id' , i was doing profile=prof_id which was profile_id=prof_id  """
    
    
    def update_note_repo(self,request,files,user_id,id):
        user=Notes.objects.get(user_id=user_id,id=id)
        
        try:
            
            user.title=request.data.get('title', user.title)
            user.description=request.data.get('description', user.description)
            user.subject=request.data.get('subject',user.subject)
            user.university=request.data.get('university',user.university)
            user.pdf_file=files.get('pdf_file',user.pdf_file)
            user.save()
            return user
        except Exception as err:
            raise ValidationError(str(err),status=status.HTTP_400_BAD_REQUEST)
            

        
    
    
    
    
    
    
    
    
    
    
    
    
    
    