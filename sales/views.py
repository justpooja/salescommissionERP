from django.contrib.auth.models import User
from django.db.models import Count, Sum

from rest_framework import viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from .models import Customer, Product, Sale
from .serializers import (
    CustomerSerializer,
    ProductSerializer,
    SaleSerializer,
)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated

        return (
            request.user.is_authenticated
            and request.user.is_superuser
        )


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            queryset = Sale.objects.all()
        else:
            queryset = Sale.objects.filter(
                salesperson=self.request.user
            )

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            queryset = queryset.filter(
                sale_date__date__gte=start_date
            )

        if end_date:
            queryset = queryset.filter(
                sale_date__date__lte=end_date
            )

        return queryset

    def perform_create(self, serializer):
        if self.request.user.is_superuser:
            serializer.save()
        else:
            serializer.save(
                salesperson=self.request.user
            )

    def perform_update(self, serializer):
        if self.request.user.is_superuser:
            serializer.save()
        else:
            serializer.save(
                salesperson=self.request.user
            )


class StaffUserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response([])

        users = User.objects.filter(
            is_staff=True,
            is_active=True
        )

        data = [
            {
                'id': user.id,
                'username': user.username,
            }
            for user in users
        ]

        return Response(data)


class CommissionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.is_superuser:
            sales = Sale.objects.all()
        else:
            sales = Sale.objects.filter(
                salesperson=request.user
            )

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            sales = sales.filter(
                sale_date__date__gte=start_date
            )

        if end_date:
            sales = sales.filter(
                sale_date__date__lte=end_date
            )

        summary = sales.aggregate(
            total_sales=Count('id'),
            total_sales_amount=Sum('total_amount'),
            total_commission=Sum('commission'),
            total_quantity=Sum('quantity'),
        )

        by_salesperson = (
            sales
            .values(
                'salesperson__id',
                'salesperson__username',
            )
            .annotate(
                sales_count=Count('id'),
                sales_amount=Sum('total_amount'),
                commission=Sum('commission'),
                quantity=Sum('quantity'),
            )
            .order_by('-commission')
        )

        salesperson_data = []

        for item in by_salesperson:
            salesperson_data.append({
                'id': item['salesperson__id'],
                'username': (
                    item['salesperson__username']
                    or 'Not assigned'
                ),
                'sales_count': item['sales_count'],
                'sales_amount': item['sales_amount'] or 0,
                'commission': item['commission'] or 0,
                'quantity': item['quantity'] or 0,
            })

        return Response({
            'summary': {
                'total_sales': summary['total_sales'] or 0,
                'total_sales_amount': (
                    summary['total_sales_amount'] or 0
                ),
                'total_commission': (
                    summary['total_commission'] or 0
                ),
                'total_quantity': (
                    summary['total_quantity'] or 0
                ),
            },
            'by_salesperson': salesperson_data,
        })


class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.is_superuser:
            sales = Sale.objects.all()
        else:
            sales = Sale.objects.filter(
                salesperson=request.user
            )

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            sales = sales.filter(
                sale_date__date__gte=start_date
            )

        if end_date:
            sales = sales.filter(
                sale_date__date__lte=end_date
            )

        summary = sales.aggregate(
            total_sales=Count('id'),
            total_revenue=Sum('total_amount'),
            total_commission=Sum('commission'),
            total_quantity=Sum('quantity'),
        )

        top_products = (
            sales
            .values(
                'product__id',
                'product__name',
            )
            .annotate(
                sales_count=Count('id'),
                quantity=Sum('quantity'),
                revenue=Sum('total_amount'),
            )
            .order_by('-revenue')[:5]
        )

        top_customers = (
            sales
            .values(
                'customer__id',
                'customer__name',
            )
            .annotate(
                sales_count=Count('id'),
                quantity=Sum('quantity'),
                revenue=Sum('total_amount'),
            )
            .order_by('-revenue')[:5]
        )

        by_salesperson = (
            sales
            .values(
                'salesperson__id',
                'salesperson__username',
            )
            .annotate(
                sales_count=Count('id'),
                revenue=Sum('total_amount'),
                commission=Sum('commission'),
            )
            .order_by('-revenue')
        )

        return Response({
            'summary': {
                'total_sales': summary['total_sales'] or 0,
                'total_revenue': summary['total_revenue'] or 0,
                'total_commission': (
                    summary['total_commission'] or 0
                ),
                'total_quantity': (
                    summary['total_quantity'] or 0
                ),
            },
            'top_products': [
                {
                    'id': item['product__id'],
                    'name': item['product__name'],
                    'sales_count': item['sales_count'],
                    'quantity': item['quantity'] or 0,
                    'revenue': item['revenue'] or 0,
                }
                for item in top_products
            ],
            'top_customers': [
                {
                    'id': item['customer__id'],
                    'name': item['customer__name'],
                    'sales_count': item['sales_count'],
                    'quantity': item['quantity'] or 0,
                    'revenue': item['revenue'] or 0,
                }
                for item in top_customers
            ],
            'by_salesperson': [
                {
                    'id': item['salesperson__id'],
                    'username': (
                        item['salesperson__username']
                        or 'Not assigned'
                    ),
                    'sales_count': item['sales_count'],
                    'revenue': item['revenue'] or 0,
                    'commission': item['commission'] or 0,
                }
                for item in by_salesperson
            ],
        })