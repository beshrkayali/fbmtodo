from django.conf.urls import include, url
from django.contrib import admin

from todo.api import (TodoListViewset, TodoItemViewset)
from rest_framework import routers

from todo import views

# Register API namespaces
router = routers.DefaultRouter()

router.register(prefix=r'todolists',
                viewset=TodoListViewset,
                base_name='todolists')

router.register(prefix=r'todos',
                viewset=TodoItemViewset,
                base_name='todos')


urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),

    # API
    url(r'^api/', include(router.urls)),

    # API Auth
    url(r'^api-auth/',
        include('rest_framework.urls',
                namespace='rest_framework')),

    url(r'^authenticate/$', views.auth_signinup, name='authenticate'),

    # Main page
    url(r'^$', views.app, name='home'),
]
