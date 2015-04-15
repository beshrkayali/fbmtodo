# Simple TODO app

![Screenshot](/screenshot.png?raw=true "Screenshot")

## Getting started

- Clone project & create/activate a new virtual env
    
    virtualenv fbmtodo
    cd fbmtodo && source bin/activate
    git clone https://github.com/beshrkayali/fbmtodo.git src

- Install requirements & sync db
    
    (fbmtodo) cd src
    (fbmtodo) pip install -r requirements.txt
    (fbmtodo) python manage.py syncdb

- Start project:
    
    (fbmtodo) python manage.py runserver


## Tests

- Test project by running:

    (fbmtodo) python manage.py test


## License

MIT