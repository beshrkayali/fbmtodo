from django.db import models
from django.contrib.auth.models import User


class TodoList(models.Model):
    owner = models.ForeignKey(User, related_name="todolists")
    name = models.CharField(max_length=256)
    desc = models.TextField()

    def __unicode__(self):
        return self.name


PRIORITIES = ((1, 'Low'),
              (2, 'Medium'),
              (3, 'High')
              )


class TodoItem(models.Model):
    user = models.ForeignKey(User, related_name='todos')
    todolist = models.ForeignKey(TodoList, related_name='todos')
    text = models.TextField()
    priority = models.IntegerField(choices=PRIORITIES, default=1)
    timestamp = models.DateTimeField(auto_now_add=True)
    lastedit = models.DateTimeField(auto_now=True)

    @property
    def priority_text(self):
        return PRIORITIES[self.priority - 1][1]

    def __unicode__(self):
        return "({}) {}".format(self.priority_text,
                                self.text)
