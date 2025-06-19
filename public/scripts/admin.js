// Admin-specific services
import { auth, db } from './firebase.js';
import {
    onAdminAuthChange as adminOnAdminAuthChange,
    getDashboardStats as adminGetDashboardStats,
    getRecentBookings as adminGetRecentBookings,
    getActiveStaff as adminGetActiveStaff,
    updateBookingStatus as adminUpdateBookingStatus,
    updateWasherAvailability as adminUpdateWasherAvailability,
    assignWasherToBooking as adminAssignWasherToBooking,
    getAvailability as adminGetAvailability,
    updateDateAvailability as adminUpdateDateAvailability,
    deleteAvailability as adminDeleteAvailability,
    getAvailabilityRange as adminGetAvailabilityRange,
    updateTimeSlotBookingCount as adminUpdateTimeSlotBookingCount,
    checkTimeSlotAvailability as adminCheckTimeSlotAvailability,
    getBookingsForDate as adminGetBookingsForDate
} from '../../admin-firebase.js';

// Auth functions
export function onAdminAuthChange(callback) {
    return adminOnAdminAuthChange(callback);
}

// Dashboard statistics
export async function getDashboardStats() {
    return await adminGetDashboardStats();
}

// Get recent bookings for admin dashboard
export async function getRecentBookings(count = 5) {
    return await adminGetRecentBookings(count);
}

// Get active staff details
export async function getActiveStaff() {
    return await adminGetActiveStaff();
}

// Update booking status
export async function updateBookingStatus(bookingId, status) {
    return await adminUpdateBookingStatus(bookingId, status);
}

// Update washer availability
export async function updateWasherAvailability(washerId, availability) {
    return await adminUpdateWasherAvailability(washerId, availability);
}

// Assign washer to booking
export async function assignWasherToBooking(bookingId, washerId) {
    return await adminAssignWasherToBooking(bookingId, washerId);
}

// Availability management functions
export async function getAvailability(dateString) {
    return await adminGetAvailability(dateString);
}

// Create or update availability for a date
export async function updateDateAvailability(dateString, timeSlots) {
    return await adminUpdateDateAvailability(dateString, timeSlots);
}

// Delete availability for a specific date
export async function deleteAvailability(dateString) {
    return await adminDeleteAvailability(dateString);
}

// Get availability for multiple dates
export async function getAvailabilityRange(startDate, endDate) {
    return await adminGetAvailabilityRange(startDate, endDate);
}

// Update specific time slot booking count
export async function updateTimeSlotBookingCount(dateString, timeSlot, increment = true) {
    return await adminUpdateTimeSlotBookingCount(dateString, timeSlot, increment);
}

// Check if a specific time slot is available
export async function checkTimeSlotAvailability(dateString, timeSlot) {
    return await adminCheckTimeSlotAvailability(dateString, timeSlot);
}

// Get all bookings for a specific date (for admin view)
export async function getBookingsForDate(dateString) {
    return await adminGetBookingsForDate(dateString);
}
