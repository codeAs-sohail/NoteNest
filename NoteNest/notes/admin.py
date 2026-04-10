from django.contrib import admin
from notes.models import Notes,Likes,Notification,Comments
@admin.register(Notes)
class NotesAdmin(admin.ModelAdmin):
    list_display=['user','title','description','subject','university','download_count', 'created_at']
    search_fields=['user','title']
    
@admin.register(Likes)
class LikesAdmin(admin.ModelAdmin):
    list_display=['sender','receiver','note_title','created_at']
    search_fields=['note_title']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display=['sender','receiver', 'note_title','created_at']
    search_fields=['note_title']
    
@admin.register(Comments)
class CommentAdmin(admin.ModelAdmin):
    list_display=['user','note','sender','comment']
    search_fields=['comment']
    