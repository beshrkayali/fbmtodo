from .models import TodoList, TodoItem

from rest_framework import serializers, viewsets
from rest_framework import permissions

from django.contrib.auth import get_user_model


# Generic permission to get user's own objects
class OwnerOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class BaseTodoViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, OwnerOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()


# Todo Item Serializer / Viewset
class TodoItemSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super(TodoItemSerializer, self).__init__(*args, **kwargs)

        if hasattr(self, 'user'):
            self.fields['todolist'] = serializers.PrimaryKeyRelatedField(
                queryset=TodoList.objects.filter(owner=self.user)
            )

    class Meta:
        model = TodoItem
        fields = ('id', 'todolist', 'done', 'text',
                  'priority', 'timestamp', 'lastedit')


class TodoItemViewset(BaseTodoViewset):

    def get_serializer_class(self):
        class Serializer(TodoItemSerializer):
            user = self.request.user

        return Serializer

    def get_queryset(self):
        return self.request.user.todos.all()


# Todo List Serializer / Viewset
class TodoListSerializer(serializers.ModelSerializer):
    todos = TodoItemSerializer(many=True, read_only=True)

    class Meta:
        model = TodoList
        fields = ('id', 'name', 'todos')


class TodoListViewset(BaseTodoViewset):
    serializer_class = TodoListSerializer

    def get_queryset(self):
        return self.request.user.todolists.all()
