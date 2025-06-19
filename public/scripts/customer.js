// Customer-specific services
import {
    auth,
    db,
    getUserVehicles as firebaseGetUserVehicles,
    addVehicle as firebaseAddVehicle,
    updateVehicle as firebaseUpdateVehicle,
    deleteVehicle as firebaseDeleteVehicle,
    getUserBookings as firebaseGetUserBookings,
    createBooking as firebaseCreateBooking,
    updateBookingRating as firebaseUpdateBookingRating,
    cancelBooking as firebaseCancelBooking,
    getServices as firebaseGetServices,
    getAvailability as firebaseGetAvailability,
    checkDateAvailability as firebaseCheckDateAvailability
} from './firebase.js';

// Vehicle functions
export async function getUserVehicles() {
    return await firebaseGetUserVehicles();
}

export async function addVehicle(make, model, plateNumber, vehicleType = null) {
    return await firebaseAddVehicle(make, model, plateNumber, vehicleType);
}

export async function updateVehicle(vehicleId, make, model, vehicleType, plateNumber) {
    return await firebaseUpdateVehicle(vehicleId, make, model, vehicleType, plateNumber);
}

export async function deleteVehicle(vehicleId) {
    return await firebaseDeleteVehicle(vehicleId);
}

// Booking functions
export async function getUserBookings() {
    return await firebaseGetUserBookings();
}

export async function createBooking(vehicleId, service, date, time, paymentMethod, promoCode = null, loyaltyPointsUsed = 0) {
    return await firebaseCreateBooking(vehicleId, service, date, time, paymentMethod, promoCode, loyaltyPointsUsed);
}

export async function updateBookingRating(bookingId, rating, review = null) {
    return await firebaseUpdateBookingRating(bookingId, rating, review);
}

export async function cancelBooking(bookingId) {
    return await firebaseCancelBooking(bookingId);
}

// Services functions
export async function getServices() {
    return await firebaseGetServices();
}

// Availability functions
export async function getAvailability(date) {
    return await firebaseGetAvailability(date);
}

export async function checkDateAvailability(date) {
    return await firebaseCheckDateAvailability(date);
}
