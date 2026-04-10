from django.urls import path
from accounts.views import Register,Login,Logout,Userprofile


urlpatterns = [
    path('api/auth/register/',Register.as_view(),name='register'),
    path('api/auth/login/',Login.as_view(),name='login'),
    path('api/auth/logout/',Logout.as_view(),name="logout"),
    path('api/auth/profile/',Userprofile.as_view(),name="profile")
    
]





