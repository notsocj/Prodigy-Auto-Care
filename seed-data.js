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
    const detailedTeamsTimeSlots = {
        // AM TEAM - Full Detail
        "6:00 AM": { label: "AM Battle Plan (6:00-6:15)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "6:15 AM": { label: "AM Maintenance Bay 4-6 (6:15-6:30)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "6:30 AM": { label: "W1-W3: W1(Bay4) W2(Bay5) W3(Bay6)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "8:00 AM": { label: "W4-W6: W4(Bay1) W5(Bay2) W6(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "9:30 AM": { label: "W7-W9: W7(Bay1) W8(Bay2) W9(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "11:00 AM": { label: "AM Break (11:00-12:00)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "12:00 PM": { label: "W10-W12: W10(Bay1) W11(Bay2) W12(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "1:30 PM": { label: "Bay Shift: W13(Bay4) W14(Bay5) W15(Bay6)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },

        // PM TEAM - Full Detail  
        "2:00 PM": { label: "PM Battle Plan (2:00-2:15)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "2:15 PM": { label: "PM Maintenance Bay 1-3 (2:15-2:30)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "2:30 PM": { label: "W16-W18: W16(Bay1) W17(Bay2) W18(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "4:00 PM": { label: "W19-W21: W19(Bay4) W20(Bay5) W21(Bay6)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "5:30 PM": { label: "PM Break (5:30-6:30)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "6:30 PM": { label: "W22-W24: W22(Bay4) W23(Bay5) W24(Bay6)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "8:00 PM": { label: "W25-W27: W25(Bay4) W26(Bay5) W27(Bay6)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "9:30 PM": { label: "Bay Shift: W28(Bay1) W29(Bay2) W30(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },

        // GY TEAM - Full Detail
        "10:00 PM": { label: "GY Battle Plan (10:00-10:15)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "10:15 PM": { label: "GY Maintenance Bay 4-6 (10:15-10:30)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "10:30 PM": { label: "W31-W33: W31(Bay4) W32(Bay5) W33(Bay6)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "12:00 AM": { label: "W34-W36: W34(Bay4) W35(Bay5) W36(Bay6)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "1:30 AM": { label: "GY Break (1:30-2:30)", available: false, maxBookings: 0, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "2:30 AM": { label: "W37-W39: W37(Bay1) W38(Bay2) W39(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "4:00 AM": { label: "W40-W42: W40(Bay1) W41(Bay2) W42(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 },
        "5:30 AM": { label: "Bay Shift: W43(Bay1) W44(Bay2) W45(Bay3)", available: true, maxBookings: 3, maxPremiumBookings: 0, currentBookings: 0, currentPremiumBookings: 0 }
    };

    const today = new Date();
    let successCount = 0;

    console.log('Starting detailed teams availability seeding...');

    for (let i = 1; i <= 30; i++) { // Start from tomorrow, seed for next 30 days
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Skip Sundays (day 0) - business closed
        if (date.getDay() === 0) {
            console.log(`Skipping Sunday: ${date.toISOString().split('T')[0]}`);
            continue;
        }

        const dateString = date.toISOString().split('T')[0];

        try {
            await setDoc(doc(db, "availability", dateString), detailedTeamsTimeSlots);
            successCount++;
            if (successCount % 10 === 0) {
                console.log(`Seeded ${successCount} days with detailed teams template...`);
            }
        } catch (error) {
            console.error(`Error seeding date ${dateString}:`, error);
        }
    }

    console.log(`Detailed teams availability seeded successfully for ${successCount} days`);
    return successCount;
}

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
