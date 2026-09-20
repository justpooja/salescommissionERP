from django.contrib import admin
from .models import Customer, Product, Sale


admin.site.register(Customer)
admin.site.register(Product)


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
    'customer',
    'product',
    'salesperson',
    'quantity',
    'total_amount',
    'commission',
    'sale_date',
)
