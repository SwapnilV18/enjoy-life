# Spec Delta

## MODIFIED Requirements

### Requirement: Streak count display
The system SHALL show the streak count as the number of workout days in the current unbroken run, together with the week progress, on the home and completion screens. On the home screen the streak SHALL be the most prominent element after the app masthead and SHALL appear above the Start control, with week progress also shown as five day markers, one filled per workout day this week.

#### Scenario: Streak increments
- **GIVEN** the streak is 4
- **WHEN** the user completes today's session
- **THEN** the streak shows 5

#### Scenario: Week rollover
- **WHEN** a new Monday begins and the previous week reached 5 workouts
- **THEN** the streak continues and week progress resets to 0 of 5

#### Scenario: Streak leads the home screen
- **WHEN** the home screen is shown
- **THEN** the streak number appears above the Start control and is visually larger than the recommendation text

#### Scenario: Week markers
- **GIVEN** 3 workout days this week
- **WHEN** the home screen is shown
- **THEN** 3 of the 5 week markers are filled and the text "3 of 5" is still available

#### Scenario: Zero streak
- **GIVEN** the streak is 0
- **WHEN** the home screen is shown
- **THEN** the streak area still appears, with an encouraging caption instead of a blank space
