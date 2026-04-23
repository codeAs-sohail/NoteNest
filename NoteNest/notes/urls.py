from notes.views import NoteDetail, NotesAll, Notesexplore, Likes, Comments, Downloads,notification
from django.urls import path, include
from django.http import HttpResponse

urlpatterns = [
    #notes
    path('api/notes/all/', NotesAll.as_view(), name="notesall"),
    path('api/notes/explore/', Notesexplore.as_view(), name="notesexplore"), 
    path('api/notes/notification/', notification.as_view(), name="notification"),
    path('api/notes/<int:id>/', NoteDetail.as_view(), name="notes"),
    #downloads
    path('api/notes/downloads/', Downloads.as_view(), name="downloads_list"),
    path('api/notes/download/<int:id>/', Downloads.as_view(), name="record_download"),
    #comments 
    path('api/notes/comment/<int:id>/', Comments.as_view(), name="comments"),
    path('api/notes/ likes/<int:id>/', Likes.as_view(), name="likes"),
    
    #Uptime reboot 
    path('health/', lambda _: HttpResponse("OK")),
    
]




