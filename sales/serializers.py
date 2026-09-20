from rest_framework import serializers

from .models import Customer, Product, Sale


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source='customer.name',
        read_only=True
    )

    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    salesperson_name = serializers.CharField(
        source='salesperson.username',
        read_only=True
    )

    quantity = serializers.IntegerField(
        min_value=1
    )

    class Meta:
        model = Sale
        fields = [
            'id',
            'customer',
            'customer_name',
            'salesperson',
            'salesperson_name',
            'product',
            'product_name',
            'quantity',
            'total_amount',
            'commission',
            'sale_date',
        ]

        read_only_fields = (
            'total_amount',
            'commission',
            'sale_date',
            'customer_name',
            'product_name',
            'salesperson_name',
        )