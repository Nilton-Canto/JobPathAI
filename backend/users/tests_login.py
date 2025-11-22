from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
import json


class LoginViewTests(TestCase):
    """Testes unitários para o endpoint de login (`LoginView`).

    Casos cobertos:
    - GET no endpoint retorna mensagem de informação
    - login com sucesso (status 200)
    - login com senha incorreta (status 400)
    - login de usuário inexistente (status 400)
    - JSON malformado (status 400)
    - campos faltando (status 400)
    """

    def setUp(self):
        self.client = Client()
        self.url = reverse('login')
        self.username = 'testuser'
        self.password = 'secret123'
        self.user = User.objects.create_user(username=self.username, password=self.password, email='test@example.com')

    def test_get_login_endpoint(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 200)
        # A view atualmente renderiza um template HTML na requisição GET,
        # portanto o Content-Type será text/html e não application/json.
        self.assertIn('text/html', resp['Content-Type'])
        content = resp.content.decode('utf-8')
        # Verifica rapidamente se o HTML contém algo relacionado a login
        self.assertIn('login', content.lower())

    def test_login_success(self):
        payload = {'username': self.username, 'password': self.password}
        resp = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # A view retorna JSON com as chaves 'success' e 'message',
        # ex: {'success': True, 'message': 'Login realizado com sucesso'}
        self.assertTrue(data.get('success') is True)
        self.assertEqual(data.get('message'), 'Login realizado com sucesso')

    def test_login_wrong_password(self):
        payload = {'username': self.username, 'password': 'wrongpass'}
        resp = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn('error', data)

    def test_login_nonexistent_user(self):
        payload = {'username': 'nope', 'password': 'whatever'}
        resp = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn('error', data)

    def test_login_malformed_json(self):
        resp = self.client.post(self.url, data='not a json', content_type='application/json')
        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn('error', data)

    def test_login_missing_fields(self):
        payload = {}
        resp = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn('error', data)
