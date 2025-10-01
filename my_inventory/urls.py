from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('inventory/', views.inventory, name='inventory'),
    path('inventory/item/', views.item, name='item'),
    path('inventory/group/', views.group, name='group'),
]