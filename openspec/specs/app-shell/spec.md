# app-shell Specification

## Purpose

Makes the product usable as an installable, offline, phone-first web app with discreet "Enjoy Life" branding and data kept on the device.

## Requirements

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

### Requirement: Installable on iPhone
The app SHALL be installable to the iPhone Home Screen and SHALL launch full-screen without browser chrome, with a layout designed for portrait phone use including safe areas.

#### Scenario: Launch from Home Screen
- **WHEN** the user opens the installed icon
- **THEN** the app opens full-screen in portrait layout

### Requirement: Offline use
After first load the app SHALL work fully without a network connection.

#### Scenario: Airplane mode
- **GIVEN** the app has been loaded once
- **WHEN** the device is offline and the user runs a whole session
- **THEN** everything including animations works

### Requirement: Local persistence
The system SHALL store all sessions, sets, and streak data on the device only, and SHALL NOT require an account or send data to a server.

#### Scenario: Data survives restart
- **WHEN** the app is closed and reopened
- **THEN** past sessions, streak, and progression are intact
