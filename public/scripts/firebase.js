// Firebase Core Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export async function registerUser(email, password, fullName, phoneNumber) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: email,
            role: "customer",
            phoneNumber: phoneNumber,
            loyaltyPoints: 0,
            subscription: {
                active: false,
                type: null,
                startDate: null,
                endDate: null
            },
            createdAt: serverTimestamp()
        });

        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// User data functions
export async function getCurrentUser() {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        return { uid: user.uid, ...userDoc.data() };
    }
    return null;
}

// Vehicle functions
export async function getUserVehicles() {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(collection(db, "vehicles"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const vehicles = [];
    querySnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() });
    });

    return vehicles;
}

export async function addVehicle(make, model, plateNumber, vehicleType = null) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const vehicleData = {
        userId: user.uid,
        make,
        model,
        vehicle_type: vehicleType || "Sedan", // Default to Sedan if not provided
        plateNumber,
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "vehicles"), vehicleData);
    return { id: docRef.id, ...vehicleData };
}

// Add function to update vehicle
export async function updateVehicle(vehicleId, make, model, vehicleType, plateNumber) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const vehicleData = {
        make,
        model,
        vehicle_type: vehicleType,
        plateNumber
    };

    await updateDoc(doc(db, "vehicles", vehicleId), vehicleData);
    return { id: vehicleId, ...vehicleData };
}

// Add function to delete vehicle
export async function deleteVehicle(vehicleId) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, "vehicles", vehicleId));
    return true;
}

// Services functions
export async function getServices() {
    const servicesSnapshot = await getDocs(collection(db, "services"));

    const services = [];
    servicesSnapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() });
    });

    return services;
}

// Availability functions
export async function getAvailability(date) {
    try {
        const availabilityRef = doc(db, "availability", date);
        const availabilityDoc = await getDoc(availabilityRef);

        if (availabilityDoc.exists()) {
            return availabilityDoc.data();
        }

        console.log(`No availability data found for date: ${date}`);
        return null;
    } catch (error) {
        console.error('Error getting availability for', date, ':', error);
        return null;
    }
}

export async function checkDateAvailability(date) {
    try {
        const availability = await getAvailability(date);

        if (!availability) {
            console.log(`No availability document for ${date}`);
            return false;
        }

        // Check if any time slot has available spots
        for (const time in availability) {
            const slot = availability[time];
            if (slot && slot.available && slot.currentBookings < slot.maxBookings) {
                return true;
            }
        }

        console.log(`No available slots for ${date}`);
        return false;
    } catch (error) {
        console.error('Error checking date availability for', date, ':', error);
        return false;
    }
}

// Booking functions
export async function createBooking(vehicleId, service, date, time, paymentMethod, promoCode = null, loyaltyPointsUsed = 0) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
        // First, check if the time slot is still available
        const availability = await getAvailability(date);
        if (!availability || !availability[time]) {
            throw new Error("Selected time slot is not available");
        }

        const timeSlot = availability[time];
        if (!timeSlot.available) {
            throw new Error("Selected time slot is not available");
        }

        // Get service details to check if it's premium
        const serviceQuery = query(collection(db, "services"), where("name", "==", service));
        const serviceSnapshot = await getDocs(serviceQuery);

        if (serviceSnapshot.empty) {
            throw new Error("Service not found");
        }

        const serviceData = serviceSnapshot.docs[0].data();
        const amount = serviceData.price;
        const isPremium = serviceData.isPremium || false;

        // Check availability based on service type
        if (isPremium) {
            const currentPremiumBookings = timeSlot.currentPremiumBookings || 0;
            const maxPremiumBookings = timeSlot.maxPremiumBookings || 1;
            if (currentPremiumBookings >= maxPremiumBookings) {
                throw new Error("Selected time slot is fully booked for premium services");
            }
        } else {
            const currentBookings = timeSlot.currentBookings || 0;
            const maxBookings = timeSlot.maxBookings || 3;
            if (currentBookings >= maxBookings) {
                throw new Error("Selected time slot is fully booked for regular services");
            }
        }

        const bookingData = {
            userId: user.uid,
            washerId: null, // Will be assigned later by admin
            vehicleId,
            service,
            date,
            time,
            status: "Pending",
            payment: {
                method: paymentMethod,
                status: "Pending",
                amount
            },
            promoCode,
            loyaltyPointsUsed,
            rating: null,
            review: null,
            createdAt: serverTimestamp()
        };

        // Create the booking
        const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

        // Update the availability atomically based on service type
        const availabilityRef = doc(db, "availability", date);
        const updateData = {};

        if (isPremium) {
            const newPremiumCount = (timeSlot.currentPremiumBookings || 0) + 1;
            updateData[`${time}.currentPremiumBookings`] = newPremiumCount;

            // Check if both regular and premium are at capacity
            const regularAtCapacity = (timeSlot.currentBookings || 0) >= (timeSlot.maxBookings || 3);
            const premiumAtCapacity = newPremiumCount >= (timeSlot.maxPremiumBookings || 1);
            updateData[`${time}.available`] = !(regularAtCapacity && premiumAtCapacity);
        } else {
            const newRegularCount = (timeSlot.currentBookings || 0) + 1;
            updateData[`${time}.currentBookings`] = newRegularCount;

            // Check if both regular and premium are at capacity
            const regularAtCapacity = newRegularCount >= (timeSlot.maxBookings || 3);
            const premiumAtCapacity = (timeSlot.currentPremiumBookings || 0) >= (timeSlot.maxPremiumBookings || 1);
            updateData[`${time}.available`] = !(regularAtCapacity && premiumAtCapacity);
        }

        await updateDoc(availabilityRef, updateData);

        return { id: bookingRef.id, ...bookingData };

    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

export async function getUserBookings() {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const bookings = [];
    querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
    });

    return bookings;
}

// Add function to update booking rating
export async function updateBookingRating(bookingId, rating, review = null) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const updateData = {
        rating: rating
    };

    if (review) {
        updateData.review = review;
    }

    await updateDoc(doc(db, "bookings", bookingId), updateData);
    return true;
}

// Add function to cancel booking
export async function cancelBooking(bookingId) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Get booking details first to update availability
    const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
    if (!bookingDoc.exists()) {
        throw new Error("Booking not found");
    }

    const booking = bookingDoc.data();

    // Get service details to check if it's premium
    const serviceQuery = query(collection(db, "services"), where("name", "==", booking.service));
    const serviceSnapshot = await getDocs(serviceQuery);

    let isPremium = false;
    if (!serviceSnapshot.empty) {
        const serviceData = serviceSnapshot.docs[0].data();
        isPremium = serviceData.isPremium || false;
    }

    // Update booking status
    await updateDoc(doc(db, "bookings", bookingId), {
        status: "Cancelled"
    });

    // Update availability (decrease currentBookings/currentPremiumBookings and update available status)
    const availabilityRef = doc(db, "availability", booking.date);
    const availabilityDoc = await getDoc(availabilityRef);

    if (availabilityDoc.exists()) {
        const availability = availabilityDoc.data();
        const timeSlot = availability[booking.time];

        if (timeSlot) {
            const updateData = {};

            if (isPremium) {
                const newPremiumCount = Math.max(0, (timeSlot.currentPremiumBookings || 0) - 1);
                updateData[`${booking.time}.currentPremiumBookings`] = newPremiumCount;

                // Update availability - available if either regular or premium has space
                const regularHasSpace = (timeSlot.currentBookings || 0) < (timeSlot.maxBookings || 3);
                const premiumHasSpace = newPremiumCount < (timeSlot.maxPremiumBookings || 1);
                updateData[`${booking.time}.available`] = regularHasSpace || premiumHasSpace;
            } else {
                const newRegularCount = Math.max(0, (timeSlot.currentBookings || 0) - 1);
                updateData[`${booking.time}.currentBookings`] = newRegularCount;

                // Update availability - available if either regular or premium has space
                const regularHasSpace = newRegularCount < (timeSlot.maxBookings || 3);
                const premiumHasSpace = (timeSlot.currentPremiumBookings || 0) < (timeSlot.maxPremiumBookings || 1);
                updateData[`${booking.time}.available`] = regularHasSpace || premiumHasSpace;
            }

            await updateDoc(availabilityRef, updateData);
        }
    }

    return true;
}

export { auth, db };

// Export individual Firebase functions for direct use in utility scripts
export {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
