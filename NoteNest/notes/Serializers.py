from .models import Notes, Likes, Notification, Comments, Download
from rest_framework import serializers


class noteSerializer(serializers.ModelSerializer):
    # Include the username of whoever uploaded this note
    user_username = serializers.SerializerMethodField()
    # Output the raw database string (the Supabase URL) instead of Django's /media/ prefixed URL
    pdf_file = serializers.SerializerMethodField()

    def get_user_username(self, obj):
        try:
            return obj.user.username
        except Exception:
            return None

    def get_pdf_file(self, obj):
        if obj.pdf_file:
            return obj.pdf_file.name
        return None

    class Meta:
        model = Notes
        fields = [
            'id', 'user', 'profile', 'title', 'description', 'subject',
            'university', 'pdf_file', 'download_count', 'likes_count',
            'comments_count', 'created_at', 'user_username'
        ]


class likeserializer(serializers.ModelSerializer):
    class Meta:
        model = Likes
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class Commentserializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = "__all__"


class DownloadSerializer(serializers.ModelSerializer):
    # Include basic note info inside each download record
    note_subject = serializers.CharField(source='note.subject', read_only=True)
    note_university = serializers.CharField(source='note.university', read_only=True)
    note_uploader = serializers.SerializerMethodField()

    def get_note_uploader(self, obj):
        try:
            return obj.note.user.username
        except Exception:
            return None

    class Meta:
        model = Download
        fields = ['id', 'user', 'note', 'note_title', 'note_subject',
                  'note_university', 'note_uploader', 'downloaded_at']
