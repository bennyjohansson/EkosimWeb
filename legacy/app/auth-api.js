/**
 * Modern Authentication API Client
 * Replaces Firebase with our custom backend authentication
 */

class AuthAPI {
    constructor() {
        this.baseURL = '';  // Same origin
        this.apiPath = '/api/auth';
        this.token = localStorage.getItem('auth_token');
        this.user = null;
        
        // Check if we have a stored user
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                this.user = JSON.parse(storedUser);
            } catch (e) {
                console.warn('Invalid stored user data, clearing...');
                this.clearAuthData();
            }
        }
    }

    /**
     * Register a new user
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}${this.apiPath}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                this.setAuthData(data.data.token, data.data.user);
                return { success: true, user: data.data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Network error during registration' };
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}${this.apiPath}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.setAuthData(data.data.token, data.data.user);
                return { success: true, user: data.data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error during login' };
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.clearAuthData();
        // Redirect to login page or reload
        window.location.href = './html/login.html';
    }

    /**
     * Get current user profile
     */
    async getProfile() {
        if (!this.token) {
            return { success: false, error: 'No token available' };
        }

        try {
            const response = await fetch(`${this.baseURL}${this.apiPath}/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.user = data.data.user;
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                return { success: true, user: data.data.user };
            } else {
                // Token might be expired
                if (response.status === 401) {
                    this.clearAuthData();
                }
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            return { success: false, error: 'Network error fetching profile' };
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(updates) {
        if (!this.token) {
            return { success: false, error: 'No token available' };
        }

        try {
            const response = await fetch(`${this.baseURL}${this.apiPath}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (data.success) {
                this.user = { ...this.user, ...data.data.user };
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: 'Network error updating profile' };
        }
    }

    /**
     * Verify token is still valid
     */
    async verifyToken() {
        if (!this.token) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}${this.apiPath}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: this.token })
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    /**
     * Check if user is currently authenticated
     */
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Get auth token
     */
    getToken() {
        return this.token;
    }

    /**
     * Set authentication data
     */
    setAuthData(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
    }

    /**
     * Clear authentication data
     */
    clearAuthData() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    /**
     * Initialize authentication state
     * Call this when the app starts
     */
    async initialize() {
        if (this.token) {
            // Verify token is still valid
            const isValid = await this.verifyToken();
            if (!isValid) {
                this.clearAuthData();
                return false;
            }
            
            // Refresh user data
            await this.getProfile();
            return true;
        }
        return false;
    }
}

// Create global instance
window.authAPI = new AuthAPI();

// Firebase compatibility layer for existing code
window.firebaseAuth = {
    currentUser: null,
    
    onAuthStateChanged: function(callback) {
        // Simulate Firebase auth state changes
        if (window.authAPI.isAuthenticated()) {
            this.currentUser = {
                uid: window.authAPI.user?.id,
                email: window.authAPI.user?.email,
                displayName: window.authAPI.user?.username
            };
            callback(this.currentUser);
        } else {
            this.currentUser = null;
            callback(null);
        }
    },
    
    signOut: function() {
        window.authAPI.logout();
        this.currentUser = null;
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async function() {
    await window.authAPI.initialize();
    console.log('🔐 Authentication API initialized');
});

console.log('🔐 Auth API Client loaded');
