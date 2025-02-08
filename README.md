# Event Scheduler

A powerful and intuitive event scheduling application that helps you manage your events with ease. The application provides seamless integration with Google Calendar while maintaining local storage functionality for offline access.

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

- **Google Calendar Integration**
  - Automatic synchronization with Google Calendar
  - Events created in the app appear in your Google Calendar
  - Changes and deletions are reflected in Google Calendar

- **Offline Support**
  - Local storage ensures your events persist even without internet
  - Continue creating and managing events offline

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
   - Timezone conversion functionality
   - Real-time countdown calculations
   - Automatic IST conversion for cross-timezone events

### APIs Used

1. **Google Calendar API**
   - Purpose: Synchronize events with Google Calendar
   - Features used:
     - Event creation
     - Event deletion
     - Event updates
   - Integration: Uses gapi client library for API interactions

2. **TimeZoneDB API**
   - Purpose: Provide timezone information
   - Features used:
     - List of available timezones
     - Timezone conversion

3. **Local Storage API**
   - Purpose: Offline data persistence
   - Features used:
     - Event storage
     - Data retrieval
     - State management
   - Implementation:
     ```javascript
     localStorage.setItem('events', JSON.stringify(events));
     events = JSON.parse(localStorage.getItem('events')) || [];
     ```

## Setup and Configuration

1. Clone the repository
2. Set up Google Calendar API credentials:
   - Create a project in Google Cloud Console
   - Enable Google Calendar API
   - Create API key and OAuth client ID
   - Update `CLIENT_ID` and `API_KEY` in `script.js`

3. Set up TimeZoneDB API:
   - Get API key from TimeZoneDB
   - Update the API key in the loadTimezones function
