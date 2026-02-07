// ===================================
// MAIN APPLICATION MODULE
// ===================================

class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    setup() {
        // Initialize chat manager if user is logged in
        if (AppState.currentUser) {
            window.chatManager.initialize();
        }

        // Setup modal handlers
        this.setupModals();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Setup responsive behavior
        this.setupResponsive();

        console.log('🚀 ConnectHub initialized successfully!');
    }

    setupModals() {
        // Create room modal
        const createRoomModal = document.getElementById('create-room-modal');
        const addServerBtn = document.getElementById('add-server');
        const closeModalBtns = document.querySelectorAll('.close-modal');
        const createRoomBtn = document.getElementById('create-room-btn');
        const copyInviteLinkBtn = document.getElementById('copy-invite-link');

        // Close modal handlers
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Create room button
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                const roomName = document.getElementById('room-name-input').value.trim();
                const privacy = document.getElementById('room-privacy').value;

                if (!roomName) {
                    this.showNotification('Please enter a room name');
                    return;
                }

                this.showNotification(`Room "${roomName}" created! (${privacy}) 🎉`);
                this.closeAllModals();
                
                // Reset form
                document.getElementById('room-name-input').value = '';
            });
        }

        // Copy invite link
        if (copyInviteLinkBtn) {
            copyInviteLinkBtn.addEventListener('click', () => {
                const inviteLink = document.getElementById('invite-link');
                if (inviteLink) {
                    // Copy to clipboard
                    navigator.clipboard.writeText(inviteLink.value).then(() => {
                        this.showNotification('Invite link copied! 📋');
                    }).catch(() => {
                        // Fallback for older browsers
                        inviteLink.select();
                        document.execCommand('copy');
                        this.showNotification('Invite link copied! 📋');
                    });
                }
            });
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus message input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const messageInput = document.getElementById('message-input');
                if (messageInput) {
                    messageInput.focus();
                }
            }

            // Ctrl/Cmd + M: Toggle mute in meeting
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                if (AppState.isInMeeting && window.meetingManager) {
                    window.meetingManager.toggleMicrophone();
                }
            }

            // Ctrl/Cmd + E: Toggle camera in meeting
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (AppState.isInMeeting && window.meetingManager) {
                    window.meetingManager.toggleCamera();
                }
            }

            // Escape: Close modals and emoji picker
            if (e.key === 'Escape') {
                this.closeAllModals();
                
                const emojiPicker = document.getElementById('emoji-picker');
                if (emojiPicker && emojiPicker.classList.contains('active')) {
                    window.chatManager.toggleEmojiPicker();
                }
            }
        });
    }

    setupResponsive() {
        // Handle mobile menu toggle
        const serversIcons = document.querySelectorAll('.server-icon');
        const channelsSidebar = document.querySelector('.channels-sidebar');

        // On mobile, clicking a server could toggle the channels sidebar
        if (window.innerWidth <= 768) {
            serversIcons.forEach(icon => {
                icon.addEventListener('click', () => {
                    if (channelsSidebar) {
                        channelsSidebar.classList.toggle('mobile-open');
                    }
                });
            });
        }

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const channelsSidebar = document.querySelector('.channels-sidebar');

        // Close mobile menu on desktop
        if (width > 768 && channelsSidebar) {
            channelsSidebar.classList.remove('mobile-open');
        }
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
}

// Initialize the application
const app = new App();

// Make app globally available for debugging
window.app = app;

// Service Worker registration for PWA (optional future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you add a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

// Prevent default drag and drop behavior
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Log app info
console.log('%c🎮 ConnectHub', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cModern Communication Platform', 'font-size: 14px; color: #b9bbbe;');
console.log('%cVersion 1.0.0', 'font-size: 12px; color: #72767d;');
