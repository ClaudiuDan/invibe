from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

@login_required
def home(request):
    user = request.user
    # return JsonResponse({'email':user.email})
    return render(request, "home.html", {'user': user})
