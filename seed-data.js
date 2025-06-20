import {
    getFirestore,
    collection,
    doc,
    setDoc,
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
const db = getFirestore(app);

// Seed services data
export async function seedServices() {
    const services = [
        {
            name: "Basic Wash",
            description: "Exterior cleaning only",
            price: 200,
            durationMinutes: 30,
            isPremium: false
        },
        {
            name: "Premium Wash",
            description: "Interior + Exterior cleaning",
            price: 350,
            durationMinutes: 60,
            isPremium: false
        },
        {
            name: "Deluxe Wash",
            description: "Full service + wax",
            price: 500,
            durationMinutes: 90,
            isPremium: false
        },
        {
            name: "Premium Detail",
            description: "Complete premium detailing service with specialized equipment",
            price: 800,
            durationMinutes: 120,
            isPremium: true
        },
        {
            name: "Executive Detail",
            description: "Luxury detailing service for high-end vehicles",
            price: 1200,
            durationMinutes: 180,
            isPremium: true
        }
    ];

    for (const service of services) {
        await setDoc(doc(collection(db, "services")), service);
    }

    console.log("Services seeded successfully");
}

// Seed availability data for the next 30 days
export async function seedAvailability() {
    const timeSlots = {
        "08:00 AM": { label: "Morning Slot 1", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "09:00 AM": { label: "Morning Slot 2", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "10:00 AM": { label: "Morning Slot 3", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "11:00 AM": { label: "Morning Slot 4", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "12:00 PM": { label: "Lunch Slot", available: true, maxBookings: 2, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 }, // Lunch break - fewer slots
        "01:00 PM": { label: "Afternoon Slot 1", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "02:00 PM": { label: "Afternoon Slot 2", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "03:00 PM": { label: "Afternoon Slot 3", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "04:00 PM": { label: "Afternoon Slot 4", available: true, maxBookings: 3, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
        "05:00 PM": { label: "Evening Slot", available: true, maxBookings: 2, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 }  // End of day - fewer slots
    };

    const today = new Date();
    let successCount = 0;

    console.log('Starting availability seeding...');

    for (let i = 1; i <= 90; i++) { // Start from tomorrow, seed for next 90 days
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Skip Sundays (day 0) - business closed
        if (date.getDay() === 0) {
            console.log(`Skipping Sunday: ${date.toISOString().split('T')[0]}`);
            continue;
        }

        // Reduce slots on Saturdays (day 6)
        let dailyTimeSlots = { ...timeSlots };
        if (date.getDay() === 6) {
            // Saturday - reduced hours
            dailyTimeSlots = {
                "08:00 AM": { label: "Saturday Slot 1", available: true, maxBookings: 2, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
                "09:00 AM": { label: "Saturday Slot 2", available: true, maxBookings: 2, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
                "10:00 AM": { label: "Saturday Slot 3", available: true, maxBookings: 2, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
                "11:00 AM": { label: "Saturday Slot 4", available: true, maxBookings: 2, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 },
                "12:00 PM": { label: "Saturday Final Slot", available: true, maxBookings: 1, maxPremiumBookings: 1, currentBookings: 0, currentPremiumBookings: 0 }
            };
        }

        const dateString = date.toISOString().split('T')[0];

        try {
            await setDoc(doc(db, "availability", dateString), dailyTimeSlots);
            successCount++;
            if (successCount % 10 === 0) {
                console.log(`Seeded ${successCount} days...`);
            }
        } catch (error) {
            console.error(`Error seeding date ${dateString}:`, error);
        }
    }

    console.log(`Availability seeded successfully for ${successCount} days`);
    return successCount;
}

// Seed admin settings
export async function seedAdminSettings() {
    const settings = {
        bookingCutoffHours: 2,
        subscriptionMonthlyPrice: 999,
        paymentOptions: ["GCash", "Card", "Maya"]
    };

    await setDoc(doc(db, "adminSettings", "main"), settings);
    console.log("Admin settings seeded successfully");
}

// Run all seed functions
export async function seedAllData() {
    try {
        await seedServices();
        await seedAvailability();
        await seedAdminSettings();
        console.log("All data seeded successfully!");
    } catch (error) {
        console.error("Error seeding data:", error);
    }
}

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
    window.seedAllData = seedAllData;
}
