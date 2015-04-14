from django.contrib import admin
from todo.models import TodoList, TodoItem, User

admin.site.register(User)
admin.site.register(TodoList)
admin.site.register(TodoItem)
