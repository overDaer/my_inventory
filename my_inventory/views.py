from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.views import View
from django.core import serializers

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
        if 'id' in request.headers:
            group_id = request.headers['id']
            try:
                groups = [Group.objects.get(pk=group_id)]
            except Group.DoesNotExist:
                return JsonResponse({'error':f'failed to find item with id {group_id}'}, status=400)
        else:
            groups = Group.objects.all()
        serializedjson = serializers.serialize("json", groups)
        return JsonResponse(serializedjson,safe=False)

def item(request: HttpRequest):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # name = data['name']
            # category = data['category']
            # description = data['description']
            item = Item()
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
        if 'id' in request.headers:
            item_id = request.headers['id']
            try:
                items = [Item.objects.get(pk=item_id)]
            except Item.DoesNotExist:
                return JsonResponse({'error':f'failed to find item with id {item_id}'}, status=400)
        elif 'group_id' in request.headers:
            group_id = request.headers['group_id']
            items = Item.objects.filter(group__id=group_id)
        else:
            items = Group.objects.all()
        serializedjson = serializers.serialize("json", items)
        return JsonResponse(serializedjson,safe=False)
