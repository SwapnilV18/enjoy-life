# Spec Delta

## MODIFIED Requirements

### Requirement: Discreet title
The app SHALL be named "Enjoy Life" everywhere the name appears (page title, Home Screen label, splash), and SHALL NOT use the words workout, fitness, or gym in its name or primary heading. The landing screen SHALL display the name as a large masthead in which "Enjoy" and "Life" are equally prominent but styled differently.

#### Scenario: Home Screen label
- **WHEN** the user adds the app to the iPhone Home Screen
- **THEN** the label is "Enjoy Life"

#### Scenario: Landing masthead
- **WHEN** the landing screen is shown
- **THEN** "Enjoy" and "Life" appear as two large words in contrasting styles, and assistive technology reads the heading as "Enjoy Life"

#### Scenario: Reduced motion
- **GIVEN** the device prefers reduced motion
- **WHEN** the landing screen is shown
- **THEN** the masthead appears without animation
