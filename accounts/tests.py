from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class AuthenticationAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_me_requires_authentication(self):
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, 403)

    def test_login_returns_user_data(self):
        response = self.client.post(
            '/api/auth/login/',
            {
                'username': 'testuser',
                'password': 'testpass123',
            },
            format='json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['role'], 'Staff')

# Create your tests here.
