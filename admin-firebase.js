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

// Create or update availability for a date
export async function updateDateAvailability(dateString, timeSlots) {
    await setDoc(doc(db, "availability", dateString), timeSlots);
    return true;
}

export { auth, db };
