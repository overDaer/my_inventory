from pathlib import Path
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

RESOURCE_FILE_PATH = Path(__file__).parent.parent / 'resource'
IMAGE_FILE_PATH = RESOURCE_FILE_PATH / 'image'
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
    Item = models.ForeignKey(Item, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    image = models.ImageField(upload_to=IMAGE_FILE_PATH)
    def __str__(self):
        return self.name
    
class Note(models.Model):
    Item = models.ForeignKey(Item, on_delete=models.CASCADE)
    text = models.TextField()
    updated_dt = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.text

class WebSource(models.Model):
    Item = models.ForeignKey(Item, on_delete=models.CASCADE)
    url = models.URLField()
    name = models.CharField(max_length=200,null=True, blank=True)
    description = models.TextField(null= True, blank=True)
    updated_dt = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name
    
class Reminder(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    reminder_dt = models.DateTimeField()
    reoccuring = models.BooleanField()
    by_day = models.BooleanField(null=True, blank=True)
    by_week = models.BooleanField(null=True, blank=True)
    days = models.JSONField(default=list, null=True, blank=True)
    
class Character(models.Model):
    name = models.CharField(max_length=200)
    dob = models.DateField(null=True, blank=True)
    height = models.DecimalField(max_digits=3,decimal_places=2, null=True, blank=True)
    gender = models.CharField(max_length=50, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    def __str__(self):
        return self.name
    
class Stats(models.Model):
    character = models.ForeignKey(Character,on_delete=models.CASCADE)
    wisdom = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    strength = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    intelligence = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    personality = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    endurance = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    luck = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    agility = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])