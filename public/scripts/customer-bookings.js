// Customer Bookings Management
import {
  getUserBookings,
  updateBookingRating,
  onAuthChange,
  getCurrentUser,
  logoutUser,
  auth
} from './firebase.js';

// DOM Elements
let bookingsList;
let noBookingsDiv;
let statsElements;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initializeElements();
  initializeAuth();
  setupEventListeners();
});

function initializeElements() {
  bookingsList = document.getElementById('bookings-list');
  noBookingsDiv = document.getElementById('no-bookings');

  statsElements = {
    total: document.getElementById('total-bookings'),
    completed: document.getElementById('completed-bookings'),
    pending: document.getElementById('pending-bookings'),
    totalSpent: document.getElementById('total-spent')
  };
}

function initializeAuth() {
  console.log('Initializing auth...');

  // Check if user is already authenticated
  const currentAuthUser = auth.currentUser;
  if (currentAuthUser) {
    console.log('User already authenticated:', currentAuthUser.uid);
    loadBookings();
    return;
  }

  onAuthChange(async (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'User not logged in');
    if (user) {
      console.log('User UID:', user.uid);
      try {
        const currentUser = await getCurrentUser();
        console.log('Current user data:', currentUser);
        if (currentUser) {
          loadBookings();
        } else {
          console.error('Could not load user data');
          showError('Could not load user profile');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        showError('Authentication error: ' + error.message);
      }
    } else {
      console.log('Redirecting to login...');
      window.location.href = '../auth/login.html';
    }
  });
}

function setupEventListeners() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Signout button
  const signoutBtn = document.getElementById('signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', async () => {
      try {
        await logoutUser();
        window.location.href = '../landing.html';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    });
  }

  // Search and filter functionality
  setupSearchAndFilters();
}

function setupSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const serviceFilter = document.getElementById('service-filter');
  const clearFiltersBtn = document.getElementById('clear-filters');

  if (searchInput) {
    searchInput.addEventListener('input', filterBookings);
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', filterBookings);
  }

  if (serviceFilter) {
    serviceFilter.addEventListener('change', filterBookings);
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }
}

async function loadBookings() {
  console.log('loadBookings called');
  try {
    showLoading();
    console.log('Calling getUserBookings...');
    const bookings = await getUserBookings();
    console.log('Bookings received:', bookings);

    if (bookings && bookings.length > 0) {
      console.log('Displaying bookings:', bookings.length);
      displayBookings(bookings);
      updateStats(bookings);
      hideNoBookings();
    } else {
      console.log('No bookings found');
      showNoBookings();
      updateStats([]);
    }

    hideLoading();
  } catch (error) {
    console.error('Error loading bookings:', error);
    showError('Failed to load bookings. Please try again.');
    hideLoading();
  }
}

function displayBookings(bookings) {
  if (!bookingsList) return;

  bookingsList.innerHTML = '';

  bookings.forEach(booking => {
    const bookingElement = createBookingElement(booking);
    bookingsList.appendChild(bookingElement);
  });
}

function createBookingElement(booking) {
  const div = document.createElement('div');
  div.className = 'bg-white rounded-lg shadow-md overflow-hidden border-l-4';
  div.classList.add(getStatusBorderClass(booking.status));
  div.setAttribute('data-booking-id', booking.id);
  div.setAttribute('data-status', booking.status.toLowerCase());
  div.setAttribute('data-service', booking.service.toLowerCase());

  const formattedDate = formatDate(booking.date);
  const paymentAmount = booking.payment?.amount || booking.price || 0;
  const paymentMethod = booking.payment?.method || 'N/A';

  div.innerHTML = `
        <div class="p-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 class="text-xl font-bold text-navy mb-1">${booking.service}</h3>
                    <div class="text-gray-600 text-sm space-y-1">
                        <p>${booking.plateNumber ? `Plate: ${booking.plateNumber}` : ''}</p>
                        ${booking.vehicleClass ? `<p>Vehicle: ${booking.vehicleClass}</p>` : ''}
                        ${booking.bay ? `<p>Bay: ${typeof booking.bay === 'object' ? booking.bay.name || `Bay ${booking.bay.id}` : booking.bay}</p>` : ''}
                        ${booking.team ? `<p>Team: ${booking.team}</p>` : ''}
                        ${booking.washingCycle ? `<p>Cycle: ${booking.washingCycle}</p>` : ''}
                        ${booking.mobileNumber ? `<p>Mobile: ${booking.mobileNumber}</p>` : ''}
                    </div>
                </div>
                <div class="mt-2 md:mt-0 flex flex-col items-end space-y-2">
                    <span class="${getStatusClass(booking.status)}">${booking.status}</span>
                    ${booking.invoiceNumber ? `<span class="text-xs text-gray-500">Invoice: ${booking.invoiceNumber}</span>` : ''}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div>
                    <p class="text-xs text-gray-500">Date</p>
                    <p class="font-medium">${formattedDate}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Time</p>
                    <p class="font-medium">${booking.time}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Amount</p>
                    <p class="font-medium text-brown">₱${paymentAmount.toLocaleString()}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500">Payment</p>
                    <p class="font-medium">${paymentMethod}</p>
                </div>
            </div>

            ${booking.loyaltyPointsUsed > 0 ? `
                <div class="mt-4 p-3 bg-green-50 rounded-lg">
                    <p class="text-sm text-green-700">
                        <i class="fas fa-star text-yellow-500 mr-1"></i>
                        Loyalty Points Used: ${booking.loyaltyPointsUsed}
                    </p>
                </div>
            ` : ''}

            ${booking.promoCode ? `
                <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700">
                        <i class="fas fa-tag mr-1"></i>
                        Promo Code Applied: ${booking.promoCode}
                    </p>
                </div>
            ` : ''}

            ${booking.status === 'Completed' && !booking.rating ? `
                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2">Rate this service</h4>
                    <div class="flex items-center space-x-2">
                        <div class="rating-stars" data-booking-id="${booking.id}">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <button class="star text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${star}">
                                    <i class="fas fa-star"></i>
                                </button>
                            `).join('')}
                        </div>
                        <button class="submit-rating hidden bg-blue-dark text-white px-4 py-1 rounded text-sm hover:bg-navy transition-colors" data-booking-id="${booking.id}">
                            Submit
                        </button>
                    </div>
                </div>
            ` : ''}

            ${booking.rating ? `
                <div class="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 class="font-medium text-green-800 mb-2">Your Rating</h4>
                    <div class="flex items-center space-x-2">
                        <div class="text-yellow-500">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <i class="fas fa-star${star <= booking.rating ? '' : '-o'}"></i>
                            `).join('')}
                        </div>
                        <span class="text-sm text-green-700">${booking.rating}/5 stars</span>
                    </div>
                    ${booking.review ? `<p class="text-sm text-green-700 mt-2">"${booking.review}"</p>` : ''}
                </div>
            ` : ''}
        </div>
    `;

  // Add rating functionality for completed bookings
  if (booking.status === 'Completed' && !booking.rating) {
    setupRatingStars(div, booking.id);
  }

  return div;
}

function setupRatingStars(bookingElement, bookingId) {
  const stars = bookingElement.querySelectorAll('.star');
  const submitBtn = bookingElement.querySelector('.submit-rating');
  let selectedRating = 0;

  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating);
      updateStarDisplay(stars, selectedRating);
      submitBtn.classList.remove('hidden');
    });

    star.addEventListener('mouseenter', () => {
      const hoverRating = parseInt(star.dataset.rating);
      updateStarDisplay(stars, hoverRating);
    });
  });

  bookingElement.querySelector('.rating-stars').addEventListener('mouseleave', () => {
    updateStarDisplay(stars, selectedRating);
  });

  submitBtn.addEventListener('click', async () => {
    try {
      await updateBookingRating(bookingId, selectedRating);
      showSuccess('Rating submitted successfully!');
      loadBookings(); // Reload to show updated rating
    } catch (error) {
      console.error('Error submitting rating:', error);
      showError('Failed to submit rating. Please try again.');
    }
  });
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.remove('text-gray-300');
      star.classList.add('text-yellow-400');
    } else {
      star.classList.remove('text-yellow-400');
      star.classList.add('text-gray-300');
    }
  });
}

function getStatusBorderClass(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'border-yellow-500';
    case 'ongoing': return 'border-blue-500';
    case 'completed': return 'border-green-500';
    case 'cancelled': return 'border-red-500';
    default: return 'border-gray-500';
  }
}

function getStatusClass(status) {
  const baseClasses = 'text-xs font-semibold px-3 py-1 rounded-full';

  switch (status?.toLowerCase()) {
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'ongoing':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function updateStats(bookings) {
  if (!statsElements) return;

  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    totalSpent: bookings
      .filter(b => b.status === 'Completed')
      .reduce((sum, b) => sum + (b.payment?.amount || b.price || 0), 0)
  };

  if (statsElements.total) statsElements.total.textContent = stats.total;
  if (statsElements.completed) statsElements.completed.textContent = stats.completed;
  if (statsElements.pending) statsElements.pending.textContent = stats.pending;
  if (statsElements.totalSpent) statsElements.totalSpent.textContent = `₱${stats.totalSpent.toLocaleString()}`;
}

function filterBookings() {
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('status-filter')?.value || 'all';
  const serviceFilter = document.getElementById('service-filter')?.value || 'all';

  const bookingItems = document.querySelectorAll('[data-booking-id]');

  bookingItems.forEach(item => {
    const bookingText = item.textContent.toLowerCase();
    const bookingStatus = item.dataset.status;
    const bookingService = item.dataset.service;

    const matchesSearch = searchTerm === '' || bookingText.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || bookingStatus === statusFilter.toLowerCase();
    const matchesService = serviceFilter === 'all' || bookingService.includes(serviceFilter.toLowerCase());

    if (matchesSearch && matchesStatus && matchesService) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function clearAllFilters() {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const serviceFilter = document.getElementById('service-filter');

  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = 'all';
  if (serviceFilter) serviceFilter.value = 'all';

  filterBookings();
}

function showLoading() {
  if (bookingsList) {
    bookingsList.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-10 text-center">
                <i class="fas fa-spinner fa-spin text-blue-dark text-4xl mb-4"></i>
                <h3 class="text-xl font-bold text-navy mb-2">Loading Bookings...</h3>
                <p class="text-gray-600">Please wait while we fetch your appointments.</p>
            </div>
        `;
  }
}

function hideLoading() {
  // Loading will be replaced by actual content
}

function showNoBookings() {
  if (bookingsList) {
    bookingsList.innerHTML = '';
  }
  if (noBookingsDiv) {
    noBookingsDiv.classList.remove('hidden');
  }
}

function hideNoBookings() {
  if (noBookingsDiv) {
    noBookingsDiv.classList.add('hidden');
  }
}

function showError(message) {
  if (bookingsList) {
    bookingsList.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-10 text-center">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h3 class="text-xl font-bold text-navy mb-2">Error Loading Bookings</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <div class="space-y-2">
                    <button onclick="loadBookings()" class="bg-blue-dark text-white px-6 py-2 rounded-lg hover:bg-navy transition-colors mr-2">
                        Try Again
                    </button>
                    <a href="../auth/login.html" class="bg-brown text-white px-6 py-2 rounded-lg hover:bg-brown/90 transition-colors inline-block">
                        Login
                    </a>
                </div>
            </div>
        `;
  }
}

function showSuccess(message) {
  // Create a temporary success message
  const successDiv = document.createElement('div');
  successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  successDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// Make loadBookings available globally for retry functionality
window.loadBookings = loadBookings;
