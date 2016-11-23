Feature: Change password


  Scenario: 1. Setup

    Given I empty my "auth.User" table
    And I create a new user with the following parameters:
      | username | password  | email             | first_name | last_name |
      | Jason    | pAssw0rd! | jason@example.com | Jason      | Parent    |


  Scenario Outline: 2. A user can change his password

    Given I log in as "Jason"

    And I create request data:
      | old_password   | new_password   |
      | <old_password> | <new_password> |

    When I post named URL "users:change_password"

    Then I get a response with the status code "200"

    Examples:
      | old_password | new_password |
      | pAssw0rd!    | pAssw0rd#    |
      | pAssw0rd#    | pAssword#    |
      | pAssword#    | pAssw0rd!    |


  Scenario Outline: 3. A user can get errors when attempting to change his password

    Given I log in as "Jason"

    And I create request data:
      | old_password   | new_password   |
      | <old_password> | <new_password> |

    When I post named URL "users:change_password"

    Then an exception is raised with detail "<detail>"

    Examples:
      | old_password | new_password | detail                                                       |
      |              | password     | You must provide both the old password and the new password. |
      | pAssw0rd!    |              | You must provide both the old password and the new password. |
      | INVALID      | pAssw0rd!    | The old password is not correct.                             |
      | pAssw0rd!    | password     | The new password is not valid.                               |
