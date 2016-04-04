Feature: Users have profiles

  Scenario: Setup

    Given I empty my "auth.User" table
    And I add the following rows for "auth.User":
      | id | username | email             | first_name | last_name |
      | 1  | Jason    | jason@example.com | Jason      | Parent    |

    And I empty my "users.UserProfile" table
    And I add the following rows for "users.UserProfile":
      | user_id |
      | 1       |

  Scenario: Getting a user profile

    Given I log in as "Jason"
    When I send a request for a user profile
    Then I get a response with the following dict:
      | first_name | last_name | photo                      |
      | Jason      | Parent    | /media/photos/no-image.jpg |
