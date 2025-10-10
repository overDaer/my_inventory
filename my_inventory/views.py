from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse, Http404
from django.views import View
from django.core import serializers
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.clickjacking import xframe_options_sameorigin
from .models import *
from .forms import *
from typing import Sequence, TypeVar
import json

def index(request: HttpRequest):
    return HttpResponse("Hello, welcome to your personal Inventory Management System!")

def inventory(request: HttpRequest):
    return render(request, 'inventory.html')

T = TypeVar('T')

def postModel(models: Sequence[T]):
        for model in models:
            #set type
            model = T(model)
            try:
                model.full_clean()
            except ValidationError:
                return HttpResponse(message="Failed to validate items", status_code=400)
            model.save()
        return HttpResponse(message="Saved item(s)", status_code=200)

#if Generic method postModel works for group, reuse generic method for most model POST requests

def group(request: HttpRequest):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data['name']
            category = data['category']
            description = data['description']
            group = Group(name=name,category=category,description=description)
            try:
                group.full_clean()
                group.save()
                return JsonResponse({'message':'successfully created Group object'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'Group failed to validate'}, status=400)
        except json.JSONDecodeError:
                return JsonResponse({'error':'JSON failed to decode'}, status=400)
    elif request.method == "GET":
        groups = [];
        if 'id' in request.GET:
            group_id = request.GET.get('id')
            try:
                groups = [Group.objects.get(pk=group_id)]
            except Group.DoesNotExist:
                return JsonResponse({'error':f'failed to find item with id {group_id}'}, status=400)
        else:
            groups = Group.objects.all()
        serializedjson = serializers.serialize("json", groups)
        return JsonResponse(serializedjson,safe=False)
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            pk = data['id']
            name = data['name']
            category = data['category']
            description = data['description']
            group = Group.objects.get(pk=pk)
            group.name = name
            if(category): group.category = category
            if(description): group.description = description
            try:
                group.full_clean()
                group.save()
                return JsonResponse({'message':'successfully created Group object'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'Group failed to validate'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error':'JSON failed to decode'}, status=400)
        
    
def group_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            group = get_object_or_404(Group, pk=pk)
            group.delete()
            return JsonResponse({'message':'successfully delete Group'}, status=204)
        except Http404:
            return JsonResponse({'error':'Group could not be found with that pk'}, status=404)
    else:
            return JsonResponse({'error':'Expected a POST request'}, status=400)
    
def item_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            item = get_object_or_404(Item, pk=pk)
            item.delete()
            return JsonResponse({'message':'successfully delete item'}, status=204)
        except Http404:
            return JsonResponse({'error':'Item could not be found with that pk'}, status=404)
    else:
            return JsonResponse({'error':'Expected a POST request'}, status=400)
    
def item(request: HttpRequest):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            group_id = data['group_id']
            name= data['name']
            price= data['price']
            model_number = data['modelNumber']
            total= data['total']
            available= data['available']
            used= data['used']
            acquired= data['acquired']
            expire=  data['expire']
            lifespan=  data['lifespan']
            description=  data['description']
            item = Item()
            item.group = Group.objects.get(pk=group_id)
            item.name = name
            if (price): item.price = price
            if (model_number): item.model_number = model_number
            if (total): item.total_quantity = total
            if (available): item.available_quantity = available
            if (used): item.used_quantity = used
            if (acquired): item.acquired_dt = acquired
            if (expire): item.expire_dt = expire
            if (lifespan): item.lifespan = lifespan
            if (description): item.description = description
            try:
                item.full_clean()
                item.save()
                return JsonResponse({'message':'successfully created item object'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'item failed to validate'}, status=400)
        except json.JSONDecodeError:
                return JsonResponse({'error':'JSON failed to decode'}, status=400)
    elif request.method == "GET":
        items = [];
        if 'id' in request.GET:
            item_id = request.GET.get('id')
            try:
                items = [Item.objects.get(pk=item_id)]
            except Item.DoesNotExist:
                return JsonResponse({'error':f'failed to find item with id {item_id}'}, status=400)
        elif 'group_id' in request.GET:
            group_id = request.GET.get('group_id')
            items = Item.objects.filter(group__id=group_id)
        else:
            items = Item.objects.all()
        serializedjson = serializers.serialize("json", items)
        return JsonResponse(serializedjson,safe=False)
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            id = data['id']
            name= data['name']
            price= data['price']
            model_number = data['modelNumber']
            total= data['total']
            available= data['available']
            used= data['used']
            acquired= data['acquired']
            expire=  data['expire']
            lifespan=  data['lifespan']
            description=  data['description']
            item = Item.objects.get(pk=id)
            item.name = name
            if (price): item.price = price
            if (model_number): item.model_number = model_number
            if (total): item.total_quantity = total
            if (available): item.available_quantity = available
            if (used): item.used_quantity = used
            if (acquired): item.acquired_dt = acquired
            if (expire): item.expire_dt = expire
            if (lifespan): item.lifespan = lifespan
            if (description): item.description = description
            try:
                item.full_clean()
                item.save()
                return JsonResponse({'message':'successfully created item object'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'Item failed to validate'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error':'JSON failed to decode'}, status=400)
        
def item_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            item = get_object_or_404(Item, pk=pk)
            item.delete()
            return JsonResponse({'message':'successfully delete item'}, status=204)
        except Http404:
            return JsonResponse({'error':'Item could not be found with that pk'}, status=404)
    else:
            return JsonResponse({'error':'Expected a POST request'}, status=400)
    
def image_upload(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        file = request.FILES.get('file')
        if not file: return JsonResponse({'error': 'No image provided'}, status=400)
        item_id = request.POST.get('item_id')
        item = get_object_or_404(Item,pk=item_id)
        Image.objects.create(name=name, image=file, item=item)
        return JsonResponse({'message': 'Image uploaded successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def item_image(request):
    images = []
    data = []
    if 'id' in request.GET:
        image_id = request.GET.get('id')
        try:
            images = [Image.objects.get(pk=image_id)]
        except Image.DoesNotExist:
            return JsonResponse({'error':f'failed to find item with id {image_id}'}, status=400)
    elif 'item_id' in request.GET:
        item_id = request.GET.get('item_id')
        item = get_object_or_404(Item,pk=item_id)
        images = item.image.all()
    else:
        images = Image.objects.all()
    for image in images:
        data.append({
            'pk':image.pk,
            'name':image.name,
            'uri':request.build_absolute_uri(image.image.url)
        })
    return JsonResponse(data, safe=False)

def image_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            image = get_object_or_404(Image, pk=pk)
            image.delete()
            return JsonResponse({'message':'successfully delete image'}, status=204)
        except Http404:
            return JsonResponse({'error':'Image could not be found with that pk'}, status=404)
    else:
            return JsonResponse({'error':'Expected a POST request'}, status=400)

def success(request):
    return render(request, 'success.html')
