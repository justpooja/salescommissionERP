from rest_framework.routers import DefaultRouter

from .views import (
    CustomerViewSet,
    ProductViewSet,
    SaleViewSet,
    StaffUserViewSet,
    CommissionViewSet,
    ReportsViewSet,
)

router = DefaultRouter()

router.register('customers', CustomerViewSet)
router.register('products', ProductViewSet)

router.register(
    'sales',
    SaleViewSet,
    basename='sales'
)

router.register(
    'staff-users',
    StaffUserViewSet,
    basename='staff-users'
)

router.register(
    'commission',
    CommissionViewSet,
    basename='commission'
)
router.register(
    'reports',
    ReportsViewSet,
    basename='reports'
)
urlpatterns = router.urls