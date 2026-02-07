// Voice Message Recorder
const VoiceRecorder = {
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                await this.sendVoiceMessage(audioBlob);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            console.log('Voice recording started');
            
            return true;
        } catch (error) {
            console.error('Error starting voice recording:', error);
            alert('Could not access microphone. Please check permissions.');
            return false;
        }
    },

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            console.log('Voice recording stopped');
            return true;
        }
        return false;
    },

    async sendVoiceMessage(audioBlob) {
        if (!AppState.currentChatFriend) return;

        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            reader.onloadend = () => {
                const base64Audio = reader.result;
                
                const messageData = {
                    recipientId: AppState.currentChatFriend.id,
                    message: base64Audio,
                    type: 'voice',
                    timestamp: new Date().toISOString()
                };

                // Send through socket
                if (AppState.socket) {
                    AppState.socket.emit('send-message', messageData);
                }

                // Add to local messages
                const voiceMessage = {
                    from: AppState.currentUser.id,
                    message: base64Audio,
                    timestamp: messageData.timestamp,
                    type: 'sent',
                    messageType: 'voice'
                };

                const friendId = AppState.currentChatFriend.id;
                if (!AppState.messages.has(friendId)) {
                    AppState.messages.set(friendId, []);
                }
                AppState.messages.get(friendId).push(voiceMessage);

                // Re-render messages
                UI.renderMessages(friendId);
            };
        } catch (error) {
            console.error('Error sending voice message:', error);
        }
    }
};
