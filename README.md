# Prodigy Auto Care - Car Wash Booking System

A modern web application for managing car wash bookings with Firebase backend.

## Project Structure

```
/
├── index.html                          # Root redirect to landing page
├── .vscode/
│   └── settings.json                   # VS Code workspace settings
├── public/                             # Static assets and scripts
│   ├── assets/
│   │   ├── images/                     # Image assets
│   │   ├── fonts/                      # Font files
│   │   └── styles/
│   │       └── global.css              # Global CSS styles
│   └── scripts/                        # JavaScript modules
│       ├── firebase.js                 # Firebase configuration and core functions
│       ├── admin.js                    # Admin-specific functionality
│       ├── customer.js                 # Customer-specific functionality
│       ├── customer-home.js            # Customer home page logic
│       ├── auth.js                     # Authentication functions
│       ├── seed.js                     # Database seeding utilities
│       └── utils.js                    # Shared utility functions
├── pages/                              # HTML pages organized by role
│   ├── admin/                          # Admin dashboard pages
│   │   ├── dashboard.html              # Admin dashboard
│   │   ├── bookings.html               # Manage bookings
│   │   ├── staff.html                  # Staff management
│   │   ├── settings.html               # System settings
│   │   └── reports.html                # Business reports
│   ├── customer/                       # Customer pages
│   │   ├── home.html                   # Booking interface
│   │   ├── vehicles.html               # Vehicle management
│   │   ├── profile.html                # User profile
│   │   └── bookings.html               # Booking history
│   ├── auth/                           # Authentication pages
│   │   ├── login.html                  # Sign in page
│   │   └── register.html               # Sign up page
│   ├── landing.html                    # Public landing page
│   └── seed.html                       # Database seeding tool
└── README.md                           # This file
```

## Features

### Customer Features
- **Service Booking**: Choose from Basic, Premium, or Deluxe car wash services
- **Vehicle Management**: Add and manage multiple vehicles
- **Real-time Availability**: View available time slots with live updates
- **Booking History**: Track past and upcoming bookings
- **Loyalty Points**: Earn points with each service
- **Profile Management**: Update personal information and preferences

### Admin Features
- **Dashboard**: Overview of daily operations and statistics
- **Booking Management**: View, update, and assign bookings to staff
- **Staff Management**: Manage washer profiles and availability
- **Availability Control**: Set working hours and capacity limits
- **Business Reports**: Revenue analytics and performance metrics
- **System Settings**: Configure business rules and pricing

### Technical Features
- **Firebase Integration**: Real-time database with Firestore
- **Authentication**: Secure login with role-based access
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern JavaScript**: ES6 modules with clean separation of concerns
- **Real-time Updates**: Live data synchronization
- **Scalable Architecture**: Modular design for easy maintenance

## Firebase Schema

### Collections

#### `users`
```javascript
{
  fullName: string,
  email: string,
  role: 'customer' | 'washer' | 'admin',
  phoneNumber: string,
  loyaltyPoints: number,
  subscription: {
    active: boolean,
    type: string,
    startDate: timestamp,
    endDate: timestamp
  },
  createdAt: timestamp
}
```

#### `vehicles`
```javascript
{
  userId: string,
  make: string,
  vehicle_type: string,
  model: string,
  plateNumber: string,
  createdAt: timestamp
}
```

#### `bookings`
```javascript
{
  userId: string,
  washerId: string | null,
  vehicleId: string,
  service: string,
  date: string,
  time: string,
  status: 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled',
  payment: {
    method: string,
    status: string,
    amount: number
  },
  promoCode: string | null,
  loyaltyPointsUsed: number,
  rating: number | null,
  review: string | null,
  createdAt: timestamp
}
```

#### `services`
```javascript
{
  name: string,
  description: string,
  price: number,
  durationMinutes: number
}
```

#### `availability`
```javascript
// Document ID: YYYY-MM-DD
{
  '10:00 AM': {
    available: boolean,
    maxBookings: number,
    currentBookings: number
  },
  // ... other time slots
}
```

## Development Setup

1. **Clone the repository**
2. **Configure Firebase**:
   - Update Firebase configuration in `public/scripts/firebase.js`
   - Set up Firestore security rules
3. **Seed the database**:
   - Open `pages/seed.html` in browser
   - Click "Seed All Data" to populate initial data
4. **Development Server**:
   - Use Live Server extension in VS Code
   - Or serve with any static file server

## File Organization Principles

### HTML Pages
- Each HTML file imports only the specific JavaScript modules it needs
- Common styles are loaded from `global.css`
- Tailwind configuration is consistent across all pages
- Clean separation between content and functionality

### JavaScript Modules
- **firebase.js**: Core Firebase setup and authentication
- **admin.js**: Admin-specific functionality (dashboard, reports, etc.)
- **customer.js**: Customer-specific functionality (bookings, vehicles)
- **auth.js**: Authentication forms and validation
- **utils.js**: Shared utility functions
- **seed.js**: Database initialization and seeding

### CSS Organization
- **global.css**: Contains all shared styles, animations, and utility classes
- Page-specific styles are minimal and inline when necessary
- Consistent use of Tailwind utility classes

## Navigation Structure

### User Roles & Access
- **Public**: Landing page, login, register
- **Customer**: Home (booking), vehicles, profile, booking history
- **Admin**: Dashboard, bookings management, staff management, settings, reports

### Inter-page Navigation
- Relative paths used for cross-references
- Role-based redirects after authentication
- Breadcrumb navigation in admin pages

## Best Practices Implemented

1. **Modular Architecture**: Clean separation of concerns
2. **Responsive Design**: Mobile-first approach
3. **Security**: Role-based access control
4. **Performance**: Optimized loading and caching
5. **Maintainability**: Clear file organization and documentation
6. **User Experience**: Intuitive navigation and feedback

## Future Enhancements

- Payment gateway integration
- SMS notifications
- Advanced reporting with charts
- Mobile app development
- API for third-party integrations
