// Customer home page functionality
import { onAuthChange, getCurrentUser } from '../auth.js';
import { getServices, getUserVehicles, addVehicle, getAvailability, createBooking } from '../customer.js';
import { formatPrice, formatDateDisplay, openModal, closeModal, showError, hideError, showSuccess } from '../utils.js';

// Global state
let currentUser = null;
let services = [];
let vehicles = [];
let bookingState = {
  step: 1,
  service: null,
  serviceName: null,
  vehicle: null,
  vehicleDetails: null,
  date: null,
  time: null,
  price: 0
};

// Flatpickr instance
let calendarInstance = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
  initializeCustomerHome();
});

async function initializeCustomerHome() {
  // Check authentication
  onAuthChange(async (user) => {
    if (user) {
      currentUser = await getCurrentUser();
      if (currentUser) {
        updateAuthUI(true);
        await loadInitialData();
      }
    } else {
      updateAuthUI(false);
      window.location.href = '../auth/login.html';
    }
  });

  initializeEventListeners();
  initializeBookingFlow();
}

function updateAuthUI(isAuthenticated) {
  const userNav = document.getElementById('user-nav');
  const guestNav = document.getElementById('guest-nav');
  const userNameElement = document.getElementById('user-name');
  const loyaltyPointsElement = document.getElementById('loyalty-points');

  if (isAuthenticated && currentUser) {
    if (userNav) userNav.classList.remove('hidden');
    if (guestNav) guestNav.classList.add('hidden');
    if (userNameElement) userNameElement.textContent = currentUser.fullName;
    if (loyaltyPointsElement) loyaltyPointsElement.textContent = currentUser.loyaltyPoints || 0;

    // Handle admin redirection
    if (currentUser.role === 'admin') {
      window.location.href = '../admin/dashboard.html';
      return;
    }
  } else {
    if (userNav) userNav.classList.add('hidden');
    if (guestNav) guestNav.classList.remove('hidden');
  }
}

async function loadInitialData() {
  try {
    // Load services and vehicles
    const [servicesData, vehiclesData] = await Promise.all([
      getServices(),
      getUserVehicles()
    ]);

    services = servicesData;
    vehicles = vehiclesData;

    updateServicesUI();
    updateVehiclesUI();

  } catch (error) {
    console.error('Error loading initial data:', error);
    showError('Failed to load data. Please refresh the page.');
  }
}

function updateServicesUI() {
  const servicesContainer = document.getElementById('services-container');
  if (!servicesContainer) return;

  servicesContainer.innerHTML = '';

  services.forEach(service => {
    const serviceCard = createServiceCard(service);
    servicesContainer.appendChild(serviceCard);
  });
}

function createServiceCard(service) {
  const card = document.createElement('div');
  card.className = 'card p-6 cursor-pointer hover-lift';
  card.onclick = () => selectService(service.id, service.name, service.price);

  card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-navy">${service.name}</h3>
            <div class="text-2xl font-bold text-blue-dark">${formatPrice(service.price)}</div>
        </div>
        <p class="text-gray-600 mb-4">${service.description}</p>
        <div class="flex items-center text-sm text-gray-500">
            <i class="fas fa-clock mr-1"></i>
            <span>${service.durationMinutes} minutes</span>
        </div>
    `;

  return card;
}

function updateVehiclesUI() {
  const vehiclesContainer = document.getElementById('vehicles-container');
  if (!vehiclesContainer) return;

  vehiclesContainer.innerHTML = '';

  if (vehicles.length === 0) {
    vehiclesContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-car text-gray-300 text-4xl mb-4"></i>
                <p class="text-gray-600 mb-4">No vehicles added yet</p>
                <button onclick="showAddVehicleModal()" class="btn-primary px-6 py-2 rounded-lg">
                    Add Your First Vehicle
                </button>
            </div>
        `;
    return;
  }

  vehicles.forEach(vehicle => {
    const vehicleCard = createVehicleCard(vehicle);
    vehiclesContainer.appendChild(vehicleCard);
  });
}

function createVehicleCard(vehicle) {
  const card = document.createElement('div');
  card.className = 'card p-4 cursor-pointer hover-lift';
  card.onclick = () => selectVehicle(vehicle.id, `${vehicle.make} ${vehicle.model}`, vehicle.plateNumber);

  card.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-dark/10 rounded-full flex items-center justify-center">
                <i class="fas fa-car text-blue-dark text-xl"></i>
            </div>
            <div class="flex-1">
                <h3 class="font-semibold text-navy">${vehicle.make} ${vehicle.model}</h3>
                <p class="text-sm text-gray-600">${vehicle.plateNumber} • ${vehicle.vehicle_type}</p>
            </div>
        </div>
    `;

  return card;
}

function initializeEventListeners() {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
      }
    });
  }

  // Sign out button
  const signOutButton = document.getElementById('signout-btn');
  if (signOutButton) {
    signOutButton.addEventListener('click', async () => {
      try {
        await logoutUser();
        window.location.href = '../auth/login.html';
      } catch (error) {
        console.error('Sign out error:', error);
      }
    });
  }

  // Add vehicle button
  const addVehicleButton = document.getElementById('add-vehicle-btn');
  if (addVehicleButton) {
    addVehicleButton.addEventListener('click', showAddVehicleModal);
  }

  // Add vehicle form
  const addVehicleForm = document.getElementById('add-vehicle-form');
  if (addVehicleForm) {
    addVehicleForm.addEventListener('submit', handleAddVehicle);
  }

  // Booking flow buttons
  const nextStepBtn = document.getElementById('next-step-btn');
  const prevStepBtn = document.getElementById('prev-step-btn');
  const bookNowBtn = document.getElementById('book-now-btn');

  if (nextStepBtn) nextStepBtn.addEventListener('click', nextStep);
  if (prevStepBtn) prevStepBtn.addEventListener('click', prevStep);
  if (bookNowBtn) bookNowBtn.addEventListener('click', confirmBooking);
}

function initializeBookingFlow() {
  updateStepUI();
  initializeFlatpickr();
}

async function initializeFlatpickr() {
  if (typeof flatpickr === 'undefined') {
    console.error('Flatpickr not loaded');
    return;
  }

  const dateInput = document.getElementById('date-picker');
  if (!dateInput) return;

  // Get disabled dates (dates with no availability)
  const disabledDates = await getDisabledDates();

  calendarInstance = flatpickr(dateInput, {
    inline: true,
    minDate: 'today',
    maxDate: new Date().fp_incr(90), // 90 days from today
    disable: disabledDates,
    onChange: function (selectedDates, dateStr) {
      selectDate(dateStr);
    }
  });
}

async function getDisabledDates() {
  const disabledDates = [];
  const today = new Date();

  // Check next 90 days for availability
  for (let i = 0; i <= 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];

    // Skip Sundays (business closed)
    if (date.getDay() === 0) {
      disabledDates.push(dateString);
      continue;
    }

    try {
      const availability = await getAvailability(dateString);
      if (!availability || !availability.timeSlots || Object.keys(availability.timeSlots).length === 0) {
        disabledDates.push(dateString);
      }
    } catch (error) {
      console.error('Error checking availability for', dateString, error);
      disabledDates.push(dateString);
    }
  }

  return disabledDates;
}

async function selectDate(dateString) {
  bookingState.date = dateString;
  bookingState.time = null; // Reset time selection

  // Update date display
  const dateDisplay = document.getElementById('selected-date');
  if (dateDisplay) {
    dateDisplay.textContent = formatDateDisplay(dateString);
  }

  // Generate time slots
  await generateTimeSlots(dateString);

  updateStepUI();
}

async function generateTimeSlots(dateString) {
  const timeSlotsContainer = document.getElementById('time-slots-container');
  if (!timeSlotsContainer) return;

  try {
    const availability = await getAvailability(dateString);
    if (!availability || !availability.timeSlots) {
      timeSlotsContainer.innerHTML = '<p class="text-center text-gray-600">No available time slots for this date.</p>';
      return;
    }

    const timeSlots = availability.timeSlots;
    timeSlotsContainer.innerHTML = '';

    Object.entries(timeSlots).forEach(([time, slot]) => {
      const timeSlotElement = createTimeSlotElement(time, slot);
      timeSlotsContainer.appendChild(timeSlotElement);
    });
  } catch (error) {
    console.error('Error generating time slots:', error);
    timeSlotsContainer.innerHTML = '<p class="text-center text-red-600">Error loading time slots. Please try again.</p>';
  }
}

function createTimeSlotElement(time, slot) {
  const div = document.createElement('div');
  const isAvailable = slot.available && (slot.currentBookings || 0) < (slot.maxBookings || 1);

  div.className = `time-slot ${isAvailable ? '' : 'unavailable'}`;
  div.onclick = isAvailable ? () => selectTime(time, div) : null;

  div.innerHTML = `
        <div class="font-semibold">${time}</div>
        <div class="text-sm">
            ${isAvailable ?
      `${(slot.maxBookings || 1) - (slot.currentBookings || 0)} slots left` :
      'Fully booked'
    }
        </div>
    `;

  return div;
}

function selectTime(time, timeElement) {
  // Remove previous selection
  document.querySelectorAll('.time-slot.selected').forEach(el => {
    el.classList.remove('selected');
  });

  // Add selection to clicked element
  timeElement.classList.add('selected');

  bookingState.time = time;
  updateStepUI();
}

function selectService(serviceId, serviceName, price) {
  bookingState.service = serviceId;
  bookingState.serviceName = serviceName;
  bookingState.price = price;

  // Update UI
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.service-card').classList.add('selected');

  updateStepUI();
}

function selectVehicle(vehicleId, vehicleName, plateNumber) {
  bookingState.vehicle = vehicleId;
  bookingState.vehicleDetails = { name: vehicleName, plateNumber };

  // Update UI
  document.querySelectorAll('.vehicle-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.vehicle-card').classList.add('selected');

  updateStepUI();
}

function nextStep() {
  if (bookingState.step < 4) {
    bookingState.step++;
    updateStepUI();

    if (bookingState.step === 4) {
      updateBookingSummary();
    }
  }
}

function prevStep() {
  if (bookingState.step > 1) {
    bookingState.step--;
    updateStepUI();
  }
}

function updateStepUI() {
  // Update step indicators
  for (let i = 1; i <= 4; i++) {
    const stepElement = document.getElementById(`step-${i}`);
    const stepContent = document.getElementById(`step-${i}-content`);

    if (stepElement) {
      stepElement.className = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium';
      if (i < bookingState.step) {
        stepElement.className += ' step-completed';
      } else if (i === bookingState.step) {
        stepElement.className += ' step-active';
      } else {
        stepElement.className += ' step-inactive';
      }
    }

    if (stepContent) {
      stepContent.classList.toggle('hidden', i !== bookingState.step);
    }
  }

  // Update navigation buttons
  const prevBtn = document.getElementById('prev-step-btn');
  const nextBtn = document.getElementById('next-step-btn');
  const bookBtn = document.getElementById('book-now-btn');

  if (prevBtn) {
    prevBtn.classList.toggle('hidden', bookingState.step === 1);
  }

  if (nextBtn) {
    const canProceed = canProceedToNextStep();
    nextBtn.disabled = !canProceed;
    nextBtn.classList.toggle('hidden', bookingState.step === 4);
  }

  if (bookBtn) {
    bookBtn.classList.toggle('hidden', bookingState.step !== 4);
  }
}

function canProceedToNextStep() {
  switch (bookingState.step) {
    case 1:
      return bookingState.service !== null;
    case 2:
      return bookingState.vehicle !== null;
    case 3:
      return bookingState.date !== null && bookingState.time !== null;
    default:
      return false;
  }
}

function updateBookingSummary() {
  const summaryContainer = document.getElementById('booking-summary');
  if (!summaryContainer) return;

  const service = services.find(s => s.id === bookingState.service);
  const vehicle = vehicles.find(v => v.id === bookingState.vehicle);

  summaryContainer.innerHTML = `
        <div class="space-y-4">
            <div class="flex justify-between">
                <span class="text-gray-600">Service:</span>
                <span class="font-semibold">${service ? service.name : 'Unknown Service'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Vehicle:</span>
                <span class="font-semibold">${vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Date:</span>
                <span class="font-semibold">${formatDateDisplay(bookingState.date)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Time:</span>
                <span class="font-semibold">${bookingState.time}</span>
            </div>
            <div class="border-t pt-4">
                <div class="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${formatPrice(bookingState.price)}</span>
                </div>
            </div>
        </div>
    `;
}

async function confirmBooking() {
  const bookBtn = document.getElementById('book-now-btn');
  const originalText = bookBtn.textContent;

  try {
    bookBtn.disabled = true;
    bookBtn.textContent = 'Creating booking...';

    const paymentMethod = document.getElementById('payment-method').value || 'Cash';

    const booking = await createBooking(
      bookingState.vehicle,
      {
        id: bookingState.service,
        name: bookingState.serviceName,
        price: bookingState.price
      },
      bookingState.date,
      bookingState.time,
      paymentMethod
    );

    showSuccess('Booking created successfully!');

    // Reset booking state
    bookingState = {
      step: 1,
      service: null,
      serviceName: null,
      vehicle: null,
      vehicleDetails: null,
      date: null,
      time: null,
      price: 0
    };

    // Redirect to bookings page
    setTimeout(() => {
      window.location.href = 'bookings.html';
    }, 2000);

  } catch (error) {
    console.error('Error creating booking:', error);
    showError('Failed to create booking. Please try again.');
  } finally {
    bookBtn.disabled = false;
    bookBtn.textContent = originalText;
  }
}

function showAddVehicleModal() {
  openModal('vehicle-modal');
}

async function handleAddVehicle(e) {
  e.preventDefault();

  const make = document.getElementById('vehicle-make').value.trim();
  const model = document.getElementById('vehicle-model').value.trim();
  const vehicleType = document.getElementById('vehicle-type').value;
  const plateNumber = document.getElementById('plate-number').value.trim();

  if (!make || !model || !plateNumber) {
    showError('Please fill in all required fields.');
    return;
  }

  try {
    const newVehicle = await addVehicle(make, model, plateNumber, vehicleType);
    vehicles.push(newVehicle);
    updateVehiclesUI();
    closeModal('vehicle-modal');

    // Reset form
    document.getElementById('add-vehicle-form').reset();

    showSuccess('Vehicle added successfully!');
  } catch (error) {
    console.error('Error adding vehicle:', error);
    showError('Failed to add vehicle. Please try again.');
  }
}

// Export functions for global use
window.selectService = selectService;
window.selectVehicle = selectVehicle;
window.selectTime = selectTime;
window.showAddVehicleModal = showAddVehicleModal;
