// DOM Elements
const eventForm = document.getElementById('event-form');
const eventsContainer = document.getElementById('events-container');
const deleteModal = document.getElementById('delete-modal');
const alertModal = document.getElementById('alert-modal');
const timezoneSelect = document.getElementById('timezone');

// Event storage
let events = JSON.parse(localStorage.getItem('events')) || [];

// Initialize the application
function initializeApp() {
    loadTimezones();
    displayEvents();
    setupEventListeners();
    checkForUpcomingEvents();
}

// Load comprehensive list of timezones using moment-timezone
function loadTimezones() {
    const timezones = moment.tz.names(); // Get all timezone names
    
    // Sort timezones alphabetically
    timezones.sort((a, b) => {
        // Move common timezones to the top
        const commonTimezones = ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
        const aIsCommon = commonTimezones.includes(a);
        const bIsCommon = commonTimezones.includes(b);
        
        if (aIsCommon && !bIsCommon) return -1;
        if (!aIsCommon && bIsCommon) return 1;
        return a.localeCompare(b);
    });

    // Create timezone groups
    const groups = {};
    timezones.forEach(tz => {
        const region = tz.split('/')[0];
        if (!groups[region]) {
            groups[region] = [];
        }
        groups[region].push(tz);
    });

    // Clear existing options
    timezoneSelect.innerHTML = '';

    // Add timezones grouped by region
    Object.keys(groups).sort().forEach(region => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = region;

        groups[region].forEach(tz => {
            const option = document.createElement('option');
            option.value = tz;
            // Format timezone name for better readability
            const cityName = tz.split('/').pop().replace(/_/g, ' ');
            option.textContent = `${cityName} (${moment.tz(tz).format('Z')})`;
            if (tz === 'Asia/Kolkata') {
                option.selected = true;
            }
            optgroup.appendChild(option);
        });

        timezoneSelect.appendChild(optgroup);
    });
}

// Event handling functions
function setupEventListeners() {
    eventForm.addEventListener('submit', handleEventSubmit);
}

function handleEventSubmit(e) {
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

    // Convert to Indian time if needed
    if (timezone !== 'Asia/Kolkata') {
        event.indianTime = convertToIndianTime(datetime, timezone);
    }

    events.push(event);
    saveEvents();
    displayEvents();
    eventForm.reset();
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

// Utility functions
function convertToIndianTime(datetime, fromTimezone) {
    return moment.tz(datetime, fromTimezone).tz('Asia/Kolkata').format();
}

function formatDateTime(datetime) {
    return moment(datetime).format('MMMM D, YYYY h:mm A');
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

// Modal handling
function showDeleteModal(eventId) {
    deleteModal.style.display = 'block';
    const confirmButton = document.getElementById('confirm-delete');
    const cancelButton = document.getElementById('cancel-delete');

    confirmButton.onclick = () => {
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

function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('title').value = event.title;
    document.getElementById('description').value = event.description;
    document.getElementById('datetime').value = new Date(event.datetime)
        .toISOString().slice(0, 16);
    document.getElementById('timezone').value = event.timezone;

    deleteEvent(eventId); // Remove the old event
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start the timer update
setInterval(updateTimers, 1000);

// Initialize the application
initializeApp();