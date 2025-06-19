// Authentication service
import { auth, db, registerUser as firebaseRegisterUser, loginUser as firebaseLoginUser, logoutUser as firebaseLogoutUser, onAuthChange as firebaseOnAuthChange, getCurrentUser as firebaseGetCurrentUser } from './firebase.js';

// Authentication functions
export async function registerUser(email, password, fullName, phoneNumber) {
    return await firebaseRegisterUser(email, password, fullName, phoneNumber);
}

export async function loginUser(email, password) {
    return await firebaseLoginUser(email, password);
}

export async function logoutUser() {
    return await firebaseLogoutUser();
}

export function onAuthChange(callback) {
    return firebaseOnAuthChange(callback);
}

// Get current user data
export async function getCurrentUser() {
    return await firebaseGetCurrentUser();
}

// Check if user is admin
export async function isAdmin(user) {
    if (!user) return false;

    const currentUser = await firebaseGetCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
        return true;
    }
    return false;
}

// Admin auth change handler
export function onAdminAuthChange(callback) {
    return firebaseOnAuthChange(async (user) => {
        if (user) {
            const adminStatus = await isAdmin(user);
            callback(user, adminStatus);
        } else {
            callback(null, false);
        }
    });
}
