from django.shortcuts import render
from django.http import HttpResponse
from django.views import View
# Create your views here.

def index(request):
    return HttpResponse("Hello, welcome to your personal Inventory Management System!")

class InventoryView(View):
    def get(self, request):
        return HttpResponse("This is the main page of the Inventory Management System.")

