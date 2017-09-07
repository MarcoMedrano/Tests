Feature: Addition
    In order to avoid silly mistakes
    As a math fucking idiot
    I want to be told the sum of two numbers

@mytag
Scenario: Add two numbers
    Given I have opened the calculator
    Given I have entered 1 into the calculator
    And I press add
    And I have entered 1 into the calculator
    When I press equals
    Then the result should be 2 on the screen