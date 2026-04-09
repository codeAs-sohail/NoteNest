from  .views import Notes,NotesAll,Notesexplore,Likes,Comments
from django.urls import path,include

urlpatterns = [
    
    path('api/notes/<int:id>/',Notes.as_view(),name="notes"),
    path('api/notes/all/',NotesAll.as_view(),name="notesall"),# display all notes of logged in user
    path('api/notes/explore/',Notesexplore.as_view(),name="notesexplore"), # Display notes for explore page 
    path('api/notes/ likes/<int:id>/',Likes.as_view(),name="likes"),#Allows us to like,unlike,notification
    path('api/notes//comment/<int:id>/',Comments.as_view(),name="comments"),#comments
    
]



