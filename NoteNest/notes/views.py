from rest_framework.views import APIView
from .service import Noteservice
from .repository import noteRepository
from .Serializers import noteSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Notes
from rest_framework.exceptions import NotFound
from rest_framework.exceptions import ValidationError,AuthenticationFailed,NotFound
class Notes(APIView):
    
    def get(self,request,id):
        service=Noteservice()
        note=service.get_notes(request,id)
        
        if not note:
            return Response({"error":"note didn't Received Data"},status=status.HTTP_400_BAD_REQUEST)
        
        serialized=noteSerializer(note)
        if serialized.is_valid:
            return Response(serialized.data,status=status.HTTP_200_OK)
        
    
    def post(self,request):
        
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
    
    
class NotesAll(APIView):
    def get(self,request):
        service=Noteservice()
        note=service.get_all_notes(request)
        serialized=noteSerializer(note,many=True)
        if serialized.is_valid:
            return Response(serialized.data,status=status.HTTP_200_OK)
        else:
            raise ValidationError("invalid serialized data !",status=status.HTTP_400_BAD_REQUEST)
        
        
