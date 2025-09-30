from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('inventory/', views.inventory, name='inventory'),
    path('inventory/item/', views.item, name='item'),
    path('inventory/item-form/', views.group, name='item-form'),
    path('inventory/group/', views.group, name='group'),
    path('inventory/group-form/', views.group, name='group-form'),
]