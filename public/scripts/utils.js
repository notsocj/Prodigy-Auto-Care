// Utility functions shared across the application

// Date formatting utilities
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatTime(time) {
    if (!time) return '';
    return time;
}

// Price formatting
export function formatPrice(price) {
    return `₱${price?.toLocaleString() || 0}`;
}

// Validation utilities
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+63|63|0)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validatePassword(password) {
    return password && password.length >= 6;
}

// UI utilities
export function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

export function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

export function showError(message, elementId = 'error-message') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

export function hideError(elementId = 'error-message') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

export function showSuccess(message, elementId = 'success-message') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

export function hideSuccess(elementId = 'success-message') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

// Modal utilities
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Mobile menu utility
export function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Debounce utility
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage utilities
export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

export function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

export function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}
