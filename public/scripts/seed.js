// Seed data script
import { db, doc, setDoc, collection, serverTimestamp } from './firebase.js';

// Seed services data
export async function seedServices() {
    const services = [
        {
            name: "Basic Wash",
            description: "Exterior cleaning only",
            price: 200,
            durationMinutes: 30
        },
        {
            name: "Premium Wash",
            description: "Interior + Exterior cleaning",
            price: 350,
            durationMinutes: 60
        },
        {
            name: "Deluxe Wash",
            description: "Full service + wax",
            price: 500,
            durationMinutes: 90
        }
    ];

    for (const service of services) {
        await setDoc(doc(collection(db, "services")), service);
    }

    console.log("Services seeded successfully");
}

// Seed availability data for the next 90 days
export async function seedAvailability() {
    const timeSlots = {
        "08:00 AM": { 
            label: "W1-W3 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "09:00 AM": { 
            label: "W4-W6 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "10:00 AM": { 
            label: "W7-W9 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "11:00 AM": { 
            label: "W10-W12 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "12:00 PM": { 
            label: "W13-W15 (Bay 1,2)",
            available: true, 
            maxBookings: 2, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "01:00 PM": { 
            label: "W16-W18 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "02:00 PM": { 
            label: "W19-W21 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "03:00 PM": { 
            label: "W22-W24 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "04:00 PM": { 
            label: "W25-W27 (Bay 1,2,3)",
            available: true, 
            maxBookings: 3, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        },
        "05:00 PM": { 
            label: "W28-W30 (Bay 1,2)",
            available: true, 
            maxBookings: 2, 
            currentBookings: 0,
            maxPremiumBookings: 1,
            currentPremiumBookings: 0
        }
    };

    const today = new Date();
    let successCount = 0;

    console.log('Starting availability seeding...');

    for (let i = 1; i <= 90; i++) { // Start from tomorrow, seed for next 90 days
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Skip Sundays (day 0) - business closed
        if (date.getDay() === 0) {
            continue;
        }

        const dateString = date.toISOString().split('T')[0];

        try {
            // Create the availability document with time slots as direct properties
            await setDoc(doc(db, "availability", dateString), timeSlots);
            successCount++;
        } catch (error) {
            console.error(`Error seeding availability for ${dateString}:`, error);
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
        paymentOptions: ["GCash", "Card", "Maya"],
        businessHours: {
            monday: { open: "08:00", close: "17:00" },
            tuesday: { open: "08:00", close: "17:00" },
            wednesday: { open: "08:00", close: "17:00" },
            thursday: { open: "08:00", close: "17:00" },
            friday: { open: "08:00", close: "17:00" },
            saturday: { open: "08:00", close: "17:00" },
            sunday: { closed: true }
        },
        contactInfo: {
            phone: "+63 123 456 7890",
            email: "info@prodigyautocare.com",
            address: "123 Main Street, City, Philippines"
        }
    };

    await setDoc(doc(db, "adminSettings", "main"), settings);
    console.log("Admin settings seeded successfully");
}

// Run all seed functions
export async function seedAllData() {
    try {
        console.log("Starting data seeding...");
        await seedServices();
        const availabilityCount = await seedAvailability();
        await seedAdminSettings();
        console.log("All data seeded successfully!");
        return { success: true, availabilityCount };
    } catch (error) {
        console.error("Error seeding data:", error);
        return { success: false, error: error.message };
    }
}
