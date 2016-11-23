# Standard library imports.
from collections import defaultdict
from contextlib import contextmanager
from itertools import izip_longest

# Django imports.
import django
from django.apps import apps
from django.contrib.auth import get_user_model

# Third-party imports.
from lettuce import before, step, world
from nose.tools import assert_dict_contains_subset, assert_dict_equal, assert_equal

from rest_framework.reverse import reverse
from rest_framework.test import APIClient

__author__ = 'Jason Parent'

User = None


@before.all
def setup():
    global User
    django.setup()
    User = get_user_model()


@before.each_scenario
def scenario_setup(scenario):
    world.client = APIClient()


@step(r'I empty my "(.+)" table$')
def empty_database_table(step, model_path):
    model = apps.get_model(*model_path.split('.'))
    model.objects.all().delete()


@step(r'I load the following rows for "(.+)":$')
def load_database_table_rows(step, model_path):
    model = apps.get_model(*model_path.split('.'))

    # Map foreign key fields by their names.
    fk_field_by_name = {field.name: field for field in model._meta.concrete_fields if
                        field.is_relation and field.name in step.keys}

    fk_field_names = fk_field_by_name.keys()

    # Map each list of foreign key field NKs to the foreign key field name.
    nk_list_by_name = {}
    for column in step.columns:
        name = column.keys()[0]
        if name in fk_field_names:
            nk_list_by_name[name] = column.get(name)

    # Map each model instance to its NK and then map that dictionary to its foreign key field name.
    model_by_nk_by_name = defaultdict(dict)
    for name, nk_list in nk_list_by_name.items():
        fk_field_model = fk_field_by_name[name].foreign_related_fields[0].model
        fk_field_model_list = list(fk_field_model.objects.filter(nk__in=nk_list))
        model_by_nk_by_name[name] = {model.nk: model for model in fk_field_model_list}

    # Retrieve the appropriate models for foreign key fields and create model objects.
    model_objects = []
    for row in step.hashes:
        data = {name: model_by_nk_by_name[name][value] if name in model_by_nk_by_name else value
                for name, value in row.items()}
        model_objects.append(model(**data))

    # Create the models.
    model.objects.bulk_create(model_objects)


@step(r'I create a new user with the following parameters:$')
def create_user(step_):
    User.objects.create_user(**step_.hashes.first)


@step(r'I log in as "(.+)"$')
def log_in_user(step, username):
    user = User.objects.get(username=username)
    world.client.force_login(user)


@step(r'I get a response with the following dict:')
def get_response_with_dict(step):
    first = step.hashes[0] if isinstance(step.hashes, list) else step.hashes.first
    assert_dict_contains_subset(first, world.response.data)


@step(r'I get a response with the following list:')
def get_response_with_list(step):
    for expected, actual in izip_longest(list(step.hashes), world.response.data):
        assert_dict_contains_subset(expected, actual)


@step(r'I get a response with the status code "(.+)"')
def get_response_with_status_code(step, status_code):
    assert_equal(world.response.status_code, int(status_code))


@step(r'I create request params:$')
def create_request_params(step):
    from lettuce.django.steps.models import hash_data
    world.request_params = hash_data(step.hashes.first)


@contextmanager
def get_url_with_request_params(url):
    request_params = getattr(world, 'request_params', {})
    yield world.client.get(url, data=request_params)
    if hasattr(world, 'request_params'):
        delattr(world, 'request_params')


@contextmanager
def get_named_url_with_request_params(named_url, **kwargs):
    request_params = getattr(world, 'request_params', {})
    url = reverse(named_url, kwargs=kwargs)
    yield world.client.get(url, data=request_params)
    if hasattr(world, 'request_params'):
        delattr(world, 'request_params')


@step(r'I create request data:$')
def create_request_data(step):
    from lettuce.django.steps.models import hash_data
    first = step.hashes[0] if isinstance(step.hashes, list) else step.hashes.first
    world.request_data = hash_data(first)


@contextmanager
def post_named_url_with_request_data(named_url, **kwargs):
    request_data = getattr(world, 'request_data', {})
    url = reverse(named_url, kwargs=kwargs)
    yield world.client.post(url, data=request_data)
    if hasattr(world, 'request_data'):
        delattr(world, 'request_data')


@contextmanager
def put_named_url_with_request_data(named_url, **kwargs):
    request_data = getattr(world, 'request_data', {})
    url = reverse(named_url, kwargs=kwargs)
    yield world.client.put(url, data=request_data)
    if hasattr(world, 'request_data'):
        delattr(world, 'request_data')


@step(r'I get URL "([^"]+)"$')
def get_url(step, url):
    with get_url_with_request_params(url) as response:
        world.response = response


@step(r'I get named URL "([^"]+)"$')
def get_named_url(step, named_url, **kwargs):
    with get_named_url_with_request_params(named_url, **kwargs) as response:
        world.response = response


@step(r'I get named URL "([^"]+)" with the following parameters:$')
def get_named_url_with_params(step, named_url):
    kwargs = {}
    for data in step.hashes:
        kwargs.update(data)
    get_named_url(step, named_url, **kwargs)


@step(r'I post named URL "([^"]+)"$')
def post_named_url(step, named_url, **kwargs):
    with post_named_url_with_request_data(named_url, **kwargs) as response:
        world.response = response


@step(r'I post named URL "([^"]+)" with the following parameters:$')
def post_named_url_with_params(step, named_url):
    kwargs = {}
    for data in step.hashes:
        kwargs.update(data)
    post_named_url(step, named_url, **kwargs)


@step(r'I put named URL "([^"]+)"$')
def put_named_url(step, named_url, **kwargs):
    with put_named_url_with_request_data(named_url, **kwargs) as response:
        world.response = response


@step(r'I put named URL "([^"]+)" with the following parameters:$')
def put_named_url_with_params(step, named_url):
    kwargs = {}
    for data in step.hashes:
        kwargs.update(data)
    put_named_url(step, named_url, **kwargs)


@step(r'response content element "([^"]+)" identified by "([^"]+)" has:$')
def response_content_element_has(step, element, identifier):
    from lettuce.django.steps.models import hashes_data

    element_data = world.response.data[element]
    element_data_by_id = {data.get(identifier): dict(data) for data in element_data}

    # Transform tabular data.
    step_data_by_id = {data.get(identifier): data for data in hashes_data(step)}

    assert_equal(len(element_data_by_id), len(step_data_by_id))

    for identifier, data in step_data_by_id.items():
        assert_dict_contains_subset(actual=element_data_by_id[identifier], expected=data)


@step(r'an exception is raised with detail "([^"]+)"$')
def exception_raised(step_, detail):
    assert_equal(world.response.data['detail'], detail)
