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
