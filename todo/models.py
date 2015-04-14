from django.db import models
# from django.contrib.auth.models import User
from django.contrib.auth.models import (BaseUserManager,
                                        AbstractBaseUser)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(email=self.normalize_email(email))

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(email, password=password)

        user.is_admin = True

        user.save(using=self._db)

        return user


class User(AbstractBaseUser):
    email = models.EmailField(max_length=255, unique=True)
    joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'

    objects = UserManager()

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email.split("@")[0]

    @property
    def is_superuser(self):
        return self.is_admin

    @property
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin

    def __unicode__(self):
        return self.email


class TodoList(models.Model):
    owner = models.ForeignKey(User, related_name="todolists")
    name = models.CharField(max_length=256)
    desc = models.TextField(null=True, blank=True)

    def __unicode__(self):
        return self.name


PRIORITIES = ((1, 'Low'),
              (2, 'Medium'),
              (3, 'High')
              )


class TodoItem(models.Model):
    owner = models.ForeignKey(User, related_name='todos')
    todolist = models.ForeignKey(TodoList, related_name='todos')
    done = models.BooleanField(default=False)
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
