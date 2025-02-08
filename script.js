const CLIENT_ID = 'YOUR_CLIENT_ID';
const API_KEY = 'AIzaSyCu0MBg34oC70PHxx1bmRYnB-EM7W4UAfA';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

let gapiInited = false;


const eventForm = document.getElementById('event-form');
const eventsContainer = document.getElementById('events-container');
const deleteModal = document.getElementById('delete-modal');
const alertModal = document.getElementById('alert-modal');
const timezoneSelect = document.getElementById('timezone');

let events = JSON.parse(localStorage.getItem('events')) || [];

function initializeApp() {
    loadTimezones();
    displayEvents();
    setupEventListeners();
    checkForUpcomingEvents();
    initializeGoogleCalendar();
}

function initializeGoogleCalendar() {
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
                clientId: CLIENT_ID,
                scope: SCOPES,
            });
            gapiInited = true;
        } catch (error) {
            console.error('Error initializing Google Calendar:', error);
        }
    });
}

async function loadTimezones() {
    try {
        const response = await fetch('http://api.timezonedb.com/v2.1/list-time-zone?key=BKP8J24Z0N4A&format=json');
        const data = await response.json();
        
        data.zones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.zoneName;
            option.textContent = zone.zoneName;
            if (zone.zoneName === 'Asia/Kolkata') {
                option.selected = true;
            }
            timezoneSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading timezones:', error);
    }
}

function setupEventListeners() {
    eventForm.addEventListener('submit', handleEventSubmit);
}

async function handleEventSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const datetime = document.getElementById('datetime').value;
    const timezone = timezoneSelect.value;

    const event = {
        id: Date.now().toString(),
        title,
        description,
        datetime,
        timezone,
    };

    if (timezone !== 'Asia/Kolkata') {
        event.indianTime = convertToIndianTime(datetime, timezone);
    }

    try {
        if (gapiInited) {
            await createGoogleCalendarEvent(event);
        }

        events.push(event);
        saveEvents();
        displayEvents();
        eventForm.reset();
    } catch (error) {
        console.error('Error creating event:', error);
        showAlert('Failed to create event in Google Calendar');
    }
}

async function createGoogleCalendarEvent(event) {
    const calendarEvent = {
        'summary': event.title,
        'description': event.description,
        'start': {
            'dateTime': new Date(event.datetime).toISOString(),
            'timeZone': event.timezone
        },
        'end': {
            'dateTime': new Date(new Date(event.datetime).getTime() + 3600000).toISOString(),
            'timeZone': event.timezone
        }
    };

    try {
        await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': calendarEvent
        });
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw error;
    }
}

async function deleteGoogleCalendarEvent(eventId) {
    if (!gapiInited) return;

    try {
        const response = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'q': eventId
        });

        const events = response.result.items;
        if (events && events.length > 0) {
            await gapi.client.calendar.events.delete({
                'calendarId': 'primary',
                'eventId': events[0].id
            });
        }
    } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
    }
}

function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

function displayEvents() {
    eventsContainer.innerHTML = '';
    events.forEach(event => {
        const card = createEventCard(event);
        eventsContainer.appendChild(card);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.description || 'No description'}</p>
        <p>Time: ${formatDateTime(event.datetime)}</p>
        <p>Timezone: ${event.timezone}</p>
        ${event.indianTime ? `<p>Indian Time: ${formatDateTime(event.indianTime)}</p>` : ''}
        <div class="timer" data-time="${event.datetime}"></div>
        <div class="event-actions">
            <button onclick="editEvent('${event.id}')" class="btn-secondary">Edit</button>
            <button onclick="showDeleteModal('${event.id}')" class="btn-danger">Delete</button>
        </div>
    `;
    return card;
}

function convertToIndianTime(datetime, fromTimezone) {
    const date = new Date(datetime);
    const indianTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return indianTime.toISOString();
}

function formatDateTime(datetime) {
    return new Date(datetime).toLocaleString();
}

function updateTimers() {
    const timerElements = document.querySelectorAll('.timer');
    timerElements.forEach(timer => {
        const eventTime = new Date(timer.dataset.time).getTime();
        const now = new Date().getTime();
        const distance = eventTime - now;

        if (distance < 0) {
            timer.textContent = 'Event has passed';
        } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timer.textContent = `Time remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    });
}

function checkForUpcomingEvents() {
    setInterval(() => {
        const now = new Date().getTime();
        events.forEach(event => {
            const eventTime = new Date(event.datetime).getTime();
            if (Math.abs(eventTime - now) < 1000) { // Within 1 second
                showAlert(`Event "${event.title}" is starting now!`);
            }
        });
    }, 1000);
}

function showDeleteModal(eventId) {
    deleteModal.style.display = 'block';
    const confirmButton = document.getElementById('confirm-delete');
    const cancelButton = document.getElementById('cancel-delete');

    confirmButton.onclick = async () => {
        await deleteGoogleCalendarEvent(eventId);
        deleteEvent(eventId);
    };
    cancelButton.onclick = () => deleteModal.style.display = 'none';
}

function showAlert(message) {
    const alertMessage = document.getElementById('alert-message');
    alertMessage.textContent = message;
    alertModal.style.display = 'block';

    document.getElementById('close-alert').onclick = () => {
        alertModal.style.display = 'none';
    };
}

function deleteEvent(eventId) {
    events = events.filter(event => event.id !== eventId);
    saveEvents();
    displayEvents();
    deleteModal.style.display = 'none';
}

async function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('title').value = event.title;
    document.getElementById('description').value = event.description;
    document.getElementById('datetime').value = new Date(event.datetime)
        .toISOString().slice(0, 16);
    document.getElementById('timezone').value = event.timezone;

    await deleteGoogleCalendarEvent(eventId);
    deleteEvent(eventId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


setInterval(updateTimers, 1000);

initializeApp();