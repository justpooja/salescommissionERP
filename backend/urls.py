from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def home(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'SalesFlow ERP backend is running.'
    })


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('sales.urls')),
    path('api/auth/', include('accounts.urls')),
]