# Third-party imports.
from lettuce import step, world

__author__ = 'Jason Parent'


@step(r'I send a request for a user profile')
def send_request_user_profile(step):
    world.response = world.client.get('/api/v1/users/user_profile/')
