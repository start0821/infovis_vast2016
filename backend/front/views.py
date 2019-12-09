from django.shortcuts import render

# Create your views here.
def proxy_data(request):
    return render(request,"front/proxy_analysis.html")

def bldg_data(request):
    return render(request,"front/bldg_analysis.html")

def relation(request):
    return render(request,"front/relation_analysis.html")