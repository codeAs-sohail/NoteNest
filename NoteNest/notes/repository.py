from .models import Notes,Profile,Likes,Comments,Notification
from rest_framework.exceptions import NotFound,ValidationError
from rest_framework.response import Response
from django.db.models import F
class noteRepository:
    
    def create_note_repo(self,user_id,data,files,prof_id):
        note=None #here note is defined in if condition ,<- this fails means note variable doesn't exist , ultimately it will crash
     
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
        # We use .first() here because .filter() returns a list, and we need a single object
        note = Notes.objects.filter(user_id=user_id, id=id).first()
        
        if not note:
            raise NotFound("Note not found or you don't have permission to edit it.")

        try:
            
            note.title = request.data.get('title', note.title)
            note.description = request.data.get('description', note.description)
            note.subject = request.data.get('subject', note.subject)
            note.university = request.data.get('university', note.university)
            note.pdf_file = files.get('pdf_file', note.pdf_file)
            note.save()

            #the note title should be synced to other tables 
            new_title = note.title
            Likes.objects.filter(note_id=id).update(note_title=new_title)
            Notification.objects.filter(note_id=id).update(note_title=new_title)

            return note
        except Exception as err:
            raise ValidationError(str(err))
            

        
    def create_like_repo(self,request,user_id,note_id):
        like=None
        #value is used to get specific fields like only name and age 
        # to get the sender's username 
        try:
            send_data=Profile.objects.filter(user_id=user_id).values('username').first() 
            send_username=send_data['username']
            
            #Receiver or note owner's username 
            rec_data=Notes.objects.filter(id=note_id).values('user__username','user_id','title').first()
            rec_username=rec_data['user__username']
            rec_user_id=rec_data['user_id']
            rec_title=rec_data['title']
        except Exception as err:
            raise Exception(str(err))        
        
            #if user already exist in db delete it (UNLIKE)
        data=Likes.objects.filter(user_id=user_id,note_id=note_id).first()
        if data:
            print(f"{data} already exists deleting !")
            like=data #storing data to return 
            data.delete()
            #decrement in likes count in notes
            updated=updated = Notes.objects.filter(id=note_id).update(likes_count=F('likes_count') - 1)
            return like
        else:
                
            #Creating a record in DB(likes table)   
            like=Likes.objects.create(
                user_id=user_id,
                note_id=note_id,
                note_title=rec_title,
                sender=send_username,
                receiver=rec_username,
                receiver_id=rec_user_id
            )
            updated=updated = Notes.objects.filter(id=note_id).update(likes_count=F('likes_count') + 1)
            
            if not updated:
                raise Exception("likes data has not been updated ")
            #Updating likes count
            
            print("like has been send from repo !")
            return like
            
                
    def create_comment_repo(self,request,user_id,id):
        
        #Receievr
        rec_data=Notes.objects.filter(id=id).values('user_id').first()
        rec_user_id=rec_data['user_id']
        
        if not rec_user_id:
            raise Exception("user id not  found !")
        
        #Sender 
        send_data=Profile.objects.filter(user_id=user_id).values('username').first()
        send_username=send_data['username']
        if not send_username:
            raise Exception("sender username not found !")
        
        comments=Comments.objects.create(
            user_id=user_id,
            note_id=id,
            sender=send_username,
            receiver_id=rec_user_id,
            comment=request.data.get('comment')
        )
        if not comments:
            raise Exception("comments from repo.py !")
        return comments
    
    def delete_comment_repo(self,request,user_id,id):
        data=Comments.objects.filter(receiver_id=user_id,note_id=id)
        if data:
            data.delete()
            return True
        else:
            raise Exception("invalid user ")
            
        
        
            