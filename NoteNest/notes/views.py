from rest_framework.views import APIView
from .service import Noteservice
from .repository import noteRepository
from .Serializers import noteSerializer,likeserializer,NotificationSerializer,Commentserializer
from rest_framework.response import Response
from rest_framework import status
from .models import Notes
from rest_framework.exceptions import NotFound
from rest_framework.exceptions import ValidationError,AuthenticationFailed,NotFound
from rest_framework.pagination import PageNumberPagination
class Notes(APIView):
    
    def get(self,request,id):
        service=Noteservice()
        note=service.get_notes(request,id)
        
        if not note:
            return Response({"error":"note didn't Received Data"},status=status.HTTP_400_BAD_REQUEST)
        
        serialized=noteSerializer(note)
        if serialized.is_valid:
            return Response(serialized.data,status=status.HTTP_200_OK)
        
    
    def post(self,request,id):
        
        try:
            service=Noteservice()
            note=service.create_note(request)
            
            if not note:
                return Response({"error":"note didn't Received Data !"})    
            
            serialized=noteSerializer(note)
            return Response(serialized.data,status=status.HTTP_200_OK)
        
        except Exception as err:
            return Response({"error":str(err)})
        
    def put(self,request,id):
        service=Noteservice()
        note=service.update_note(request,id)
        
        if not note:
            return Response({"error":"note did't received the request"})
        
        try:
            
            serialized=noteSerializer(note)
            return Response(serialized.data,status=status.HTTP_200_OK)
        except Exception as err:
            print(err)
            return Response({"error":str(err)})

    def delete(self,request,id):
        service=Noteservice()
        note=service.delete_note(request,id)
        
        if not note:
            raise NotFound("note didn't received data !")
        
        return Response(f"{note}",status=status.HTTP_200_OK)
    
    
class NotesAll(APIView):#display all notes of current logged in user 
    def get(self,request):
        service=Noteservice()
        note=service.get_all_notes(request)
        serialized=noteSerializer(note,many=True)
        if serialized.is_valid:
            return Response(serialized.data,status=status.HTTP_200_OK)
        else:
            raise ValidationError("invalid serialized data !",status=status.HTTP_400_BAD_REQUEST)
 

class Notesexplore(APIView):
    def get(self,request):
        service=Noteservice()
        note=service.explore_notes(request)
        if not note:
            raise NotFound("Notes Not Found !")
        
        
        #Pagination
          # pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result = paginator.paginate_queryset(note, request)
        
        
        serialized=noteSerializer(note,many=True)
        if serialized:
             return paginator.get_paginated_response(serialized.data)
        else:
            raise ValidationError("Data is not valid !",status=status.HTTP_204_NO_CONTENT)
        
        
class Likes(APIView):
    
    def post(self,request,id):
        service=Noteservice()
        like=service.create_like(request,id)
        
        if not like:
            raise Exception("note didnt returned data !")

        serialized=likeserializer(like)
        
        if serialized.is_valid:
            return Response(serialized.data,status=status.HTTP_200_OK)
        else:
            raise Exception("serialized data is not")
        
        
    def get(self,request,id):
        service=Noteservice()
        like=service.get_all_likes(request)
        if not like:
            return Response({"error":"like didn't returned data !"})
        
        serialized=NotificationSerializer(like,many=True)
        if serialized:
            return Response(serialized.data,status=status.HTTP_200_OK)
        else:
            return Response({"error":"serialized data isn't valid !"})
        
        
class Comments(APIView):
    def post(self,request,id):
        
        service=Noteservice()
        comment=service.create_comment(request,id)
        if not comment:
            print("comment didn't got data !")
        serialized=Commentserializer(comment)
        if serialized:
            return Response(serialized.data,status=status.HTTP_200_OK)
        else:
            return Response("serialized data is not valid !",status=status.HTTP_400_BAD_REQUEST)
        
    
    def get(self,request,id):
        
        service=Noteservice()
        comment=service.get_comment(request,id)
        if not comment:
            print("comment didn't got data !")
        serialized=Commentserializer(comment,many=True)
        if serialized:
            return Response(serialized.data,status=status.HTTP_200_OK)
        else:
            return Response("serialized data is not valid !",status=status.HTTP_400_BAD_REQUEST)
        
        
    def delete(self,request,id):
         
        service=Noteservice()
        comment=service.delete_comment(request,id)
        if comment:
            return Response({"message":"comment Deleted Sucessfully !"},status=status.HTTP_200_OK)
        else:
            return Response({"error":"delete comment failed !"},status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
        
