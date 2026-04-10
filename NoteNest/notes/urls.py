from notes.views import NoteDetail, NotesAll, Notesexplore, Likes, Comments, Downloads,notification
from django.urls import path, include

urlpatterns = [
    path('api/notes/<int:id>/', NoteDetail.as_view(), name="notes"),
    path('api/notes/all/', NotesAll.as_view(), name="notesall"), # display all notes of logged in user
    path('api/notes/explore/', Notesexplore.as_view(), name="notesexplore"), # Display notes for explore page 
    path('api/notes/ likes/<int:id>/', Likes.as_view(), name="likes"), # Allows us to like,unlike,notification
    path('api/notes/comment/<int:id>/', Comments.as_view(), name="comments"), # comments
    path('api/notes/notification/',notification.as_view(),name="notification"),
    # Download History
    path('api/notes/downloads/', Downloads.as_view(), name="downloads_list"),
    path('api/notes/download/<int:id>/', Downloads.as_view(), name="record_download"),
    
]



