from django.contrib import admin
from .models import Notes
@admin.register(Notes)
class NotesAdmin(admin.ModelAdmin):
    list_display=['user','title','description','subject','university','download_count', 'created_at']
    search_fields=['user','title']
    



