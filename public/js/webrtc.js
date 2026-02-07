// WebRTC Manager for Video/Voice Calls
const WebRTCManager = {
    async initializeCall(friendId, callType) {
        try {
            AppState.callType = callType;
            AppState.callPeer = friendId;

            // Get user media with optimized constraints
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: callType === 'video' ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                } : false
            };

            console.log('Requesting media with constraints:', constraints);
            AppState.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Got local stream:', AppState.localStream.getTracks());

            // Display local video
            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = AppState.localStream;

            // Create peer connection
            this.createPeerConnection();

            // Add local stream to peer connection
            AppState.localStream.getTracks().forEach(track => {
                AppState.peerConnection.addTrack(track, AppState.localStream);
            });

            // Create offer
            const offer = await AppState.peerConnection.createOffer();
            await AppState.peerConnection.setLocalDescription(offer);

            // Send offer through socket
            AppState.socket.emit('call-user', {
                targetUserId: friendId,
                offer: offer,
                callType: callType
            });

            // Show call UI
            AppState.callActive = true;
            UI.showVideoCallModal();

        } catch (error) {
            console.error('Error initializing call:', error);
            alert('Failed to access camera/microphone. Please check permissions.');
        }
    },

    createPeerConnection() {
        AppState.peerConnection = new RTCPeerConnection({
            iceServers: CONFIG.ICE_SERVERS
        });

        // Handle ICE candidates
        AppState.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                AppState.socket.emit('ice-candidate', {
                    targetUserId: AppState.callPeer,
                    candidate: event.candidate
                });
            }
        };

        // Handle remote stream
        AppState.peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            
            if (!AppState.remoteStream) {
                AppState.remoteStream = new MediaStream();
                const remoteVideo = document.getElementById('remote-video');
                remoteVideo.srcObject = AppState.remoteStream;
                
                // Ensure video plays
                remoteVideo.play().catch(err => {
                    console.log('Remote video autoplay failed:', err);
                });
            }

            AppState.remoteStream.addTrack(event.track);
            
            // Show remote video container
            const remoteContainer = document.getElementById('remote-video-container');
            remoteContainer.style.display = 'block';
            
            console.log('Remote video container shown');
        };

        // Handle connection state changes
        AppState.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', AppState.peerConnection.connectionState);
            
            if (AppState.peerConnection.connectionState === 'disconnected' ||
                AppState.peerConnection.connectionState === 'failed') {
                console.error('Call connection failed or disconnected');
                this.endCall();
            }
            
            if (AppState.peerConnection.connectionState === 'connected') {
                console.log('Call successfully connected!');
            }
        };

        // Monitor ICE connection state
        AppState.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', AppState.peerConnection.iceConnectionState);
            
            if (AppState.peerConnection.iceConnectionState === 'failed') {
                console.error('ICE connection failed - may need TURN server');
            }
            
            if (AppState.peerConnection.iceConnectionState === 'connected') {
                console.log('ICE connection established successfully!');
            }
        };

        // Monitor ICE gathering state
        AppState.peerConnection.onicegatheringstatechange = () => {
            console.log('ICE gathering state:', AppState.peerConnection.iceGatheringState);
        };
    },

    async handleIncomingCall(data) {
        const { from, fromUsername, offer, callType } = data;

        AppState.callPeer = from;
        AppState.callType = callType;

        // Find friend info
        const friend = AppState.friends.find(f => f.id === from);

        // Show incoming call modal
        UI.showIncomingCallModal(friend || { username: fromUsername, avatar: '' }, callType);

        // Store offer for when user accepts
        AppState.pendingOffer = offer;
    },

    async acceptCall() {
        try {
            // Get user media
            const constraints = {
                audio: true,
                video: AppState.callType === 'video'
            };

            AppState.localStream = await navigator.mediaDevices.getUserMedia(constraints);

            // Display local video
            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = AppState.localStream;

            // Create peer connection
            this.createPeerConnection();

            // Add local stream to peer connection
            AppState.localStream.getTracks().forEach(track => {
                AppState.peerConnection.addTrack(track, AppState.localStream);
            });

            // Set remote description from offer
            await AppState.peerConnection.setRemoteDescription(new RTCSessionDescription(AppState.pendingOffer));

            // Create answer
            const answer = await AppState.peerConnection.createAnswer();
            await AppState.peerConnection.setLocalDescription(answer);

            // Send answer through socket
            AppState.socket.emit('answer-call', {
                targetUserId: AppState.callPeer,
                answer: answer
            });

            // Show call UI
            AppState.callActive = true;
            UI.hideIncomingCallModal();
            UI.showVideoCallModal();

        } catch (error) {
            console.error('Error accepting call:', error);
            alert('Failed to access camera/microphone. Please check permissions.');
        }
    },

    rejectCall() {
        AppState.socket.emit('reject-call', {
            targetUserId: AppState.callPeer
        });

        AppState.callPeer = null;
        AppState.pendingOffer = null;
        UI.hideIncomingCallModal();
    },

    async handleCallAnswered(data) {
        const { answer } = data;

        try {
            await AppState.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Error handling call answer:', error);
        }
    },

    handleCallRejected(data) {
        alert('Call was rejected');
        this.endCall();
    },

    handleCallEnded(data) {
        this.endCall();
    },

    async handleICECandidate(data) {
        const { candidate } = data;

        try {
            if (AppState.peerConnection) {
                await AppState.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    },

    toggleMicrophone() {
        if (!AppState.localStream) return;

        const audioTrack = AppState.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            return audioTrack.enabled;
        }
        return false;
    },

    toggleCamera() {
        if (!AppState.localStream) return;

        const videoTrack = AppState.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            return videoTrack.enabled;
        }
        return false;
    },

    endCall() {
        // Notify peer
        if (AppState.callPeer && AppState.socket) {
            AppState.socket.emit('end-call', {
                targetUserId: AppState.callPeer
            });
        }

        // Stop all tracks
        if (AppState.localStream) {
            AppState.localStream.getTracks().forEach(track => track.stop());
            AppState.localStream = null;
        }

        if (AppState.remoteStream) {
            AppState.remoteStream.getTracks().forEach(track => track.stop());
            AppState.remoteStream = null;
        }

        // Close peer connection
        if (AppState.peerConnection) {
            AppState.peerConnection.close();
            AppState.peerConnection = null;
        }

        // Reset state
        AppState.callActive = false;
        AppState.callPeer = null;
        AppState.callType = null;

        // Hide call UI
        UI.hideVideoCallModal();
    },

    // Screen Sharing
    async startScreenShare() {
        try {
            // Get screen stream
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always'
                },
                audio: false
            });

            // Get the video track from screen
            const screenTrack = screenStream.getVideoTracks()[0];

            // Find the sender that's sending video
            const videoSender = AppState.peerConnection.getSenders().find(
                sender => sender.track && sender.track.kind === 'video'
            );

            if (videoSender) {
                // Replace camera track with screen track
                videoSender.replaceTrack(screenTrack);
            }

            // Update local video to show screen
            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = screenStream;

            // Store original camera stream
            AppState.cameraStream = AppState.localStream;
            AppState.localStream = screenStream;
            AppState.isScreenSharing = true;

            // Handle when user stops sharing via browser UI
            screenTrack.onended = () => {
                this.stopScreenShare();
            };

            return true;
        } catch (error) {
            console.error('Error starting screen share:', error);
            alert('Failed to start screen sharing');
            return false;
        }
    },

    async stopScreenShare() {
        if (!AppState.isScreenSharing || !AppState.cameraStream) return;

        try {
            // Stop screen stream
            AppState.localStream.getTracks().forEach(track => track.stop());

            // Get camera video track
            const cameraTrack = AppState.cameraStream.getVideoTracks()[0];

            // Find the sender that's sending video
            const videoSender = AppState.peerConnection.getSenders().find(
                sender => sender.track && sender.track.kind === 'video'
            );

            if (videoSender && cameraTrack) {
                // Replace screen track with camera track
                videoSender.replaceTrack(cameraTrack);
            }

            // Update local video to show camera
            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = AppState.cameraStream;

            // Restore camera stream
            AppState.localStream = AppState.cameraStream;
            AppState.cameraStream = null;
            AppState.isScreenSharing = false;

            return true;
        } catch (error) {
            console.error('Error stopping screen share:', error);
            return false;
        }
    },

    toggleScreenShare() {
        if (AppState.isScreenSharing) {
            return this.stopScreenShare();
        } else {
            return this.startScreenShare();
        }
    }
};
