# from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from todo.models import TodoList
import json


class AuthenticationTests(APITestCase):
    user_data = {
        'email': 'some@email.com',
        'password': 'top_secret'
    }

    def test_authentication_signup(self):
        """
        Make sure todolists can be retrevied
        """
        url = reverse('authenticate')

        response = self.client.post(url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_authentication_signin(self):
        """
        Make sure todolists can be retrevied
        """
        url = reverse('authenticate')

        # Sign up
        response = self.client.post(url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Sign in: success
        response = self.client.post(url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Sign in: fail
        self.user_data['password'] = 'password'
        response = self.client.post(url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TodoListsTests(APITestCase):
    user_data = {
        'email': 'some@email.com',
        'password': 'top_secret'
    }

    def setUp(self):
        user = get_user_model()
        user.objects.create(**self.user_data)

    def test_create_todolist(self):
        # Force authenticate
        self.client.force_authenticate(user=get_user_model().objects.first())

        # Create todolist
        url = reverse('todolists-list')
        data = {'name': 'Work'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(TodoList.objects.first().name, 'Work')

    def test_list_todolists(self):
        # Force authenticate
        self.client.force_authenticate(user=get_user_model().objects.first())

        # Create todolist
        url = reverse('todolists-list')
        data = {'name': 'Work'}
        self.client.post(url, data, format='json')

        # Check list

        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        rendered = response.render()
        self.assertEqual(
            rendered.content,
            '[{"id":1,"name":"Work","todos":[]}]'
        )

    def test_update_todolist(self):
        # Force authenticate
        self.client.force_authenticate(user=get_user_model().objects.first())

        # Create todolist
        url = reverse('todolists-list')
        data = {'name': 'Work'}
        resp1 = self.client.post(url, data, format='json')
        todolist_id = json.loads(resp1.render().content)['id']

        # Update text
        url2 = reverse('todolists-detail', args=(todolist_id,))
        resp2 = self.client.put(url2, {'name': 'Updated'}, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)

        # Get todolist again and check updated
        url3 = reverse('todolists-detail', args=(todolist_id,))
        resp3 = self.client.get(url3, format='json')
        content = json.loads(resp3.render().content)
        self.assertEqual(content['name'], 'Updated')

    def test_delete_todolist(self):
        # Force authenticate
        self.client.force_authenticate(user=get_user_model().objects.first())

        # Create todolist
        url = reverse('todolists-list')
        data = {'name': 'Work'}
        resp1 = self.client.post(url, data, format='json')
        todolist_id = json.loads(resp1.render().content)['id']

        # Delete todolist
        url2 = reverse('todolists-detail', args=(todolist_id,))
        resp2 = self.client.delete(url2)
        self.assertEqual(resp2.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TodoList.objects.count(), 0)

