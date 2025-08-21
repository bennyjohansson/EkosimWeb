/**
 * Modern Login Component
 * Replaces FirebaseUI with custom login/register form
 */

class LoginComponent {
    constructor() {
        this.isLoginMode = true;
        this.isLoading = false;
    }

    /**
     * Render the login/register form
     */
    render() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2 class="auth-title">
                            ${this.isLoginMode ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p class="auth-subtitle">
                            ${this.isLoginMode ? 'Sign in to your EcoSim account' : 'Join the economic simulation'}
                        </p>
                    </div>

                    <form id="authForm" class="auth-form">
                        ${!this.isLoginMode ? `
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" id="username" name="username" class="form-control" 
                                       placeholder="Choose a username" required>
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" class="form-control" 
                                   placeholder="Enter your email" required>
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" class="form-control" 
                                   placeholder="Enter your password" required minlength="6">
                        </div>

                        ${!this.isLoginMode ? `
                            <div class="form-group">
                                <label for="level">Experience Level</label>
                                <select id="level" name="level" class="form-control" required>
                                    <option value="">Select your level</option>
                                    <option value="beginner">Beginner - New to economics</option>
                                    <option value="intermediate">Intermediate - Some knowledge</option>
                                    <option value="advanced">Advanced - Economics background</option>
                                </select>
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-block auth-submit-btn" 
                                    ${this.isLoading ? 'disabled' : ''}>
                                ${this.isLoading ? 
                                    '<span class="spinner-border spinner-border-sm"></span> Processing...' : 
                                    (this.isLoginMode ? 'Sign In' : 'Create Account')
                                }
                            </button>
                        </div>

                        <div class="auth-switch">
                            ${this.isLoginMode ? 
                                "Don't have an account? <a href='#' id='switchToRegister'>Create one</a>" :
                                "Already have an account? <a href='#' id='switchToLogin'>Sign in</a>"
                            }
                        </div>
                    </form>

                    <div id="authError" class="alert alert-danger" style="display: none;"></div>
                    <div id="authSuccess" class="alert alert-success" style="display: none;"></div>
                </div>
            </div>

            <style>
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                }

                .auth-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    width: 100%;
                    max-width: 400px;
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .auth-title {
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }

                .auth-subtitle {
                    color: #666;
                    margin: 0;
                    font-size: 0.9rem;
                }

                .auth-form .form-group {
                    margin-bottom: 1.5rem;
                }

                .auth-form label {
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 0.5rem;
                    display: block;
                }

                .auth-form .form-control {
                    padding: 0.75rem;
                    border: 2px solid #e1e5e9;
                    border-radius: 5px;
                    transition: border-color 0.3s ease;
                }

                .auth-form .form-control:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                }

                .auth-submit-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    padding: 0.75rem;
                    font-weight: 500;
                    border-radius: 5px;
                    transition: transform 0.2s ease;
                }

                .auth-submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .auth-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .auth-switch {
                    text-align: center;
                    margin-top: 1rem;
                    color: #666;
                }

                .auth-switch a {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                }

                .auth-switch a:hover {
                    text-decoration: underline;
                }

                .spinner-border-sm {
                    width: 1rem;
                    height: 1rem;
                }
            </style>
        `;
    }

    /**
     * Initialize the component
     */
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        container.innerHTML = this.render();
        this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const form = document.getElementById('authForm');
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode(false);
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode(true);
            });
        }
    }

    /**
     * Switch between login and register modes
     */
    switchMode(isLogin) {
        this.isLoginMode = isLogin;
        this.init('firebaseui-auth-container'); // Re-render
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isLoading) return;

        this.setLoading(true);
        this.clearMessages();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            let result;
            
            if (this.isLoginMode) {
                result = await window.authAPI.login(data.email, data.password);
            } else {
                result = await window.authAPI.register({
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    level: data.level
                });
            }

            if (result.success) {
                this.showSuccess(this.isLoginMode ? 'Login successful! Redirecting...' : 'Account created! Redirecting...');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                this.showError(result.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        }

        this.setLoading(false);
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        const submitBtn = document.querySelector('.auth-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.innerHTML = loading ? 
                '<span class="spinner-border spinner-border-sm"></span> Processing...' : 
                (this.isLoginMode ? 'Sign In' : 'Create Account');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const successDiv = document.getElementById('authSuccess');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        const errorDiv = document.getElementById('authError');
        const successDiv = document.getElementById('authSuccess');
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        if (successDiv) {
            successDiv.style.display = 'none';
        }
    }
}

// Create global instance
window.loginComponent = new LoginComponent();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    if (document.getElementById('firebaseui-auth-container')) {
        window.loginComponent.init('firebaseui-auth-container');
    }
});

console.log('🔐 Login Component loaded');
