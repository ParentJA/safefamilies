Feature: Users have profiles

  Scenario: 1. Setup

    Given I empty my "auth.User" table
    And I load the following rows for "auth.User":
      | id | username | password | email             | first_name | last_name |
      | 1  | Jason    | pAssw0rd | jason@example.com | Jason      | Parent    |

    And I empty my "users.UserProfile" table
    And I load the following rows for "users.UserProfile":
      | user_id |
      | 1       |

  Scenario: 2. Getting a user profile

    Given I log in as "Jason"

    When I send a request for a user profile

    Then I get a response with the following dict:
      | first_name | last_name | photo                      |
      | Jason      | Parent    | /media/photos/no-image.jpg |
