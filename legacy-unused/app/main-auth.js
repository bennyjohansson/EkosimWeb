/**
 * Modern Main App
 * Updated to use our custom authentication system
 */

var mainApp = {};

(function () {
  var mainContainer = document.getElementById("main_container");
  var playerNameElement = document.getElementById("playerName");

  /**
   * Logout function
   */
  var logout = function () {
    try {
      window.authAPI.logout();
      console.log('🔐 User logged out successfully');
      window.location.replace("./html/login-modern.html");
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect anyway
      window.location.replace("./html/login-modern.html");
    }
  }

  /**
   * Update UI with user information
   */
  var updateUserUI = function(user) {
    if (playerNameElement && user) {
      playerNameElement.textContent = `Hello, ${user.username}`;
      playerNameElement.title = `Level: ${user.level} | Email: ${user.email}`;
    }
  }

  /**
   * Initialize the application
   */
  var init = async function () {
    console.log('🚀 Initializing main app...');

    try {
      // Initialize authentication
      const isAuthenticated = await window.authAPI.initialize();
      
      if (isAuthenticated) {
        // User is signed in
        const user = window.authAPI.getCurrentUser();
        console.log('🔐 User authenticated:', user?.username);
        
        // Show main container
        if (mainContainer) {
          mainContainer.style.display = "";
        }
        
        // Update UI with user info
        updateUserUI(user);
        
        // Optional: Refresh user data periodically
        setInterval(async () => {
          if (window.authAPI.isAuthenticated()) {
            const profileResult = await window.authAPI.getProfile();
            if (profileResult.success) {
              updateUserUI(profileResult.user);
            }
          }
        }, 300000); // 5 minutes
        
      } else {
        // No user is signed in
        console.log('🔐 No authenticated user, redirecting...');
        if (mainContainer) {
          mainContainer.style.display = "none";
        }
        window.location.replace("./html/login-modern.html");
      }
    } catch (error) {
      console.error('🔐 Authentication initialization error:', error);
      if (mainContainer) {
        mainContainer.style.display = "none";
      }
      window.location.replace("./html/login-modern.html");
    }
  }

  /**
   * Handle authentication state changes
   */
  var handleAuthStateChange = function() {
    // This can be used for real-time auth state monitoring
    if (!window.authAPI.isAuthenticated()) {
      console.log('🔐 Authentication lost, redirecting...');
      if (mainContainer) {
        mainContainer.style.display = "none";
      }
      window.location.replace("./html/login-modern.html");
    }
  }

  /**
   * Check authentication status periodically
   */
  var startAuthMonitoring = function() {
    setInterval(handleAuthStateChange, 60000); // Check every minute
  }

  // Public API
  mainApp.logout = logout;
  mainApp.updateUserUI = updateUserUI;
  mainApp.getCurrentUser = () => window.authAPI.getCurrentUser();
  mainApp.refreshUserData = async () => {
    const result = await window.authAPI.getProfile();
    if (result.success) {
      updateUserUI(result.user);
    }
    return result;
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Start monitoring auth state
  startAuthMonitoring();

  console.log('🔐 Main app module loaded');

})();

// Firebase compatibility for existing code
window.firebaseAuth = window.firebaseAuth || {
  currentUser: null,
  
  onAuthStateChanged: function(callback) {
    if (window.authAPI && window.authAPI.isAuthenticated()) {
      const user = window.authAPI.getCurrentUser();
      this.currentUser = {
        uid: user?.id,
        email: user?.email,
        displayName: user?.username
      };
      callback(this.currentUser);
    } else {
      this.currentUser = null;
      callback(null);
    }
  },
  
  signOut: function() {
    return Promise.resolve(window.authAPI.logout());
  }
};
