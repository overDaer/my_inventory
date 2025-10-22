import os
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('inventory/', views.inventory, name='inventory'),
    path('inventory/item/', views.item, name='item'),
    path('inventory/item/delete/<int:pk>/', views.item_delete, name='item_delete'),
    path('inventory/image/upload/', views.image_upload, name='image_upload'),
    path('inventory/image/', views.image, name='image'),
    path('inventory/image/delete/<int:pk>/', views.image_delete, name='image_delete'),
    path('inventory/group/', views.group, name='group'),
    path('inventory/group/delete/<int:pk>/', views.group_delete, name='group_delete'),
    path('inventory/note/', views.note, name='note'),
    path('inventory/note/delete/<int:pk>/', views.note_delete, name='note_delete'),
    path('inventory/reminders-now/', views.reminders_now, name='reminders_now'),
    path('inventory/weeklyReminder/', views.weeklyReminder, name='weeklyReminder'),
    path('inventory/weeklyReminder/delete/<int:pk>/', views.weeklyReminder_delete, name='weeklyReminder_delete'),
    path('inventory/weeklyReminder/acknowledge/<int:pk>/', views.weeklyReminder_acknowledge, name='weeklyReminder_acknowledge'),
    path('inventory/dateReminder/', views.dateReminder, name='dateReminder'),
    path('inventory/dateReminder/delete/<int:pk>/', views.dateReminder_delete, name='dateReminder_delete'),
    path('inventory/dateReminder/acknowledge/<int:pk>/', views.dateReminder_acknowledge, name='dateReminder_acknowledge'),
]
if settings.DEBUG:
    # Use static() to add url mapping to serve static files during development (only)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)