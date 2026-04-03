from django.urls import path
from .views import Register,Login,Logout,Userprofile


urlpatterns = [
    path('Register/',Register.as_view(),name='register'),
    path('Login/',Login.as_view(),name='login'),
    path('Logout/',Logout.as_view(),name="logout"),
    path('Profile/',Userprofile.as_view(),name="profile")
    
]





