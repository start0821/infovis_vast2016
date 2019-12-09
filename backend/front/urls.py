from django.urls import path
from . import views

urlpatterns = [
    path('proxy_data/', views.proxy_data, name="proxy"),
    path('bldg_data/', views.bldg_data, name="bldg"),
    path('relation/', views.relation, name="relation"),
]