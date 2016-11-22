# Standard library imports.
from itertools import izip_longest

# Django imports.
import django
from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import Client

# Third-party imports.
from lettuce import before, step, world
from nose.tools import assert_dict_contains_subset, assert_dict_equal, assert_equal

__author__ = 'Jason Parent'

User = None


@before.all
def setup():
    global User
    django.setup()
    User = get_user_model()


@before.each_scenario
def scenario_setup(scenario):
    world.client = Client()


@step(r'I empty my "(.+)" table')
def empty_database_table(step, model_path):
    model = apps.get_model(*model_path.split('.'))

    # Some model managers do not have a delete() method (e.g. django.contrib.auth.User).
    try:
        model.objects.delete()
    except AttributeError:
        model.objects.all().delete()


@step(r'I add the following rows for "(.+)":')
def add_database_table_rows(step, model_path):
    model = apps.get_model(*model_path.split('.'))
    model_objects = [model(**row) for row in step.hashes]
    model.objects.bulk_create(model_objects)


@step(r'I log in as "(.+)"$')
def log_in_user(step, username):
    user = User.objects.get(username=username)
    world.client.force_login(user)


@step(r'I get a response with the following dict:')
def get_response_with_dict(step):
    assert_dict_contains_subset(step.hashes.first, world.response.json())


@step(r'I get a response with the following list:')
def get_response_with_list(step):
    for expected, actual in izip_longest(list(step.hashes), world.response.json()):
        assert_dict_contains_subset(expected, actual)


@step(r'I get a response with the status code "(.+)"')
def get_response_with_status_code(step, status_code):
    assert_equal(world.response.status_code, int(status_code))
