# app-shell Specification

## Purpose

Makes the product usable as an installable, offline, phone-first web app with discreet "Enjoy Life" branding and data kept on the device.

## Requirements

### Requirement: Discreet title
The app SHALL be named "Enjoy Life" everywhere the name appears (page title, Home Screen label, splash), and SHALL NOT use the words workout, fitness, or gym in its name or primary heading.

#### Scenario: Home Screen label
- **WHEN** the user adds the app to the iPhone Home Screen
- **THEN** the label is "Enjoy Life"

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
