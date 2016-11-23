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

    When I get named URL "users:profile_retrieve_update"

    Then I get a response with the following dict:
      | first_name | last_name | photo                      |
      | Jason      | Parent    | /media/photos/no-image.jpg |


  Scenario Outline: 3. A user can update his user profile

    Given I log in as "Jason"

    And I create request data:
      | first_name   | last_name   | address_1   | address_2   | city   | state   | zip_code   | phone_number   |
      | <first_name> | <last_name> | <address_1> | <address_2> | <city> | <state> | <zip_code> | <phone_number> |

    When I put named URL "users:profile_retrieve_update"

    Then I get a response with the following dict:
      | first_name   | last_name   | address_1   | address_2   | city   | state   | zip_code   | phone_number   |
      | <first_name> | <last_name> | <address_1> | <address_2> | <city> | <state> | <zip_code> | <phone_number> |

    Examples:
      | first_name | last_name | address_1    | address_2   | city       | state | zip_code | phone_number |
      | Jason      | Parent    | 310 P Street | Apartment 1 | Washington | DC    | 20001    | 860-977-7458 |
