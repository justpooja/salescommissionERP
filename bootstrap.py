import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django

django.setup()

from django.contrib.auth.models import User
from sales.models import Customer, Product, Sale


admin_password = os.getenv('RENDER_ADMIN_PASSWORD')
staff_password = os.getenv('RENDER_STAFF_PASSWORD')

if not admin_password or not staff_password:
    raise RuntimeError(
        'RENDER_ADMIN_PASSWORD and RENDER_STAFF_PASSWORD must be set.'
    )


admin, created = User.objects.get_or_create(
    username='pwooja'
)

admin.is_staff = True
admin.is_superuser = True
admin.is_active = True
admin.set_password(admin_password)
admin.save()


staff, created = User.objects.get_or_create(
    username='staf1'
)

staff.is_staff = True
staff.is_superuser = False
staff.is_active = True
staff.set_password(staff_password)
staff.save()


customers = [
    {
        'name': 'pricilla j',
        'email': 'pricilla@example.com',
        'phone': '9876543210',
        'address': 'Kochi',
    },
    {
        'name': 'rahul mehta',
        'email': 'rahul@example.com',
        'phone': '9876543211',
        'address': 'Kochi',
    },
    {
        'name': 'Anjali Nair',
        'email': 'anjali@example.com',
        'phone': '9876543212',
        'address': 'Kochi',
    },
]

for data in customers:
    Customer.objects.get_or_create(
        email=data['email'],
        defaults=data,
    )


products = [
    {
        'name': 'Wireless headphones',
        'price': 999,
    },
    {
        'name': 'Keyboard',
        'price': 1200,
    },
    {
        'name': 'Mouse',
        'price': 650,
    },
]

for data in products:
    Product.objects.get_or_create(
        name=data['name'],
        defaults={'price': data['price']},
    )


pricilla = Customer.objects.get(email='pricilla@example.com')
rahul = Customer.objects.get(email='rahul@example.com')

headphones = Product.objects.get(name='Wireless headphones')
keyboard = Product.objects.get(name='Keyboard')

demo_sales = [
    {
        'customer': pricilla,
        'product': headphones,
        'quantity': 2,
        'salesperson': staff,
    },
    {
        'customer': rahul,
        'product': keyboard,
        'quantity': 2,
        'salesperson': staff,
    },
    {
        'customer': pricilla,
        'product': keyboard,
        'quantity': 3,
        'salesperson': staff,
    },
    {
        'customer': rahul,
        'product': headphones,
        'quantity': 1,
        'salesperson': staff,
    },
]

if not Sale.objects.exists():
    for data in demo_sales:
        Sale.objects.create(**data)

print('Render database bootstrap completed successfully.')
