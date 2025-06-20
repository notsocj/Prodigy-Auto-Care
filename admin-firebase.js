import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBG1Bi80gvK9MnB86MFDbZ8YLfpgETwkxE",
    authDomain: "prodigy-367f0.firebaseapp.com",
    projectId: "prodigy-367f0",
    storageBucket: "prodigy-367f0.firebasestorage.app",
    messagingSenderId: "434896015978",
    appId: "1:434896015978:web:c54f3fe7a678f61af3f013",
    measurementId: "G-4G8XNHBV7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export function onAdminAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Check if user is admin
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                callback(user, true);
            } else {
                callback(null, false);
            }
        } else {
            callback(null, false);
        }
    });
}

// Dashboard statistics
export async function getDashboardStats() {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get today's bookings
    const bookingsQuery = query(
        collection(db, "bookings"),
        where("date", "==", todayStr)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const todayBookings = bookingsSnapshot.size;

    // Calculate today's revenue
    let todayRevenue = 0;
    bookingsSnapshot.forEach(doc => {
        const booking = doc.data();
        if (booking.payment && booking.payment.amount) {
            todayRevenue += booking.payment.amount;
        }
    });

    // Get active staff (washers with "On Work" status)
    const washersQuery = query(
        collection(db, "washers"),
        where("availability", "==", "On Work")
    );
    const washersSnapshot = await getDocs(washersQuery);
    const activeStaff = washersSnapshot.size;

    // Get average rating
    const ratingsQuery = query(
        collection(db, "bookings"),
        where("rating", ">=", 1)
    );
    const ratingsSnapshot = await getDocs(ratingsQuery);
    let totalRating = 0;
    let ratingCount = 0;

    ratingsSnapshot.forEach(doc => {
        const booking = doc.data();
        if (booking.rating) {
            totalRating += booking.rating;
            ratingCount++;
        }
    });

    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "N/A";

    return {
        todayBookings,
        todayRevenue,
        activeStaff,
        avgRating
    };
}

// Get recent bookings for admin dashboard
export async function getRecentBookings(count = 5) {
    const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc"),
        limit(count)
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = [];

    for (const docSnapshot of bookingsSnapshot.docs) {
        const booking = { id: docSnapshot.id, ...docSnapshot.data() };

        // Get user details
        if (booking.userId) {
            const userDoc = await getDoc(doc(db, "users", booking.userId));
            if (userDoc.exists()) {
                booking.user = userDoc.data();
            }
        }

        // Get vehicle details
        if (booking.vehicleId) {
            const vehicleDoc = await getDoc(doc(db, "vehicles", booking.vehicleId));
            if (vehicleDoc.exists()) {
                booking.vehicle = vehicleDoc.data();
            }
        }

        bookings.push(booking);
    }

    return bookings;
}

// Get active staff details
export async function getActiveStaff() {
    const washersQuery = query(collection(db, "washers"));
    const washersSnapshot = await getDocs(washersQuery);

    const washers = [];

    for (const docSnapshot of washersSnapshot.docs) {
        const washer = { id: docSnapshot.id, ...docSnapshot.data() };

        // Get user details
        if (washer.userId) {
            const userDoc = await getDoc(doc(db, "users", washer.userId));
            if (userDoc.exists()) {
                washer.user = userDoc.data();
            }
        }

        washers.push(washer);
    }

    return washers;
}

// Update booking status
export async function updateBookingStatus(bookingId, status) {
    await updateDoc(doc(db, "bookings", bookingId), {
        status: status
    });
    return true;
}

// Update washer availability
export async function updateWasherAvailability(washerId, availability) {
    await updateDoc(doc(db, "washers", washerId), {
        availability: availability
    });
    return true;
}

// Assign washer to booking
export async function assignWasherToBooking(bookingId, washerId) {
    await updateDoc(doc(db, "bookings", bookingId), {
        washerId: washerId
    });

    // Update washer's assigned bookings
    const washerDoc = await getDoc(doc(db, "washers", washerId));
    if (washerDoc.exists()) {
        const washer = washerDoc.data();
        const assignedBookings = washer.assignedBookings || [];

        if (!assignedBookings.includes(bookingId)) {
            assignedBookings.push(bookingId);
            await updateDoc(doc(db, "washers", washerId), {
                assignedBookings: assignedBookings
            });
        }
    }

    return true;
}

// Availability management functions
export async function getAvailability(dateString) {
    try {
        const availabilityRef = doc(db, "availability", dateString);
        const availabilityDoc = await getDoc(availabilityRef);

        if (availabilityDoc.exists()) {
            return availabilityDoc.data();
        }

        return null;
    } catch (error) {
        console.error('Error getting availability for', dateString, ':', error);
        throw error;
    }
}

// Create or update availability for a date
export async function updateDateAvailability(dateString, timeSlots) {
    try {
        await setDoc(doc(db, "availability", dateString), timeSlots);
        return true;
    } catch (error) {
        console.error('Error updating availability for', dateString, ':', error);
        throw error;
    }
}

// Delete availability for a specific date
export async function deleteAvailability(dateString) {
    try {
        await deleteDoc(doc(db, "availability", dateString));
        return true;
    } catch (error) {
        console.error('Error deleting availability for', dateString, ':', error);
        throw error;
    }
}

// Get availability for multiple dates
export async function getAvailabilityRange(startDate, endDate) {
    try {
        const availabilityData = {};
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dateString = currentDate.toISOString().split('T')[0];
            const availability = await getAvailability(dateString);

            if (availability) {
                availabilityData[dateString] = availability;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return availabilityData;
    } catch (error) {
        console.error('Error getting availability range:', error);
        throw error;
    }
}

// Update specific time slot booking count with premium support
export async function updateTimeSlotBookingCount(dateString, timeSlot, increment = true, isPremium = false) {
    try {
        const availabilityRef = doc(db, "availability", dateString);
        const availabilityDoc = await getDoc(availabilityRef);

        if (availabilityDoc.exists()) {
            const availability = availabilityDoc.data();

            if (availability[timeSlot]) {
                const slot = availability[timeSlot];

                // Current counts
                const currentBookings = slot.currentBookings || 0;
                const currentPremiumBookings = slot.currentPremiumBookings || 0;

                // Max limits
                const maxBookings = slot.maxBookings || 3;
                const maxPremiumBookings = slot.maxPremiumBookings || 1;

                let newBookingCount, newPremiumBookingCount;

                if (isPremium) {
                    // Handle premium booking
                    if (increment) {
                        newPremiumBookingCount = Math.min(currentPremiumBookings + 1, maxPremiumBookings);
                    } else {
                        newPremiumBookingCount = Math.max(currentPremiumBookings - 1, 0);
                    }
                    newBookingCount = currentBookings; // Regular bookings unchanged
                } else {
                    // Handle regular booking
                    if (increment) {
                        newBookingCount = Math.min(currentBookings + 1, maxBookings);
                    } else {
                        newBookingCount = Math.max(currentBookings - 1, 0);
                    }
                    newPremiumBookingCount = currentPremiumBookings; // Premium bookings unchanged
                }

                // Check if slot should be marked unavailable
                const isAvailable = newBookingCount < maxBookings || newPremiumBookingCount < maxPremiumBookings;

                await updateDoc(availabilityRef, {
                    [`${timeSlot}.currentBookings`]: newBookingCount,
                    [`${timeSlot}.currentPremiumBookings`]: newPremiumBookingCount,
                    [`${timeSlot}.available`]: isAvailable
                });

                return true;
            }
        }

        throw new Error(`Time slot ${timeSlot} not found for date ${dateString}`);
    } catch (error) {
        console.error('Error updating time slot booking count:', error);
        throw error;
    }
}

// Check if a specific time slot is available for premium or regular bookings
export async function checkTimeSlotAvailability(dateString, timeSlot, isPremium = false) {
    try {
        const availability = await getAvailability(dateString);

        if (!availability || !availability[timeSlot]) {
            return false;
        }

        const slot = availability[timeSlot];

        if (!slot.available) {
            return false;
        }

        if (isPremium) {
            // Check premium availability
            const currentPremiumBookings = slot.currentPremiumBookings || 0;
            const maxPremiumBookings = slot.maxPremiumBookings || 1;
            return currentPremiumBookings < maxPremiumBookings;
        } else {
            // Check regular availability
            const currentBookings = slot.currentBookings || 0;
            const maxBookings = slot.maxBookings || 3;
            return currentBookings < maxBookings;
        }
    } catch (error) {
        console.error('Error checking time slot availability:', error);
        return false;
    }
}

// Get all bookings for a specific date (for admin view)
export async function getBookingsForDate(dateString) {
    try {
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("date", "==", dateString),
            orderBy("time", "asc")
        );

        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookings = [];

        for (const docSnapshot of bookingsSnapshot.docs) {
            const booking = { id: docSnapshot.id, ...docSnapshot.data() };

            // Get user details
            if (booking.userId) {
                const userDoc = await getDoc(doc(db, "users", booking.userId));
                if (userDoc.exists()) {
                    booking.user = userDoc.data();
                }
            }

            // Get vehicle details
            if (booking.vehicleId) {
                const vehicleDoc = await getDoc(doc(db, "vehicles", booking.vehicleId));
                if (vehicleDoc.exists()) {
                    booking.vehicle = vehicleDoc.data();
                }
            }

            bookings.push(booking);
        }

        return bookings;
    } catch (error) {
        console.error('Error getting bookings for date:', error);
        throw error;
    }
}

// Service management functions
export async function getServices() {
    try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const services = [];
        servicesSnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
        });
        return services;
    } catch (error) {
        console.error('Error getting services:', error);
        throw error;
    }
}

export async function createService(serviceData) {
    try {
        const serviceRef = doc(collection(db, "services"));
        await setDoc(serviceRef, {
            ...serviceData,
            createdAt: serverTimestamp()
        });
        return serviceRef.id;
    } catch (error) {
        console.error('Error creating service:', error);
        throw error;
    }
}

export async function updateService(serviceId, serviceData) {
    try {
        await updateDoc(doc(db, "services", serviceId), serviceData);
        return true;
    } catch (error) {
        console.error('Error updating service:', error);
        throw error;
    }
}

export async function deleteService(serviceId) {
    try {
        await deleteDoc(doc(db, "services", serviceId));
        return true;
    } catch (error) {
        console.error('Error deleting service:', error);
        throw error;
    }
}

export async function getServiceByName(serviceName) {
    try {
        const serviceQuery = query(collection(db, "services"), where("name", "==", serviceName));
        const serviceSnapshot = await getDocs(serviceQuery);

        if (serviceSnapshot.empty) {
            return null;
        }

        const serviceDoc = serviceSnapshot.docs[0];
        return { id: serviceDoc.id, ...serviceDoc.data() };
    } catch (error) {
        console.error('Error getting service by name:', error);
        throw error;
    }
}

export { auth, db };
