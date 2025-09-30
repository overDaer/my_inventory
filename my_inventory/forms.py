from django import forms
from .models import *


class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = '__all__'

class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = '__all__'

