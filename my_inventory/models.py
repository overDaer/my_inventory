from pathlib import Path
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
import os

IMAGE_FILE_PATH = 'pictures/'
STAT_MIN = 0
STAT_MAX = 10
QTY_MIN = 0
QTY_MAX = 1000000
# Create your models here.


class Group(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    category = models.TextField(null=True, blank=True)
    def __str__(self):
        return self.name
    
class Item(models.Model):
    name = models.CharField(max_length=200)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    model_number = models.CharField(max_length=200, null=True, blank=True)
    total_quantity = models.IntegerField(validators=[MinValueValidator(QTY_MIN),MaxValueValidator(QTY_MAX)],null=True, blank=True)
    available_quantity = models.IntegerField(validators=[MinValueValidator(QTY_MIN)],null=True, blank=True)
    used_quantity = models.IntegerField(validators=[MinValueValidator(QTY_MIN)], null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    updated_dt = models.DateTimeField(auto_now=True, blank=True)
    acquired_dt = models.DateTimeField(null=True, blank=True)
    expire_dt = models.DateTimeField(null=True, blank=True)
    lifespan = models.DurationField(null=True, blank=True)
    
    def __str__(self):
        return self.name
    #add validator to check available quantity and used quantity does not exceed total quantity

class Image(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE,related_name='image')
    name = models.CharField(max_length=200, null=True, blank=True)
    image = models.ImageField(upload_to=IMAGE_FILE_PATH)
    def __str__(self):
        return self.name
    def delete(self, *args, **kwargs):
        if(self.image):
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)
    
class Note(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, null=True, blank=True)
    text = models.TextField()
    updated_dt = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.text

class WebSource(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    url = models.URLField()
    name = models.CharField(max_length=200,null=True, blank=True)
    description = models.TextField(null= True, blank=True)
    updated_dt = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name
    
class WeeklyReminder(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE,related_name='weekly_reminder')
    updated_dt = models.DateTimeField(auto_now=True)
    acknowledged_dt = models.DateTimeField(null=True, blank=True)
    time = models.TimeField()
    monday = models.BooleanField()
    tuesday = models.BooleanField()
    wednesday = models.BooleanField()
    thursday = models.BooleanField()
    friday = models.BooleanField()
    saturday = models.BooleanField()
    sunday = models.BooleanField()

class DateReminder(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE,related_name='date_reminder')
    reminder_dt = models.DateTimeField()
    updated_dt = models.DateTimeField(auto_now=True)
    acknowledged_dt = models.DateTimeField(null=True, blank=True)
    reoccurring = models.BooleanField()
    reoccurring_interval = models.IntegerField(null=True, blank=True)