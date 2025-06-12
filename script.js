import { 
    auth, 
    onAuthChange,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getUserVehicles,
    addVehicle,
    createBooking,
    getUserBookings,
    getServices,
    getAvailability,
    checkDateAvailability
} from './firebase.js';

// Booking flow state
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

// Global app state
let appState = {
    currentUser: null,
    services: [],
    vehicles: [],
    bookings: [],
    isLoading: true
};

// Flatpickr instance
let calendarInstance = null;

// DOM elements
const authModal = document.getElementById('auth-modal');
const vehicleModal = document.getElementById('vehicle-modal');
const guestCtaModal = document.getElementById('guest-cta-modal');

// Navigation elements
const userNav = document.getElementById('user-nav');
const mobileUserInfo = document.getElementById('mobile-user-info');
const mobileGuestNav = document.getElementById('mobile-guest-nav');
const mobileSignOutBtn = document.getElementById('mobile-signout-btn');

// Profile elements
const signOutButton = document.getElementById('signout-btn');
const userNameElement = document.getElementById('user-name');
const loyaltyPointsElement = document.getElementById('loyalty-points');

// Guest buttons - remove the desktop guest button references
const mobileSignInBtn = document.getElementById('mobile-signin-btn');
const mobileSignUpBtn = document.getElementById('mobile-signup-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeBookingFlow();
    initializeMobileMenu();
    initializeModals();
    initializeGuestButtons();
});

// Initialize guest buttons
function initializeGuestButtons() {
    // Remove desktop guest button functionality since they're removed
    
    // Mobile guest buttons
    if (mobileSignInBtn) {
        mobileSignInBtn.addEventListener('click', () => {
            authModal.classList.remove('hidden');
            // Close mobile menu
            document.getElementById('mobile-menu').classList.remove('open');
            document.getElementById('mobile-menu-overlay').classList.add('hidden');
        });
    }
    
    if (mobileSignUpBtn) {
        mobileSignUpBtn.addEventListener('click', () => {
            // Switch to register tab
            document.getElementById('register-tab').click();
            authModal.classList.remove('hidden');
            // Close mobile menu
            document.getElementById('mobile-menu').classList.remove('open');
            document.getElementById('mobile-menu-overlay').classList.add('hidden');
        });
    }
}

// Auth initialization
function initializeAuth() {
    onAuthChange(async (user) => {
        if (user) {
            const userData = await getCurrentUser();
            appState.currentUser = userData;
            
            // Update UI for authenticated user
            updateAuthUI(true);
            
            // Load user data
            await loadUserData();
        } else {
            appState.currentUser = null;
            updateAuthUI(false);
            
            // Load services for guest users
            try {
                appState.services = await getServices();
                updateServicesUI();
            } catch (error) {
                console.error('Error loading services for guest:', error);
            }
        }
        
        appState.isLoading = false;
    });
    
    // Handle sign in form submission
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;
            
            try {
                const result = await loginUser(email, password);
                if (result.success) {
                    authModal.classList.add('hidden');
                    // Clear form
                    signinForm.reset();
                } else {
                    alert('Login failed: ' + result.error);
                }
            } catch (error) {
                alert('Login error: ' + error.message);
            }
        });
    }
    
    // Handle register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            try {
                const result = await registerUser(email, password, name, phone);
                if (result.success) {
                    authModal.classList.add('hidden');
                    // Clear form
                    registerForm.reset();
                } else {
                    alert('Registration failed: ' + result.error);
                }
            } catch (error) {
                alert('Registration error: ' + error.message);
            }
        });
    }
    
    // Handle sign out
    if (signOutButton) {
        signOutButton.addEventListener('click', async () => {
            try {
                await logoutUser();
                window.location.reload();
            } catch (error) {
                alert('Logout error: ' + error.message);
            }
        });
    }
    
    // Mobile sign out
    if (mobileSignOutBtn) {
        mobileSignOutBtn.addEventListener('click', async () => {
            try {
                await logoutUser();
                window.location.reload();
            } catch (error) {
                alert('Logout error: ' + error.message);
            }
        });
    }
}

// Update UI based on auth state
function updateAuthUI(isAuthenticated) {
    if (isAuthenticated && appState.currentUser) {
        // Show authenticated user UI
        if (userNav) userNav.classList.remove('hidden');
        
        // Update user info
        if (userNameElement) userNameElement.textContent = appState.currentUser.fullName;
        if (loyaltyPointsElement) loyaltyPointsElement.textContent = `${appState.currentUser.loyaltyPoints} points`;
        
        // Update mobile menu user info
        if (mobileUserInfo) {
            mobileUserInfo.innerHTML = `
                <div class="text-cream">
                    <div class="font-semibold">${appState.currentUser.fullName}</div>
                    <div class="text-sm opacity-80">${appState.currentUser.loyaltyPoints} loyalty points</div>
                </div>
            `;
        }
        
        // Hide mobile guest nav and show sign out
        if (mobileGuestNav) mobileGuestNav.classList.add('hidden');
        if (mobileSignOutBtn) mobileSignOutBtn.classList.remove('hidden');
        
        // Show appropriate navigation based on role
        updateNavigationByRole(appState.currentUser.role);
    } else {
        // Show guest UI - user nav is hidden by default
        if (userNav) userNav.classList.add('hidden');
        
        // Hide role-specific navigation
        const customerNav = document.getElementById('customer-nav');
        const washerNav = document.getElementById('washer-nav');
        const adminNav = document.getElementById('admin-nav');
        
        if (customerNav) customerNav.classList.remove('hidden');
        if (washerNav) washerNav.classList.add('hidden');
        if (adminNav) adminNav.classList.add('hidden');
        
        // Update mobile navigation
        const mobileCustomerNav = document.getElementById('mobile-customer-nav');
        const mobileWasherNav = document.getElementById('mobile-washer-nav');
        const mobileAdminNav = document.getElementById('mobile-admin-nav');
        
        if (mobileCustomerNav) mobileCustomerNav.classList.add('hidden');
        if (mobileWasherNav) mobileWasherNav.classList.add('hidden');
        if (mobileAdminNav) mobileAdminNav.classList.add('hidden');
        
        // Update mobile menu user info
        if (mobileUserInfo) {
            mobileUserInfo.innerHTML = `
                <div class="text-cream">
                    <div class="font-semibold">Guest User</div>
                    <div class="text-sm opacity-80">Please sign in</div>
                </div>
            `;
        }
        
        // Show mobile guest nav and hide sign out
        if (mobileGuestNav) mobileGuestNav.classList.remove('hidden');
        if (mobileSignOutBtn) mobileSignOutBtn.classList.add('hidden');
    }
}

function updateNavigationByRole(role) {
    // Hide all navigation types first
    const customerNav = document.getElementById('customer-nav');
    const washerNav = document.getElementById('washer-nav');
    const adminNav = document.getElementById('admin-nav');
    const mobileCustomerNav = document.getElementById('mobile-customer-nav');
    const mobileWasherNav = document.getElementById('mobile-washer-nav');
    const mobileAdminNav = document.getElementById('mobile-admin-nav');
    
    if (customerNav) customerNav.classList.add('hidden');
    if (washerNav) washerNav.classList.add('hidden');
    if (adminNav) adminNav.classList.add('hidden');
    if (mobileCustomerNav) mobileCustomerNav.classList.add('hidden');
    if (mobileWasherNav) mobileWasherNav.classList.add('hidden');
    if (mobileAdminNav) mobileAdminNav.classList.add('hidden');
    
    // Show appropriate navigation
    switch (role) {
        case 'customer':
            if (customerNav) customerNav.classList.remove('hidden');
            if (mobileCustomerNav) mobileCustomerNav.classList.remove('hidden');
            break;
        case 'washer':
            if (washerNav) washerNav.classList.remove('hidden');
            if (mobileWasherNav) mobileWasherNav.classList.remove('hidden');
            break;
        case 'admin':
            if (adminNav) adminNav.classList.remove('hidden');
            if (mobileAdminNav) mobileAdminNav.classList.remove('hidden');
            break;
        default:
            if (customerNav) customerNav.classList.remove('hidden');
            if (mobileCustomerNav) mobileCustomerNav.classList.remove('hidden');
    }
}

// Load user data from Firebase
async function loadUserData() {
    try {
        // Load services
        appState.services = await getServices();
        
        // Load user vehicles
        appState.vehicles = await getUserVehicles();
        
        // Load user bookings
        appState.bookings = await getUserBookings();
        
        // Update UI with data
        updateServicesUI();
        updateVehiclesUI();
        updateBookingsUI();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Update services UI
function updateServicesUI() {
    const serviceContainer = document.querySelector('#service-step .grid');
    serviceContainer.innerHTML = '';
    
    appState.services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-dark transition-colors';
        serviceCard.dataset.service = service.id;
        serviceCard.dataset.serviceName = service.name;
        
        serviceCard.innerHTML = `
            <h4 class="font-semibold text-navy">${service.name}</h4>
            <p class="text-sm text-gray-600 mb-2">${service.description}</p>
            <p class="text-lg font-bold text-brown">₱${service.price}</p>
            <p class="text-xs text-gray-500">${service.durationMinutes} minutes</p>
        `;
        
        serviceCard.addEventListener('click', () => {
            selectService(service.id, service.name, service.price);
        });
        
        serviceContainer.appendChild(serviceCard);
    });
}

// Update vehicles UI
function updateVehiclesUI() {
    const vehicleContainer = document.querySelector('#vehicle-step .grid');
    vehicleContainer.innerHTML = '';
    
    // Add user vehicles
    appState.vehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-dark transition-colors';
        vehicleCard.dataset.vehicle = vehicle.id;
        
        vehicleCard.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-car text-2xl text-blue-dark"></i>
                <div>
                    <h4 class="font-semibold text-navy">${vehicle.make} ${vehicle.model}</h4>
                    <p class="text-sm text-gray-600">${vehicle.plateNumber}</p>
                </div>
            </div>
        `;
        
        vehicleCard.addEventListener('click', () => {
            selectVehicle(vehicle.id, `${vehicle.make} ${vehicle.model}`, vehicle.plateNumber);
        });
        
        vehicleContainer.appendChild(vehicleCard);
    });
    
    // Add "Add Vehicle" card
    const addVehicleCard = document.createElement('div');
    addVehicleCard.className = 'border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-dark transition-colors flex items-center justify-center';
    addVehicleCard.innerHTML = `
        <div class="text-center">
            <i class="fas fa-plus text-2xl text-gray-400 mb-2"></i>
            <p class="text-sm text-gray-600">Add New Vehicle</p>
        </div>
    `;
    
    addVehicleCard.addEventListener('click', () => {
        vehicleModal.classList.remove('hidden');
    });
    
    vehicleContainer.appendChild(addVehicleCard);
}

// Update bookings UI
function updateBookingsUI() {
    const bookingsContainer = document.getElementById('recent-bookings-container');
    if (!bookingsContainer) return;
    
    bookingsContainer.innerHTML = '';
    
    if (!appState.currentUser) {
        bookingsContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-user-circle text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 mb-4">Sign in to view your recent bookings</p>
                <button id="bookings-signin-btn" class="bg-blue-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-navy transition-colors">
                    Sign In
                </button>
            </div>
        `;
        
        // Add event listener for the sign in button
        const bookingsSignInBtn = document.getElementById('bookings-signin-btn');
        if (bookingsSignInBtn) {
            bookingsSignInBtn.addEventListener('click', () => {
                authModal.classList.remove('hidden');
            });
        }
        return;
    }
    
    if (appState.bookings.length === 0) {
        bookingsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No recent bookings</p>';
        return;
    }
    
    // Take only the most recent 3 bookings
    const recentBookings = appState.bookings.slice(0, 3);
    
    recentBookings.forEach(booking => {
        // Find vehicle details
        const vehicle = appState.vehicles.find(v => v.id === booking.vehicleId);
        const vehicleText = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle';
        
        // Get status color
        let statusColor = 'gray';
        if (booking.status === 'Completed') statusColor = 'green';
        if (booking.status === 'Pending') statusColor = 'yellow';
        if (booking.status === 'Ongoing') statusColor = 'blue';
        if (booking.status === 'Cancelled') statusColor = 'red';
        
        const bookingElement = document.createElement('div');
        bookingElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
        
        bookingElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-${statusColor}-500 rounded-full"></div>
                <div>
                    <p class="font-medium text-navy">${booking.service} - ${vehicleText}</p>
                    <p class="text-sm text-gray-600">${booking.date} at ${booking.time}</p>
                </div>
            </div>
            <span class="px-3 py-1 bg-${statusColor}-100 text-${statusColor}-800 text-sm rounded-full">${booking.status}</span>
        `;
        
        bookingsContainer.appendChild(bookingElement);
    });
}

// Initialize modals
function initializeModals() {
    // Remove profile button dropdown functionality since it's now a direct link
    
    // Sign out functionality
    if (signOutButton) {
        signOutButton.addEventListener('click', async () => {
            try {
                await logoutUser();
                window.location.reload();
            } catch (error) {
                alert('Logout error: ' + error.message);
            }
        });
    }
    
    // Auth modal
    const closeAuthModal = document.getElementById('close-auth-modal');
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }
    
    // Toggle between sign in and register tabs
    const signinTab = document.getElementById('signin-tab');
    const registerTab = document.getElementById('register-tab');
    const signinForm = document.getElementById('signin-form');
    const registerForm = document.getElementById('register-form');
    
    if (signinTab) {
        signinTab.addEventListener('click', () => {
            signinTab.classList.add('text-blue-dark', 'border-blue-dark');
            signinTab.classList.remove('text-gray-500');
            registerTab.classList.remove('text-blue-dark', 'border-blue-dark');
            registerTab.classList.add('text-gray-500');
            
            if (signinForm) signinForm.classList.remove('hidden');
            if (registerForm) registerForm.classList.add('hidden');
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('text-blue-dark', 'border-blue-dark');
            registerTab.classList.remove('text-gray-500');
            signinTab.classList.remove('text-blue-dark', 'border-blue-dark');
            signinTab.classList.add('text-gray-500');
            
            if (registerForm) registerForm.classList.remove('hidden');
            if (signinForm) signinForm.classList.add('hidden');
        });
    }
    
    // Guest CTA modal
    if (guestCtaModal) {
        const closeGuestModal = document.getElementById('close-guest-modal');
        if (closeGuestModal) {
            closeGuestModal.addEventListener('click', () => {
                guestCtaModal.classList.add('hidden');
            });
        }
    }
    
    // Vehicle modal
    if (vehicleModal) {
        const closeVehicleModal = document.getElementById('close-vehicle-modal');
        if (closeVehicleModal) {
            closeVehicleModal.addEventListener('click', () => {
                vehicleModal.classList.add('hidden');
            });
        }
        
        const addVehicleForm = document.getElementById('add-vehicle-form');
        if (addVehicleForm) {
            addVehicleForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const make = document.getElementById('vehicle-make').value;
                const model = document.getElementById('vehicle-model').value;
                const plateNumber = document.getElementById('vehicle-plate').value;
                
                try {
                    await addVehicle(make, model, plateNumber);
                    
                    // Reload vehicles
                    appState.vehicles = await getUserVehicles();
                    updateVehiclesUI();
                    
                    // Close modal and reset form
                    vehicleModal.classList.add('hidden');
                    addVehicleForm.reset();
                } catch (error) {
                    alert('Error adding vehicle: ' + error.message);
                }
            });
        }
    }
}

// Booking flow functions
function initializeBookingFlow() {
    // Initialize Flatpickr
    initializeFlatpickr();
    
    // Step navigation buttons
    const vehicleBackBtn = document.getElementById('vehicle-back-btn');
    const datetimeBackBtn = document.getElementById('datetime-back-btn');
    const confirmBookingBtn = document.getElementById('confirm-booking');
    
    if (vehicleBackBtn) {
        vehicleBackBtn.addEventListener('click', () => {
            prevStep();
        });
    }
    
    if (datetimeBackBtn) {
        datetimeBackBtn.addEventListener('click', () => {
            prevStep();
        });
    }
    
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', confirmBooking);
    }
    
    // Initialize the first step
    updateStepUI();
}

// Initialize Flatpickr calendar
async function initializeFlatpickr() {
    const calendarInput = document.getElementById('booking-calendar');
    if (!calendarInput) return;
    
    // Get disabled dates (dates with no availability)
    const disabledDates = await getDisabledDates();
    
    calendarInstance = flatpickr(calendarInput, {
        minDate: "today",
        maxDate: new Date().fp_incr(90), // 90 days from today
        disable: [
            // Disable Sundays (business closed)
            function(date) {
                return date.getDay() === 0;
            },
            // Disable dates with no availability
            ...disabledDates
        ],
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        theme: "light",
        inline: false,
        allowInput: false,
        clickOpens: true,
        onChange: async function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                await selectDate(dateStr);
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            // Customize the calendar after it's ready
            const calendar = instance.calendarContainer;
            calendar.style.fontFamily = 'Inter, system-ui, sans-serif';
        }
    });
}

// Get dates that should be disabled (no availability)
async function getDisabledDates() {
    const disabledDates = [];
    const today = new Date();
    
    // Check next 90 days for availability
    for (let i = 1; i <= 90; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        
        // Skip Sundays (they're already disabled by function above)
        if (checkDate.getDay() === 0) continue;
        
        const dateString = checkDate.toISOString().split('T')[0];
        
        try {
            const hasAvailability = await checkDateAvailability(dateString);
            if (!hasAvailability) {
                disabledDates.push(dateString);
            }
        } catch (error) {
            console.error('Error checking availability for', dateString, ':', error);
            // If there's an error, assume no availability
            disabledDates.push(dateString);
        }
    }
    
    return disabledDates;
}

// Handle date selection
async function selectDate(dateString) {
    if (!appState.currentUser) {
        authModal.classList.remove('hidden');
        return;
    }
    
    bookingState.date = dateString;
    
    // Update selected date display
    const selectedDate = new Date(dateString);
    const formattedDate = selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('selected-date').textContent = formattedDate;
    
    // Generate time slots from Firebase
    await generateTimeSlots(dateString);
    document.getElementById('time-slots').classList.remove('hidden');
}

// Remove the old calendar functions and replace with updated time slots function
async function generateTimeSlots(dateString) {
    const timeSlotsContainer = document.querySelector('#time-slots .grid');
    
    // Show loading state
    timeSlotsContainer.innerHTML = '<div class="col-span-full text-center py-8"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-dark mx-auto"></div><p class="text-gray-500 mt-2">Loading time slots...</p></div>';
    
    try {
        const availability = await getAvailability(dateString);
        
        // Clear loading state
        timeSlotsContainer.innerHTML = '';
        
        if (!availability) {
            timeSlotsContainer.innerHTML = '<p class="col-span-full text-center py-4 text-gray-500">No available time slots for this date</p>';
            return;
        }
        
        // Define time slot order for consistent display
        const timeOrder = [
            "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
        ];
        
        // Filter and sort available times
        const availableTimes = timeOrder.filter(time => availability[time]);
        
        if (availableTimes.length === 0) {
            timeSlotsContainer.innerHTML = '<p class="col-span-full text-center py-4 text-gray-500">No time slots available for this date</p>';
            return;
        }
        
        availableTimes.forEach(time => {
            const slot = availability[time];
            const timeElement = document.createElement('div');
            timeElement.className = 'text-center py-4 px-4 rounded-xl border-2 cursor-pointer transition-all duration-200 font-medium';
            
            const slotsLeft = slot.maxBookings - slot.currentBookings;
            const isAvailable = slot.available && slotsLeft > 0;
            
            if (isAvailable) {
                timeElement.className += ' border-gray-200 hover:border-blue-dark hover:bg-blue-50 hover:shadow-md';
                timeElement.innerHTML = `
                    <div class="text-navy font-semibold">${time}</div>
                    <div class="text-xs text-gray-500 mt-1">${slotsLeft} slots left</div>
                `;
                timeElement.addEventListener('click', (e) => selectTime(time, e.currentTarget));
            } else {
                timeElement.className += ' border-gray-200 bg-gray-50 cursor-not-allowed opacity-60';
                timeElement.innerHTML = `
                    <div class="text-gray-400 font-semibold">${time}</div>
                    <div class="text-xs text-red-500 mt-1">Fully booked</div>
                `;
            }
            
            timeSlotsContainer.appendChild(timeElement);
        });
        
    } catch (error) {
        console.error('Error generating time slots:', error);
        timeSlotsContainer.innerHTML = '<p class="col-span-full text-center py-4 text-red-500">Error loading time slots. Please try again.</p>';
    }
}

function selectTime(time, timeElement) {
    bookingState.time = time;
    
    // Update UI
    document.querySelectorAll('#time-slots .grid > div').forEach(slot => {
        slot.classList.remove('border-blue-dark', 'bg-blue-50', 'shadow-md');
        slot.classList.add('border-gray-200');
    });
    timeElement.classList.remove('border-gray-200');
    timeElement.classList.add('border-blue-dark', 'bg-blue-50', 'shadow-md');
    
    // Show booking summary
    updateBookingSummary();
    document.getElementById('booking-summary').classList.remove('hidden');
}

async function confirmBooking() {
    if (!appState.currentUser) {
        authModal.classList.remove('hidden');
        return;
    }
    
    if (!bookingState.vehicle || !bookingState.service || !bookingState.date || !bookingState.time) {
        alert('Please complete all booking steps');
        return;
    }
    
    const confirmBtn = document.getElementById('confirm-booking');
    const originalText = confirmBtn.textContent;
    
    try {
        // Show loading state
        confirmBtn.textContent = 'Processing...';
        confirmBtn.disabled = true;
        
        // Default payment method (can be expanded with payment selection)
        const paymentMethod = "GCash";
        
        await createBooking(
            bookingState.vehicle,
            bookingState.serviceName,
            bookingState.date,
            bookingState.time,
            paymentMethod
        );
        
        // Reload bookings and calendar
        appState.bookings = await getUserBookings();
        updateBookingsUI();
        
        // Refresh the calendar to show updated availability
        await generateCalendar();
        
        // Show success message
        alert('Booking confirmed! You will receive a confirmation SMS shortly.');
        
        // Reset booking flow
        resetBookingFlow();
        
    } catch (error) {
        console.error('Booking error:', error);
        alert('Error creating booking: ' + error.message);
    } finally {
        // Reset button state
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

function resetBookingFlow() {
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
    
    updateStepUI();
    document.getElementById('booking-summary').classList.add('hidden');
    document.getElementById('time-slots').classList.add('hidden');
    
    // Clear Flatpickr selection
    if (calendarInstance) {
        calendarInstance.clear();
    }
    
    // Clear all selections
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('border-blue-dark', 'bg-blue-50');
    });
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.classList.remove('border-blue-dark', 'bg-blue-50');
    });
    document.querySelectorAll('#time-slots .grid > div').forEach(slot => {
        slot.classList.remove('border-blue-dark', 'bg-blue-50', 'shadow-md');
    });
}

// Mobile menu functions
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const mobileSignOutButton = document.querySelector('#mobile-menu .bottom-6 button');

    // Open mobile menu
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.add('open');
        mobileMenuOverlay.classList.remove('hidden');
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    // Close mobile menu
    function closeMobileMenuHandler() {
        mobileMenu.classList.remove('open');
        mobileMenuOverlay.classList.add('hidden');
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
        document.body.style.overflow = ''; // Restore scrolling
    }

    closeMobileMenu.addEventListener('click', closeMobileMenuHandler);
    mobileMenuOverlay.addEventListener('click', closeMobileMenuHandler);

    // Mobile sign out
    if (mobileSignOutButton) {
        mobileSignOutButton.addEventListener('click', async () => {
            try {
                await logoutUser();
                window.location.reload();
            } catch (error) {
                alert('Logout error: ' + error.message);
            }
        });
    }

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenuHandler();
        }
    });

    // Close menu on window resize if it gets too big
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024 && mobileMenu.classList.contains('open')) {
            closeMobileMenuHandler();
        }
    });
}

// Utility functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function selectService(serviceId, serviceName, price) {
    if (!appState.currentUser) {
        // Show auth modal for guests
        authModal.classList.remove('hidden');
        return;
    }
    
    bookingState.service = serviceId;
    bookingState.serviceName = serviceName;
    bookingState.price = price;
    
    // Update UI
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('border-blue-dark', 'bg-blue-50');
    });
    document.querySelector(`[data-service="${serviceId}"]`).classList.add('border-blue-dark', 'bg-blue-50');
    
    // Move to next step
    setTimeout(() => {
        nextStep();
    }, 300);
}

function selectVehicle(vehicleId, vehicleName, plateNumber) {
    bookingState.vehicle = vehicleId;
    bookingState.vehicleDetails = { name: vehicleName, plateNumber };
    
    // Update UI
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.classList.remove('border-blue-dark', 'bg-blue-50');
    });
    document.querySelector(`[data-vehicle="${vehicleId}"]`).classList.add('border-blue-dark', 'bg-blue-50');
    
    // Move to next step
    setTimeout(() => {
        nextStep();
    }, 300);
}

function nextStep() {
    if (bookingState.step < 3) {
        bookingState.step++;
        updateStepUI();
    }
}

function prevStep() {
    if (bookingState.step > 1) {
        bookingState.step--;
        updateStepUI();
    }
}

function updateStepUI() {
    // Hide all steps
    document.getElementById('service-step').classList.add('hidden');
    document.getElementById('vehicle-step').classList.add('hidden');
    document.getElementById('datetime-step').classList.add('hidden');
    
    // Update step indicators
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`step${i}`);
        const stepText = stepEl.nextElementSibling;
        
        if (i < bookingState.step) {
            // Completed step
            stepEl.classList.remove('bg-gray-200', 'text-gray-500', 'bg-blue-dark', 'text-white');
            stepEl.classList.add('bg-green-500', 'text-white');
            stepEl.innerHTML = '<i class="fas fa-check text-xs"></i>';
            stepText.classList.remove('text-gray-500');
            stepText.classList.add('text-green-600');
        } else if (i === bookingState.step) {
            // Current step
            stepEl.classList.remove('bg-gray-200', 'text-gray-500', 'bg-green-500');
            stepEl.classList.add('bg-blue-dark', 'text-white');
            stepEl.textContent = i;
            stepText.classList.remove('text-gray-500', 'text-green-600');
            stepText.classList.add('text-blue-dark');
        } else {
            // Future step
            stepEl.classList.remove('bg-blue-dark', 'text-white', 'bg-green-500');
            stepEl.classList.add('bg-gray-200', 'text-gray-500');
            stepEl.textContent = i;
            stepText.classList.remove('text-blue-dark', 'text-green-600');
            stepText.classList.add('text-gray-500');
        }
    }
    
    // Show current step
    switch (bookingState.step) {
        case 1:
            document.getElementById('service-step').classList.remove('hidden');
            break;
        case 2:
            document.getElementById('vehicle-step').classList.remove('hidden');
            if (appState.vehicles.length === 0) {
                // If user has no vehicles, show add vehicle modal
                showAddVehiclePrompt();
            }
            break;
        case 3:
            document.getElementById('datetime-step').classList.remove('hidden');
            // Refresh Flatpickr disabled dates when showing step 3
            if (calendarInstance) {
                refreshCalendarAvailability();
            }
            break;
    }
}

// Refresh calendar availability
async function refreshCalendarAvailability() {
    if (!calendarInstance) return;
    
    try {
        const disabledDates = await getDisabledDates();
        
        // Update Flatpickr disable option
        calendarInstance.set('disable', [
            // Disable Sundays
            function(date) {
                return date.getDay() === 0;
            },
            // Disable dates with no availability
            ...disabledDates
        ]);
        
        // Redraw calendar
        calendarInstance.redraw();
    } catch (error) {
        console.error('Error refreshing calendar availability:', error);
    }
}

// Show add vehicle prompt
function showAddVehiclePrompt() {
    const vehicleContainer = document.querySelector('#vehicle-step .grid');
    vehicleContainer.innerHTML = `
        <div class="col-span-full text-center py-8">
            <i class="fas fa-car text-4xl text-gray-300 mb-4"></i>
            <h3 class="text-lg font-semibold text-navy mb-2">No Vehicles Found</h3>
            <p class="text-gray-500 mb-4">You need to add a vehicle before booking a service.</p>
            <button id="add-first-vehicle" class="bg-blue-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy transition-colors">
                <i class="fas fa-plus mr-2"></i>Add Your First Vehicle
            </button>
        </div>
    `;
    
    document.getElementById('add-first-vehicle').addEventListener('click', () => {
        vehicleModal.classList.remove('hidden');
    });
}

// Update booking summary
function updateBookingSummary() {
    document.getElementById('summary-service').textContent = bookingState.serviceName;
    document.getElementById('summary-vehicle').textContent = `${bookingState.vehicleDetails.name} (${bookingState.vehicleDetails.plateNumber})`;
    document.getElementById('summary-datetime').textContent = `${formatDateDisplay(bookingState.date)} at ${bookingState.time}`;
    document.getElementById('summary-price').textContent = `₱${bookingState.price}`;
}
