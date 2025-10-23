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
import datetime
from datetime import time
from django.db.models import Q, F

def index(request: HttpRequest):
    return redirect('inventory');

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
                return JsonResponse({'message':"failed to validate items"}, status_code=400)
            model.save()
        return JsonResponse({'message':"saved item(s)"}, status_code=200)

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
                return JsonResponse({'message':'successfully created group'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'group failed to validate'}, status=400)
        except json.JSONDecodeError:
                return JsonResponse({'error':'json failed to decode'}, status=400)
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
                return JsonResponse({'message':'successfully created group'}, status=200)
            except ValidationError:
                return JsonResponse({'error':'group failed to validate'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error':'json failed to decode'}, status=400)
        
    
def group_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            group = get_object_or_404(Group, pk=pk)
            group.delete()
            return JsonResponse({'message':'successfully deleted group'}, status=200)
        except Http404:
            return JsonResponse({'error':'group could not be found'}, status=404)
    else:
            return JsonResponse({'error':'expected a POST request'}, status=400)
    
def item_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            item = get_object_or_404(Item, pk=pk)
            item.delete()
            return JsonResponse({'message':'successfully deleted item'}, status=200)
        except Http404:
            return JsonResponse({'error':'item could not be found'}, status=404)
    else:
            return JsonResponse({'error':'expected a POST request'}, status=400)
    
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
                return JsonResponse({'message':'successfully created item'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'item failed to validate'}, status=400)
        except json.JSONDecodeError:
                return JsonResponse({'error':'json failed to decode'}, status=400)
    elif request.method == "GET":
        items = [];
        if 'id' in request.GET:
            item_id = request.GET.get('id')
            try:
                items = [Item.objects.get(pk=item_id)]
            except Item.DoesNotExist:
                return JsonResponse({'error':f'failed to find item'}, status=400)
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
                return JsonResponse({'message':'successfully updated item'}, status=201)
            except ValidationError:
                return JsonResponse({'message':'item failed to validate'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'message':'json failed to decode'}, status=400)
        
def item_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            item = get_object_or_404(Item, pk=pk)
            item.delete()
            return JsonResponse({'message':'successfully deleted item'}, status=200)
        except Http404:
            return JsonResponse({'message':'item could not be found'}, status=404)
    else:
            return JsonResponse({'message':'expected a POST request'}, status=400)
    
def image_upload(request):
    if request.method == 'POST':
        item_id = request.POST.get('item_id')
        name = request.POST.get('name')
        files = request.FILES.getlist('images')
        if (not files) or (len(files) == 0): 
            return JsonResponse({'message': 'no image(s) provided'}, status=400)
        item = get_object_or_404(Item,pk=item_id)
        for i in range(len(files)):
            iterated_name = name
            if (i > 1): iterated_name += f"-{i}"
            file = files[i]
            Image.objects.create(name=iterated_name, image=file, item=item)
        return JsonResponse({'message': 'image(s) uploaded successfully'},status=201)
    else:
        return JsonResponse({'message': 'invalid request method'}, status=405)

def image(request):
    images = []
    data = []
    if 'id' in request.GET:
        image_id = request.GET.get('id')
        try:
            images = [Image.objects.get(pk=image_id)]
        except Image.DoesNotExist:
            return JsonResponse({'message':f'failed to find item'}, status=400)
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
            return JsonResponse({'message':'successfully deleted image'}, status=200)
        except Http404:
            return JsonResponse({'message':'image could not be found'}, status=404)
    else:
            return JsonResponse({'message':'expected a POST request'}, status=400)

def note(request: HttpRequest):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            item_id = data['item_id']
            name= data['name']
            text= data['text']
            note = Note()
            note.item = Item.objects.get(pk=item_id)
            note.name = name
            note.text = text
            try:
                note.full_clean()
                note.save()
                return JsonResponse({'message':'successfully created note'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'note failed to validate'}, status=400)
        except json.JSONDecodeError:
                return JsonResponse({'error':'json failed to decode'}, status=400)
    elif request.method == "GET":
        notes = [];
        if 'id' in request.GET:
            id = request.GET.get('id')
            try:
                notes = [Note.objects.get(pk=id)]
            except Note.DoesNotExist:
                return JsonResponse({'error':f'failed to find note'}, status=400)
        elif 'item_id' in request.GET:
            item_id = request.GET.get('item_id')
            notes = Note.objects.filter(item__id=item_id)
        else:
            notes = Note.objects.all()
        serializedjson = serializers.serialize("json", notes)
        return JsonResponse(serializedjson,safe=False)
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            id = data['id']
            name= data['name']
            text= data['text']
            note = Note.objects.get(pk=id)
            note.name = name
            note.text = text
            try:
                note.full_clean()
                note.save()
                return JsonResponse({'message':'successfully updated note'}, status=201)
            except ValidationError:
                return JsonResponse({'message':'note failed to validate'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'message':'json failed to decode'}, status=400)

def note_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            note = get_object_or_404(Note, pk=pk)
            note.delete()
            return JsonResponse({'message':'successfully deleted note'}, status=200)
        except Http404:
            return JsonResponse({'message':'note could not be found'}, status=404)
    else:
            return JsonResponse({'message':'expected a POST request'}, status=400)
    
def weeklyReminder(request: HttpRequest):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            note_id = data['note_id']
            time= data['time']
            monday= data['monday']
            tuesday= data['tuesday']
            wednesday= data['wednesday']
            thursday= data['thursday']
            friday= data['friday']
            saturday= data['saturday']
            sunday= data['sunday']
            weeklyReminder = WeeklyReminder()
            weeklyReminder.note = Note.objects.get(pk=note_id)
            weeklyReminder.time = time
            weeklyReminder.monday = monday
            weeklyReminder.tuesday = tuesday
            weeklyReminder.wednesday = wednesday
            weeklyReminder.thursday = thursday
            weeklyReminder.friday = friday
            weeklyReminder.saturday = saturday
            weeklyReminder.sunday = sunday
            try:
                weeklyReminder.full_clean()
                weeklyReminder.save()
                return JsonResponse({'message':'successfully created weekly reminder'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'weekly reminder failed to validate'}, status=400)
        except json.JSONDecodeError:
                return JsonResponse({'error':'json failed to decode'}, status=400)
    elif request.method == "GET":
        weeklyReminders = [];
        if 'id' in request.GET:
            id = request.GET.get('id')
            try:
                weeklyReminders = [WeeklyReminder.objects.get(pk=id)]
            except WeeklyReminder.DoesNotExist:
                return JsonResponse({'error':f'failed to find weekly reminder'}, status=400)
        elif 'note_id' in request.GET:
            note_id = request.GET.get('note_id')
            weeklyReminders = WeeklyReminder.objects.filter(note__id=note_id)
        else:
            weeklyReminders = WeeklyReminder.objects.all()
        serializedjson = serializers.serialize("json", weeklyReminders)
        return JsonResponse(serializedjson,safe=False)
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            id = data['id']
            time= data['time']
            monday= data['monday']
            tuesday= data['tuesday']
            wednesday= data['wednesday']
            thursday= data['thursday']
            friday= data['friday']
            saturday= data['saturday']
            sunday= data['sunday']
            weeklyReminder = WeeklyReminder.objects.get(pk=id)
            weeklyReminder.time = time
            weeklyReminder.monday = monday
            weeklyReminder.tuesday = tuesday
            weeklyReminder.wednesday = wednesday
            weeklyReminder.thursday = thursday
            weeklyReminder.friday = friday
            weeklyReminder.saturday = saturday
            weeklyReminder.sunday = sunday
            try:
                weeklyReminder.full_clean()
                weeklyReminder.save()
                return JsonResponse({'message':'successfully updated weekly reminder'}, status=201)
            except ValidationError:
                return JsonResponse({'message':'weekly reminder failed to validate'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'message':'json failed to decode'}, status=400)

def weeklyReminder_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            weeklyReminder = get_object_or_404(WeeklyReminder, pk=pk)
            weeklyReminder.delete()
            return JsonResponse({'message':'successfully deleted weekly reminder'}, status=200)
        except Http404:
            return JsonResponse({'message':'weekly reminder could not be found'}, status=404)
    else:
            return JsonResponse({'message':'expected a POST request'}, status=400)
    
def dateReminder(request: HttpRequest):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            note_id = data['note_id']
            reminder_dt = data['reminder_dt']
            reoccurring = data['reoccurring']
            reoccurring_interval = data['reoccurring_interval']
            dateReminder = DateReminder()
            dateReminder.note = Note.objects.get(pk=note_id)
            dateReminder.reminder_dt = reminder_dt
            dateReminder.reoccurring = reoccurring
            dateReminder.reoccurring_interval = reoccurring_interval
            try:
                dateReminder.full_clean()
                dateReminder.save()
                return JsonResponse({'message':'successfully created date reminder'}, status=201)
            except ValidationError:
                return JsonResponse({'error':'date reminder failed to validate'}, status=400)
        except json.JSONDecodeError:
                return JsonResponse({'error':'json failed to decode'}, status=400)
    elif request.method == "GET":
        dateReminders = [];
        if 'id' in request.GET:
            id = request.GET.get('id')
            try:
                dateReminders = [DateReminder.objects.get(pk=id)]
            except DateReminder.DoesNotExist:
                return JsonResponse({'error':f'failed to find date reminder'}, status=400)
        elif 'note_id' in request.GET:
            note_id = request.GET.get('note_id')
            dateReminders = DateReminder.objects.filter(note__id=note_id)
        else:
            dateReminders = DateReminder.objects.all()
        serializedjson = serializers.serialize("json", dateReminders)
        return JsonResponse(serializedjson,safe=False)
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            id = data['id']
            reminder_dt = data['reminder_dt']
            reoccurring = data['reoccurring']
            reoccurring_interval = data['reoccurring_interval']
            dateReminder = DateReminder.objects.get(pk=id)
            dateReminder.reminder_dt = reminder_dt
            dateReminder.reoccurring = reoccurring
            dateReminder.reoccurring_interval = reoccurring_interval
            try:
                dateReminder.full_clean()
                dateReminder.save()
                return JsonResponse({'message':'successfully updated date reminder'}, status=201)
            except ValidationError:
                return JsonResponse({'message':'date reminder failed to validate'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'message':'json failed to decode'}, status=400)

def dateReminder_delete(request:HttpRequest,pk: int):
    if request.method == "POST":
        try:
            dateReminder = get_object_or_404(DateReminder, pk=pk)
            dateReminder.delete()
            return JsonResponse({'message':'successfully deleted date reminder'}, status=200)
        except Http404:
            return JsonResponse({'message':'date reminder could not be found'}, status=404)
    else:
            return JsonResponse({'message':'expected a POST request'}, status=400)
    
def weeklyReminder_acknowledge(request:HttpRequest, pk: int):
    if request.method == "GET":
        try:
            reminder = get_object_or_404(WeeklyReminder, pk=pk)
            reminder.acknowledged_dt = datetime.datetime.now()
            try:
                reminder.full_clean()
                reminder.save()
                return JsonResponse({'message':'successfully acknowledged reminder'}, status=200)
            except:
                return JsonResponse({'message':'reminder failed to validate'}, status=400)
        except Http404:
            return JsonResponse({'message':'reminder could not be found'}, status=404)
    else:
            return JsonResponse({'message':'expected a GET request'}, status=400)
    
def dateReminder_acknowledge(request:HttpRequest, pk: int):
    if request.method == "GET":
        try:
            reminder = get_object_or_404(DateReminder, pk=pk)
            reminder.acknowledged_dt = datetime.datetime.now()
            try:
                reminder.full_clean()
                reminder.save()
                return JsonResponse({'message':'successfully acknowledged reminder'}, status=200)
            except:
                return JsonResponse({'message':'reminder failed to validate'}, status=400)
        except Http404:
            return JsonResponse({'message':'reminder could not be found'}, status=404)
    else:
            return JsonResponse({'message':'expected a GET request'}, status=400)
    
def reminders_now(request:HttpRequest):
    if request.method == "GET":
        utc_dt = datetime.datetime.now(datetime.timezone.utc)
        local_dt = utc_dt.astimezone()
        local_time = time(local_dt.hour,local_dt.minute)
        weekday = local_dt.weekday()
        # where reminder datetime is past now, and acknowledged datetime is null or less than reminder datetime
        dateQ = (
            Q(date_reminder__reminder_dt__lt=local_dt) & 
            (Q(date_reminder__acknowledged_dt=None) | Q(date_reminder__acknowledged_dt__lt=F("date_reminder__reminder_dt"))))
        # where now is past reminder time, acknowledged less than today, and weekday is correct
        weekQ = (
            Q(weekly_reminder__time__lte=local_time) &
            (Q(weekly_reminder__acknowledged_dt = None) | Q(weekly_reminder__acknowledged_dt__lt=local_dt.date()))
        )
        
        if weekday == 0: weekQ &=Q(weekly_reminder__monday = True)
        if weekday == 1: weekQ &=Q(weekly_reminder__tuesday = True)
        if weekday == 2: weekQ &=Q(weekly_reminder__wednesday = True)
        if weekday == 3: weekQ &=Q(weekly_reminder__thursday = True)
        if weekday == 4: weekQ &=Q(weekly_reminder__friday = True)
        if weekday == 5: weekQ &=Q(weekly_reminder__saturday = True)
        if weekday == 6: weekQ &=Q(weekly_reminder__sunday = True)
        
        notes = Note.objects.distinct().filter(dateQ | weekQ)
        serializedjson = serializers.serialize("json", notes)
        return JsonResponse(serializedjson,safe=False)
    else: 
        return JsonResponse({'message':'expected a GET request'}, status=400)