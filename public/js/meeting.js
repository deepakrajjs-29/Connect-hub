// ===================================
// REAL VIDEO MEETING MODULE WITH WEBRTC
// ===================================

class MeetingManager {
    constructor() {
        this.localStream = null;
        this.screenStream = null;
        this.peerConnections = new Map();
        this.participants = new Map();
        this.meetingStartTime = null;
        this.meetingTimer = null;
        this.isMuted = false;
        this.isVideoOn = true;
        this.isScreenSharing = false;
        this.audioContext = null;
        this.audioAnalyser = null;
        this.speakingCheckInterval = null;
        
        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };
    }

    async startMeeting() {
        try {
            // Request camera and microphone permissions
            await this.initializeLocalMedia();
            
            // Switch to meeting view
            document.getElementById('chat-view').classList.remove('active');
            document.getElementById('meeting-view').classList.add('active');

            // Initialize meeting
            this.meetingStartTime = Date.now();
            AppState.isInMeeting = true;
            
            // Add current user to participants
            if (AppState.currentUser) {
                this.participants.set('local', {
                    id: 'local',
                    name: AppState.currentUser.username,
                    avatar: AppState.currentUser.avatar,
                    stream: this.localStream,
                    isSpeaking: false,
                    isMuted: false,
                    isVideoOn: true,
                    isLocal: true
                });
            }

            // Add mock remote participants (simulated for demo)
            this.addMockParticipants();
            
            this.renderParticipants();
            this.startMeetingTimer();
            this.attachMeetingControls();
            this.startSpeakingDetection();

            this.showNotification('Meeting started! 🎥');
        } catch (error) {
            console.error('Error starting meeting:', error);
            this.showNotification('Failed to access camera/microphone. Please grant permissions. ⚠️');
            
            // Fall back to chat view
            document.getElementById('meeting-view').classList.remove('active');
            document.getElementById('chat-view').classList.add('active');
        }
    }

    async initializeLocalMedia() {
        try {
            // Request both video and audio
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            console.log('Local media initialized successfully');
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }

    addMockParticipants() {
        // Add simulated remote participants for demo
        MOCK_PARTICIPANTS.forEach((participant, index) => {
            this.participants.set(participant.id, {
                ...participant,
                stream: null, // No stream for mock participants
                isSpeaking: false,
                isLocal: false
            });
        });
    }

    renderParticipants() {
        const videoGrid = document.getElementById('video-grid');
        if (!videoGrid) return;

        videoGrid.innerHTML = '';

        this.participants.forEach((participant, id) => {
            const videoTile = this.createVideoTile(participant);
            videoGrid.appendChild(videoTile);
        });
    }

    createVideoTile(participant) {
        const tile = document.createElement('div');
        tile.className = 'video-tile';
        tile.dataset.participantId = participant.id;

        // Create video element for real stream
        if (participant.stream && participant.isVideoOn) {
            const video = document.createElement('video');
            video.autoplay = true;
            video.playsInline = true;
            video.muted = participant.isLocal; // Mute local video to prevent echo
            video.srcObject = participant.stream;
            
            video.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: var(--radius-lg);
            `;
            
            tile.appendChild(video);
        } else {
            // Show placeholder for participants without video
            const placeholder = document.createElement('div');
            placeholder.className = 'video-placeholder';

            if (participant.isVideoOn === false || !participant.stream) {
                // Show avatar/initials when video is off
                const avatar = document.createElement('img');
                avatar.className = 'video-avatar';
                avatar.src = participant.avatar;
                avatar.alt = participant.name;
                placeholder.appendChild(avatar);
            }

            tile.appendChild(placeholder);
        }

        // Participant name tag
        const nameTag = document.createElement('div');
        nameTag.className = 'participant-name';
        nameTag.textContent = participant.name + (participant.isLocal ? ' (You)' : '');
        
        if (participant.isMuted) {
            const mutedIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            mutedIcon.setAttribute('width', '16');
            mutedIcon.setAttribute('height', '16');
            mutedIcon.setAttribute('viewBox', '0 0 24 24');
            mutedIcon.setAttribute('fill', 'none');
            mutedIcon.setAttribute('stroke', 'currentColor');
            mutedIcon.setAttribute('stroke-width', '2');
            mutedIcon.style.marginLeft = '4px';
            
            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line1.setAttribute('x1', '1');
            line1.setAttribute('y1', '1');
            line1.setAttribute('x2', '23');
            line1.setAttribute('y2', '23');
            
            mutedIcon.appendChild(line1);
            nameTag.appendChild(mutedIcon);
        }

        tile.appendChild(nameTag);

        // Speaking indicator
        if (participant.isSpeaking) {
            const speakingIndicator = document.createElement('div');
            speakingIndicator.className = 'speaking-indicator';
            tile.appendChild(speakingIndicator);
        }

        return tile;
    }

    startSpeakingDetection() {
        if (!this.localStream) return;

        try {
            // Create audio context for volume detection
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioAnalyser = this.audioContext.createAnalyser();
            
            const source = this.audioContext.createMediaStreamSource(this.localStream);
            source.connect(this.audioAnalyser);
            
            this.audioAnalyser.fftSize = 256;
            const bufferLength = this.audioAnalyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Check speaking status every 100ms
            this.speakingCheckInterval = setInterval(() => {
                if (!this.isMuted && AppState.isInMeeting) {
                    this.audioAnalyser.getByteFrequencyData(dataArray);
                    
                    // Calculate average volume
                    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                    
                    // Update speaking status (threshold: 30)
                    const localParticipant = this.participants.get('local');
                    if (localParticipant) {
                        const wasSpeaking = localParticipant.isSpeaking;
                        localParticipant.isSpeaking = average > 30;
                        
                        // Re-render if speaking status changed
                        if (wasSpeaking !== localParticipant.isSpeaking) {
                            this.renderParticipants();
                        }
                    }
                }
            }, 100);
        } catch (error) {
            console.error('Error setting up speaking detection:', error);
        }
    }

    startMeetingTimer() {
        const updateTimer = () => {
            const elapsed = Date.now() - this.meetingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timeDisplay = document.getElementById('meeting-time');
            if (timeDisplay) {
                timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        };

        updateTimer();
        this.meetingTimer = setInterval(updateTimer, 1000);
    }

    attachMeetingControls() {
        // Remove old listeners by cloning buttons
        const toggleMicBtn = document.getElementById('toggle-mic');
        const toggleCameraBtn = document.getElementById('toggle-camera');
        const shareScreenBtn = document.getElementById('share-screen');
        const leaveMeetingBtn = document.getElementById('leave-meeting');

        if (toggleMicBtn) {
            const newMicBtn = toggleMicBtn.cloneNode(true);
            toggleMicBtn.parentNode.replaceChild(newMicBtn, toggleMicBtn);
            newMicBtn.addEventListener('click', () => this.toggleMicrophone());
        }

        if (toggleCameraBtn) {
            const newCameraBtn = toggleCameraBtn.cloneNode(true);
            toggleCameraBtn.parentNode.replaceChild(newCameraBtn, toggleCameraBtn);
            newCameraBtn.addEventListener('click', () => this.toggleCamera());
        }

        if (shareScreenBtn) {
            const newScreenBtn = shareScreenBtn.cloneNode(true);
            shareScreenBtn.parentNode.replaceChild(newScreenBtn, shareScreenBtn);
            newScreenBtn.addEventListener('click', () => this.toggleScreenShare());
        }

        if (leaveMeetingBtn) {
            const newLeaveBtn = leaveMeetingBtn.cloneNode(true);
            leaveMeetingBtn.parentNode.replaceChild(newLeaveBtn, leaveMeetingBtn);
            newLeaveBtn.addEventListener('click', () => this.leaveMeeting());
        }
    }

    toggleMicrophone() {
        if (!this.localStream) return;

        this.isMuted = !this.isMuted;
        AppState.isMuted = this.isMuted;

        // Mute/unmute audio tracks
        const audioTracks = this.localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !this.isMuted;
        });

        const toggleMicBtn = document.getElementById('toggle-mic');
        if (toggleMicBtn) {
            if (this.isMuted) {
                toggleMicBtn.classList.add('muted');
                this.showNotification('Microphone muted 🔇');
            } else {
                toggleMicBtn.classList.remove('muted');
                this.showNotification('Microphone unmuted 🔊');
            }
        }

        // Update local participant
        const localParticipant = this.participants.get('local');
        if (localParticipant) {
            localParticipant.isMuted = this.isMuted;
            localParticipant.isSpeaking = false; // Reset speaking when muted
            this.renderParticipants();
        }
    }

    toggleCamera() {
        if (!this.localStream) return;

        this.isVideoOn = !this.isVideoOn;
        AppState.isVideoOn = this.isVideoOn;

        // Enable/disable video tracks
        const videoTracks = this.localStream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = this.isVideoOn;
        });

        const toggleCameraBtn = document.getElementById('toggle-camera');
        if (toggleCameraBtn) {
            if (this.isVideoOn) {
                toggleCameraBtn.classList.remove('active');
                this.showNotification('Camera started 📹');
            } else {
                toggleCameraBtn.classList.add('active');
                this.showNotification('Camera stopped 📷');
            }
        }

        // Update local participant
        const localParticipant = this.participants.get('local');
        if (localParticipant) {
            localParticipant.isVideoOn = this.isVideoOn;
            this.renderParticipants();
        }
    }

    async toggleScreenShare() {
        try {
            if (!this.isScreenSharing) {
                // Start screen sharing
                this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: 'always',
                        displaySurface: 'monitor'
                    },
                    audio: false
                });

                // Replace video track with screen share track
                const screenTrack = this.screenStream.getVideoTracks()[0];
                
                // Handle screen share stop (when user clicks browser's stop sharing button)
                screenTrack.onended = () => {
                    this.stopScreenShare();
                };

                // Update local participant stream
                const localParticipant = this.participants.get('local');
                if (localParticipant) {
                    // Save original stream
                    localParticipant.originalStream = this.localStream;
                    
                    // Create new stream with screen video and original audio
                    const audioTrack = this.localStream.getAudioTracks()[0];
                    localParticipant.stream = new MediaStream([screenTrack, audioTrack]);
                    
                    this.isScreenSharing = true;
                    AppState.isScreenSharing = true;
                    
                    const shareScreenBtn = document.getElementById('share-screen');
                    if (shareScreenBtn) {
                        shareScreenBtn.classList.add('active');
                    }
                    
                    this.renderParticipants();
                    this.showNotification('Screen sharing started 🖥️');
                }
            } else {
                this.stopScreenShare();
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
            this.showNotification('Screen sharing failed. Please try again. ⚠️');
        }
    }

    stopScreenShare() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        // Restore original camera stream
        const localParticipant = this.participants.get('local');
        if (localParticipant && localParticipant.originalStream) {
            localParticipant.stream = localParticipant.originalStream;
            delete localParticipant.originalStream;
        }

        this.isScreenSharing = false;
        AppState.isScreenSharing = false;

        const shareScreenBtn = document.getElementById('share-screen');
        if (shareScreenBtn) {
            shareScreenBtn.classList.remove('active');
        }

        this.renderParticipants();
        this.showNotification('Screen sharing stopped');
    }

    leaveMeeting() {
        // Stop all media tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        // Stop audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        // Stop speaking detection
        if (this.speakingCheckInterval) {
            clearInterval(this.speakingCheckInterval);
            this.speakingCheckInterval = null;
        }

        // Stop meeting timer
        if (this.meetingTimer) {
            clearInterval(this.meetingTimer);
            this.meetingTimer = null;
        }

        // Close all peer connections
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();

        // Clear participants
        this.participants.clear();

        // Reset state
        AppState.isInMeeting = false;
        this.isMuted = false;
        this.isVideoOn = true;
        this.isScreenSharing = false;

        // Switch back to chat view
        document.getElementById('meeting-view').classList.remove('active');
        document.getElementById('chat-view').classList.add('active');

        // Reset controls
        const toggleMicBtn = document.getElementById('toggle-mic');
        const toggleCameraBtn = document.getElementById('toggle-camera');
        const shareScreenBtn = document.getElementById('share-screen');

        if (toggleMicBtn) toggleMicBtn.classList.remove('muted');
        if (toggleCameraBtn) toggleCameraBtn.classList.remove('active');
        if (shareScreenBtn) shareScreenBtn.classList.remove('active');

        this.showNotification('Meeting ended 👋');
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

// Export for use in app.js
window.meetingManager = new MeetingManager();
