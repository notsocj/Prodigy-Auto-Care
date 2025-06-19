// Project Configuration for Prodigy Auto Care
export const projectConfig = {
  // Application Information
  name: 'Prodigy Auto Care',
  version: '1.0.0',
  description: 'Car wash booking and management system',

  // File Structure Paths
  paths: {
    root: '/',
    pages: '/pages/',
    assets: '/public/assets/',
    scripts: '/public/scripts/',
    styles: '/public/assets/styles/',
    images: '/public/assets/images/',

    // Page Categories
    admin: '/pages/admin/',
    customer: '/pages/customer/',
    auth: '/pages/auth/',

    // Specific Pages
    landing: '/pages/landing.html',
    login: '/pages/auth/login.html',
    register: '/pages/auth/register.html',
    dashboard: '/pages/admin/dashboard.html',
    customerHome: '/pages/customer/home.html'
  },

  // Script Dependencies
  scripts: {
    // Core modules (required by most pages)
    core: [
      '/public/scripts/firebase.js',
      '/public/scripts/utils.js'
    ],

    // Role-specific modules
    admin: [
      '/public/scripts/firebase.js',
      '/public/scripts/admin.js',
      '/public/scripts/utils.js'
    ],

    customer: [
      '/public/scripts/firebase.js',
      '/public/scripts/customer.js',
      '/public/scripts/utils.js'
    ],

    auth: [
      '/public/scripts/firebase.js',
      '/public/scripts/auth.js',
      '/public/scripts/utils.js'
    ],

    // Page-specific modules
    customerHome: [
      '/public/scripts/firebase.js',
      '/public/scripts/customer-home.js',
      '/public/scripts/utils.js'
    ],

    seed: [
      '/public/scripts/firebase.js',
      '/public/scripts/seed.js'
    ]
  },

  // CSS Dependencies
  styles: {
    // Global styles (required by all pages)
    global: [
      '/public/assets/styles/global.css'
    ],

    // External CDN styles
    external: [
      'https://cdn.tailwindcss.com',
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ],

    // Page-specific external styles
    flatpickr: 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'
  },

  // Navigation Structure
  navigation: {
    public: {
      landing: { title: 'Home', path: '/pages/landing.html' },
      login: { title: 'Sign In', path: '/pages/auth/login.html' },
      register: { title: 'Sign Up', path: '/pages/auth/register.html' }
    },

    customer: {
      home: { title: 'Book Service', path: '/pages/customer/home.html' },
      vehicles: { title: 'My Vehicles', path: '/pages/customer/vehicles.html' },
      bookings: { title: 'My Bookings', path: '/pages/customer/bookings.html' },
      profile: { title: 'Profile', path: '/pages/customer/profile.html' }
    },

    admin: {
      dashboard: { title: 'Dashboard', path: '/pages/admin/dashboard.html' },
      bookings: { title: 'Manage Bookings', path: '/pages/admin/bookings.html' },
      staff: { title: 'Staff Management', path: '/pages/admin/staff.html' },
      settings: { title: 'Settings', path: '/pages/admin/settings.html' },
      reports: { title: 'Reports', path: '/pages/admin/reports.html' }
    }
  },

  // User Roles and Permissions
  roles: {
    public: {
      name: 'Guest',
      permissions: ['view_landing', 'login', 'register'],
      defaultRedirect: '/pages/landing.html'
    },

    customer: {
      name: 'Customer',
      permissions: ['book_service', 'manage_vehicles', 'view_bookings', 'update_profile'],
      defaultRedirect: '/pages/customer/home.html',
      navigation: 'customer'
    },

    washer: {
      name: 'Washer',
      permissions: ['view_assignments', 'update_booking_status'],
      defaultRedirect: '/pages/customer/home.html', // Temporary until washer pages are built
      navigation: 'customer'
    },

    admin: {
      name: 'Administrator',
      permissions: ['manage_all', 'view_reports', 'manage_staff', 'system_settings'],
      defaultRedirect: '/pages/admin/dashboard.html',
      navigation: 'admin'
    }
  },

  // Firebase Collection Names
  collections: {
    users: 'users',
    vehicles: 'vehicles',
    bookings: 'bookings',
    washers: 'washers',
    services: 'services',
    promoCodes: 'promoCodes',
    notifications: 'notifications',
    adminSettings: 'adminSettings',
    availability: 'availability'
  },

  // Application Settings
  settings: {
    // Time slots configuration
    timeSlots: [
      '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ],

    // Booking configuration
    maxBookingsPerSlot: 3,
    maxAdvanceBookingDays: 90,
    businessClosedDays: [0], // Sunday = 0

    // Services configuration
    services: [
      { name: 'Basic Wash', price: 200, duration: 30 },
      { name: 'Premium Wash', price: 350, duration: 60 },
      { name: 'Deluxe Wash', price: 500, duration: 90 }
    ]
  }
};

// Export for use in other modules
export default projectConfig;
