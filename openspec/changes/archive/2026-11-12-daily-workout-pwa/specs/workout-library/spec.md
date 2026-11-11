# Spec Delta

## Purpose

Defines the six workout types, the exercises in each, how exercises are paired into supersets, and how each exercise is illustrated.

## ADDED Requirements

### Requirement: Six workout types
The system SHALL offer exactly these workout types: Jogging (HIIT), Back and Legs, Chest and Legs, Biceps and Shoulders, Triceps and Abs, and Yoga.

#### Scenario: Listing types
- **WHEN** the user views the workout choices
- **THEN** all six types are available and no other types appear

### Requirement: Exercises per type
Each workout type SHALL contain the following exercises: Back and Legs — pull-ups, squats, chest-supported row; Chest and Legs — incline bench press, incline fly, lunges; Biceps and Shoulders — curl, hammer curl, seated shoulder press, front raise, side raise; Triceps and Abs — dumbbell triceps pullover, dumbbell triceps extension, ab cycle, ab crunch, hanging abs; Yoga — cat-cow, superman, a cross pose, and further poses.

#### Scenario: Back and Legs contents
- **WHEN** a Back and Legs session is built
- **THEN** it contains pull-ups, squats, and chest-supported row

#### Scenario: Triceps and Abs contents
- **WHEN** a Triceps and Abs session is built
- **THEN** it contains dumbbell triceps pullover, dumbbell triceps extension, ab cycle, ab crunch, and hanging abs

### Requirement: Fixed prescriptions
Incline bench press SHALL always be included in Chest and Legs and SHALL be its first exercise, and lunges SHALL carry a target of 4 sets of 50.

#### Scenario: Incline bench always present
- **WHEN** any Chest and Legs session is built
- **THEN** incline bench press is included as the first exercise

#### Scenario: Lunge target
- **WHEN** lunges are shown
- **THEN** the target is displayed as 4 × 50

### Requirement: Superset pairing
For strength workouts the system SHALL group exercises into pairs shown together, pairing exercises of different muscle groups whenever the type contains more than one muscle group, and SHALL show a final unpaired exercise on its own.

#### Scenario: Mixed muscle pairing
- **WHEN** a Biceps and Shoulders session is built
- **THEN** each pair contains one biceps exercise and one shoulder exercise while both groups remain available

#### Scenario: Odd count
- **WHEN** a type has an odd number of exercises
- **THEN** the last exercise is shown alone

### Requirement: Jogging and yoga presentation
Jogging (HIIT) and Yoga sessions SHALL be presented as timed sequences without weight × reps fields.

#### Scenario: No set fields for yoga
- **WHEN** a Yoga session is running
- **THEN** no weight × reps fields are displayed

### Requirement: Animated exercise illustration
Every exercise SHALL have a looping animated illustration of a muscular figure performing it.

#### Scenario: Illustration visible
- **WHEN** an exercise is displayed in a session
- **THEN** its looping animation plays alongside its name
