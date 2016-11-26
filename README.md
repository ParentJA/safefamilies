# Safefamilies

## Setup

```bash
local:~ user$ mkvirtualenv safefamilies
(safefamilies)local:~ user$ cd ~/Projects
(safefamilies)local:Projects user$ git clone https://github.com/ParentJA/safefamilies.git
(safefamilies)local:Projects user$ cd safefamilies
(safefamilies)local:safefamilies user$ pip install -r requirements/local.txt
(safefamilies)local:safefamilies user$ python manage.py migrate --settings=settings.local
(safefamilies)local:safefamilies user$ python manage.py createsuperuser --settings=settings.local
(safefamilies)local:safefamilies user$ python manage.py runserver --settings=settings.local
```
