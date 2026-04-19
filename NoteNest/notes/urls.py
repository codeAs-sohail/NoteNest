from notes.views import NoteDetail, NotesAll, Notesexplore, Likes, Comments, Downloads,notification
from django.urls import path, include

urlpatterns = [
    # ⚠️ Static paths MUST come before dynamic <int:id>/ — Django matches top-to-bottom.
    # If <int:id>/ is first, requests like 'notes/all/' fail to match as int and return 404.
    path('api/notes/all/', NotesAll.as_view(), name="notesall"),
    path('api/notes/explore/', Notesexplore.as_view(), name="notesexplore"),
    path('api/notes/notification/', notification.as_view(), name="notification"),
    path('api/notes/downloads/', Downloads.as_view(), name="downloads_list"),
    path('api/notes/download/<int:id>/', Downloads.as_view(), name="record_download"),
    path('api/notes/comment/<int:id>/', Comments.as_view(), name="comments"),
    path('api/notes/ likes/<int:id>/', Likes.as_view(), name="likes"),
    # Dynamic route last — so it doesn't swallow the static routes above
    path('api/notes/<int:id>/', NoteDetail.as_view(), name="notes"),
]




