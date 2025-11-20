from django.urls import path
from .views import ChatView

urlpatterns = [
    # This creates the endpoint: http://127.0.0.1:8000/api/chat/
    path('chat/', ChatView.as_view(), name='chat'),
]