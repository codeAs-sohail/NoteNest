from  .views import Notes,NotesAll
from django.urls import path,include

urlpatterns = [
    
    path('notes/',Notes.as_view(),name="notes"),
    path('notes/<int:id>/',Notes.as_view(),name="notesid "),
    path('notesall/',NotesAll.as_view(),name="notesall"),
    
]



