Feature: Student Enrollment
  As a prospective student
  I want to register for an academic program
  So that I can start my admission process

  Scenario: Successful registration in a program
    Given I am on the enrollment page
    When I click "Start"
    Then I should be on the personal details step
    When I fill in my personal details:
      | fullName   | Juan Perez       |
      | email      | juan@example.com |
      | phone      | +573001234567    |
    And I click "Next"
    Then I should be on the program selection step
    When I select campus "Sede Principal", program "Auxiliar en Enfermería", and calendar "2026 – Auxiliar en Enfermería (Bogotá)"
    And I click "Next"
    Then I should be on the document upload step
    And I should see the required documents for the program
