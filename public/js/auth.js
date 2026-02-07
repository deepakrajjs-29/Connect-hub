// ===================================
// AUTHENTICATION MODULE
// ===================================

class AuthManager {
    constructor() {
        this.initializeAvatars();
        this.attachEventListeners();
        this.checkExistingSession();
    }

    initializeAvatars() {
        const avatarGrid = document.getElementById('avatar-grid');
        if (!avatarGrid) return;

        AVATAR_OPTIONS.forEach((avatarUrl, index) => {
            const avatarOption = document.createElement('div');
            avatarOption.className = 'avatar-option';
            if (index === 0) avatarOption.classList.add('selected');
            avatarOption.dataset.avatar = avatarUrl;
            
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.alt = `Avatar ${index + 1}`;
            
            avatarOption.appendChild(img);
            avatarOption.addEventListener('click', () => this.selectAvatar(avatarOption));
            avatarGrid.appendChild(avatarOption);
        });
    }

    selectAvatar(selectedOption) {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        selectedOption.classList.add('selected');
    }

    attachEventListeners() {
        // Toggle between login and signup
        const showSignup = document.getElementById('show-signup');
        const showLogin = document.getElementById('show-login');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.classList.remove('active');
                signupForm.classList.add('active');
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                signupForm.classList.remove('active');
                loginForm.classList.add('active');
            });
        }

        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form submission
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        // Clear previous errors
        this.clearErrors('login');

        // Validate
        let isValid = true;

        if (!username) {
            this.showError('login-username-error', 'Username is required');
            isValid = false;
        }

        if (!password) {
            this.showError('login-password-error', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => 
            (u.username.toLowerCase() === username.toLowerCase() || 
             u.email.toLowerCase() === username.toLowerCase()) && 
            u.password === password
        );

        if (!user) {
            this.showError('login-password-error', 'Invalid username or password');
            return;
        }

        // Success
        this.loginUser(user);
    }

    handleSignup() {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const selectedAvatar = document.querySelector('.avatar-option.selected');

        // Clear previous errors
        this.clearErrors('signup');

        // Validate
        let isValid = true;

        if (!username) {
            this.showError('signup-username-error', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            this.showError('signup-username-error', 'Username must be at least 3 characters');
            isValid = false;
        }

        if (!email) {
            this.showError('signup-email-error', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('signup-email-error', 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            this.showError('signup-password-error', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showError('signup-password-error', 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!isValid) return;

        // Check if username or email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            this.showError('signup-username-error', 'Username already taken');
            return;
        }

        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('signup-email-error', 'Email already registered');
            return;
        }

        // Create new user
        const newUser = {
            id: generateId(),
            username,
            email,
            password,
            avatar: selectedAvatar ? selectedAvatar.dataset.avatar : AVATAR_OPTIONS[0],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Show success and login
        this.showNotification('Account created successfully! 🎉');
        setTimeout(() => {
            this.loginUser(newUser);
        }, 1000);
    }

    loginUser(user) {
        // Store current user
        AppState.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Show success notification
        this.showNotification(`Welcome back, ${user.username}! 👋`);

        // Transition to main app
        setTimeout(() => {
            document.getElementById('auth-screen').classList.remove('active');
            document.getElementById('main-app').classList.add('active');
            
            // Initialize the main app
            if (window.chatManager) {
                window.chatManager.initialize();
            }
        }, 800);
    }

    checkExistingSession() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                AppState.currentUser = user;
                
                // Skip auth screen
                document.getElementById('auth-screen').classList.remove('active');
                document.getElementById('main-app').classList.add('active');
            } catch (e) {
                console.error('Error loading session:', e);
                localStorage.removeItem('currentUser');
            }
        }
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.previousElementSibling.classList.add('error');
        }
    }

    clearErrors(formType) {
        const prefix = formType === 'login' ? 'login' : 'signup';
        const errorElements = document.querySelectorAll(`#${prefix}-form .error-message`);
        errorElements.forEach(el => {
            el.textContent = '';
            if (el.previousElementSibling) {
                el.previousElementSibling.classList.remove('error');
            }
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message) {
        const toast = document.getElementById('notification-toast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toastMessage.textContent = message;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    logout() {
        localStorage.removeItem('currentUser');
        AppState.currentUser = null;
        
        document.getElementById('main-app').classList.remove('active');
        document.getElementById('auth-screen').classList.add('active');
        
        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
        this.clearErrors('login');
        this.clearErrors('signup');
    }
}

// Initialize auth manager when DOM is ready
let authManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        authManager = new AuthManager();
    });
} else {
    authManager = new AuthManager();
}
