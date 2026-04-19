from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status

def get_user_from_token(request):
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        return [None, Response({"error": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)]
    
    try:    
        raw_token = auth_header.split(" ")[1]
        token = AccessToken(raw_token)
        user_id = token.payload.get('user_id')
        if not user_id:
            return [None, Response({"error": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)]
        return [user_id, None]
    except TokenError:
        return [None, Response({"error": "Invalid or expired token"}, status=status.HTTP_401_UNAUTHORIZED)]
    except Exception as e:
        return [None, Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)]




#SUPABASE CONFIG
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

import uuid

def upload_pdf(file):
    # Prefix filename with UUID to prevent Supabase 409 Duplicate errors
    # e.g. "notes.pdf" → "pdfs/a1b2c3d4_notes.pdf"
    unique_name = f"{uuid.uuid4().hex[:8]}_{file.name}"
    file_path = f"pdfs/{unique_name}"

    try:
        supabase.storage.from_("notes").upload(
            file_path,
            file.read(),
            {
                "content-type": "application/pdf",
                "upsert": "true",
                "x-upsert": "true"
            }
        )
    except Exception as e:
        # If Supabase client retries on network drop, the second try gets 409 Duplicate
        # because the first try succeeded. The file is already in the bucket, so we can ignore it.
        if "409" in str(e) and "Duplicate" in str(e):
            pass
        else:
            raise e

    public_url = supabase.storage.from_("notes").get_public_url(file_path)

    return public_url



