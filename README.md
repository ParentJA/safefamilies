# Safefamilies

## Setup

```bash
local:~ user$ mkvirtualenv dc127resources
(example)local:~ user$ cd ~/Projects
(example)local:Projects user$ git clone https://github.com/ParentJA/safefamilies.git
(example)local:Projects user$ cd safefamilies
(example)local:example-django-redis user$ pip install -r requirements.txt
(example)local:example-django-redis user$ python manage.py migrate
(example)local:example-django-redis user$ python manage.py createsuperuser
(example)local:example-django-redis user$ python manage.py runserver
```