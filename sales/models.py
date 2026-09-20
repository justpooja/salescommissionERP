from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class Sale(models.Model):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE
    )

    salesperson = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        editable=False
    )

    commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        editable=False
    )

    sale_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.product.price * self.quantity
        self.commission = self.total_amount * Decimal('0.10')

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.customer.name} - {self.product.name}"