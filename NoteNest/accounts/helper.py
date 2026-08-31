from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from decouple import config
from django.conf import settings
from django.template.loader import render_to_string
import logging
from django.core.mail import EmailMultiAlternatives



"""the logger prints the error with the file name like [accounts.views] ERROR: User validation failed"""

logger = logging.getLogger(__name__)
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



def send_welcome_email(user_instance):
    html=render_to_string("Welcome.html",{"username":user_instance.username})
    
    email=EmailMultiAlternatives(
        subject="Welcome to Notenest",
        body="",
        from_email=config('DEFAULT_FROM_EMAIL'),
        to=[user_instance.email]
        
        )
    email.attach_alternative(html, "text/html")
    email.send()

