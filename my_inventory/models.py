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

class Category(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(null=True)

class Group(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)

class Item(models.Model):
    name = models.CharField(max_length=200)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    total_quantity = models.IntegerField(validators=[MinValueValidator(QTY_MIN),MaxValueValidator(QTY_MAX)],null=True)
    available_quantity = models.IntegerField(validators=[MinValueValidator(QTY_MIN)],null=True)
    used_quantity = models.IntegerField(validators=[MinValueValidator(QTY_MIN)], null=True)
    description = models.TextField(null=True)
    updated_dt = models.DateTimeField(auto_now=True)
    acquired_dt = models.DateTimeField(null=True)
    expire_dt = models.DateTimeField(null=True)
    lifespan = models.DurationField(null=True)
    #add validator to check available quantity and used quantity does not exceed total quantity

class Image(models.Model):
    Item = models.ForeignKey(Item, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    image = models.ImageField(upload_to=IMAGE_FILE_PATH)

class Note(models.Model):
    Item = models.ForeignKey(Item, on_delete=models.CASCADE)
    text = models.TextField()
    updated_dt = models.DateTimeField(auto_now=True)

class WebSource(models.Model):
    Item = models.ForeignKey(Item, on_delete=models.CASCADE)
    url = models.URLField()
    name = models.CharField(max_length=200,null=True)
    description = models.TextField(null= True)
    updated_dt = models.DateTimeField(auto_now=True)

class Reminder(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    reminder_dt = models.DateTimeField()
    reoccuring = models.BooleanField()
    by_day = models.BooleanField(null=True)
    by_week = models.BooleanField(null=True)
    days = models.JSONField(default=list, null=True)
    
class Character(models.Model):
    name = models.CharField(max_length=200)
    dob = models.DateField(null=True)
    height = models.DecimalField(max_digits=3,decimal_places=2, null=True)
    gender = models.CharField(max_length=50, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True)

class Stats(models.Model):
    user = models.ForeignKey(Character,on_delete=models.CASCADE)
    wisdom = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    strength = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    intelligence = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    personality = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    endurance = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    luck = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])
    agility = models.IntegerField(validators=[MinValueValidator(STAT_MIN),MaxValueValidator(STAT_MAX)])