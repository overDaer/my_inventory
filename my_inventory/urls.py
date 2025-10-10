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
]
if settings.DEBUG:
    # Use static() to add url mapping to serve static files during development (only)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)