from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from decouple import config
from django.conf import settings
from django.template.loader import render_to_string
import logging
"""the logger prins the error with the file name like [accounts.views] ERROR: User validation failed"""

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


def Send_Registration_Email(user_instance):
    try:
        
        
        html_content = render_to_string(
            "Welcome.html",
            {
                "username": user_instance.username
            }
        )
        
        """'DIRS': [os.path.join(BASE_DIR.parent, 'Emails')]-
        because this is defined in settings.py , the django  will directly check
        for Welcom.html, so i defined only Welcome.html
        
        """
        logger.info(f"Sending welcome email to {user_instance.email}")
        print(settings.EMAIL_HOST)
        print(settings.EMAIL_PORT)
        print(settings.EMAIL_HOST_USER)
        send_mail(
            subject='Welcome to NoteNest',
            message=f'Hi {user_instance.username}, welcome to our platform!',
            from_email=config("DEFAULT_FROM_EMAIL"),
            recipient_list=[user_instance.email],
            html_message=html_content, 
            fail_silently=False,
        )
        print(f"{user_instance.username}'s Email Send Sucessfully !")
    except Exception as err:
        print(f"An Email Error Occurred: \n{str(err)}")
    
    