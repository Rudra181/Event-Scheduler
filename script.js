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
    
    // Convert event time to IST for display
    const indianTime = event.timezone === 'Asia/Kolkata' 
        ? event.datetime 
        : convertToIndianTime(event.datetime, event.timezone);
    
    card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.description || 'No description'}</p>
        <p>Original Time: ${formatDateTime(event.datetime)} (${event.timezone})</p>
        <p>Indian Time: ${formatDateTime(indianTime)} (IST)</p>
        <div class="timer" data-time="${indianTime}" data-original-time="${event.datetime}" data-timezone="${event.timezone}"></div>
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
    const nowIST = moment().tz('Asia/Kolkata');

    timerElements.forEach(timer => {
        const eventTimeIST = moment.tz(timer.dataset.time, 'Asia/Kolkata');
        const distance = eventTimeIST.diff(nowIST);

        if (distance < 0) {
            timer.textContent = 'Event has passed';
        } else {
            const duration = moment.duration(distance);
            const days = Math.floor(duration.asDays());
            const hours = duration.hours();
            const minutes = duration.minutes();
            const seconds = duration.seconds();

            timer.textContent = `Time remaining (IST): ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    });
}

function checkForUpcomingEvents() {
    setInterval(() => {
        const nowIST = moment().tz('Asia/Kolkata');
        events.forEach(event => {
            const eventTimeIST = moment.tz(
                event.timezone === 'Asia/Kolkata' ? event.datetime : convertToIndianTime(event.datetime, event.timezone),
                'Asia/Kolkata'
            );
            
            if (Math.abs(eventTimeIST.diff(nowIST)) < 1000) { // Within 1 second
                showAlert(`Event "${event.title}" is starting now! (IST: ${eventTimeIST.format('h:mm A')})`);
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