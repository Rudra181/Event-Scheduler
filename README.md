# Event Scheduler

A powerful and intuitive event scheduling application that helps you manage your events with ease. The application provides offline-first functionality with comprehensive timezone support.

## Features

- **Event Creation**
  - Create events with title, description, date, and time
  - Set timezone for each event
  - Automatic conversion to Indian Standard Time (IST) for events in different timezones

- **Event Management**
  - View all scheduled events in a clean, card-based interface
  - Edit existing events
  - Delete events with confirmation
  - Real-time countdown timer for each event

- **Smart Notifications**
  - Automatic alerts when events are about to start
  - Visual countdown for upcoming events

- **Offline Support**
  - Local storage ensures your events persist even without internet
  - Continue creating and managing events offline

- **Comprehensive Timezone Support**
  - Support for all IANA timezones
  - Organized by regions for easy selection
  - Shows UTC offset for each timezone
  - Automatic timezone conversion

## Technical Implementation

### Architecture
The application is built using a modern web stack with vanilla JavaScript, focusing on simplicity and performance. Key architectural decisions include:

1. **Event Management**
   - Events are stored in browser's localStorage for persistence
   - Each event has a unique ID, title, description, datetime, and timezone
   - Real-time updates using setInterval for countdown timers

2. **UI Components**
   - Modular design with separate sections for event creation and listing
   - Modal system for confirmations and alerts
   - Responsive layout using CSS Grid and Flexbox

3. **Time Management**
   - Timezone conversion functionality using Moment.js
   - Real-time countdown calculations
   - Automatic IST conversion for cross-timezone events

### APIs Used

1. **Local Storage API**
   - Purpose: Offline data persistence
   - Features used:
     - Event storage
     - Data retrieval
     - State management
   - Implementation:
     ```javascript
     // Save events
     localStorage.setItem('events', JSON.stringify(events));
     
     // Retrieve events
     events = JSON.parse(localStorage.getItem('events')) || [];
     ```

2. **Moment.js Timezone API**
   - Purpose: Comprehensive timezone handling
   - Features used:
     - Complete IANA timezone database
     - Timezone conversion
     - Date formatting
     - UTC offset calculation
