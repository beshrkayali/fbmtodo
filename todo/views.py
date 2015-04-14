from .api import UserSerializer

from django.contrib.auth import authenticate, login
from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


def app(request):
    return render(request,
                  "app.html",
                  {})


@api_view(['POST'])
def auth_signinup(request):
    """
    Simple api view to register or authenticate/log in.
    """

    valid_fields = [f.name for f in get_user_model()._meta.fields]
    serialized = UserSerializer(data=request.DATA)

    provided_data = {
        field: data
        for (field, data) in request.DATA.items() if field in valid_fields
    }

    if serialized.is_valid():
        # Create user
        user = get_user_model().objects.create_user(
            **provided_data
        )
        user = authenticate(**provided_data)
        # Also log user in
        login(request, user)

        return Response(
            UserSerializer(instance=user).data, status=status.HTTP_201_CREATED
        )
    else:
        # Try to autenticate
        if 'email' in provided_data and 'password' in provided_data:
            user = authenticate(**provided_data)

            if user is not None:
                if user.is_active:
                    login(request, user)
                    return Response(
                        {'auth': 'Logged in!'},
                        status=status.HTTP_200_OK
                    )
                else:
                    return Response(
                        {'auth': 'Inactive account.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            else:
                return Response(
                    {'auth': 'Email/password combo is incorrect.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # Otherwise, just
        return Response(
            serialized._errors, status=status.HTTP_400_BAD_REQUEST
        )
