// ===================================
// MOCK DATA & CONFIGURATION
// ===================================

// Avatar options for user selection
const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Rocky'
];

// Emoji list for picker
const EMOJIS = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯',
    '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁',
    '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
    '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬',
    '🔥', '⭐', '✨', '💖', '💝', '🎉', '🎊', '🎈'
];

// Mock servers data
const MOCK_SERVERS = [
    {
        id: 'server-1',
        name: 'Gaming Squad',
        icon: '🎮',
        color: '#5865f2'
    },
    {
        id: 'server-2',
        name: 'Study Group',
        icon: '📚',
        color: '#57f287'
    },
    {
        id: 'server-3',
        name: 'Music Lovers',
        icon: '🎵',
        color: '#fee75c'
    },
    {
        id: 'server-4',
        name: 'Tech Talk',
        icon: '💻',
        color: '#eb459e'
    }
];

// Mock channels data
const MOCK_CHANNELS = {
    'home': {
        text: [
            { id: 'general', name: 'general', type: 'text' },
            { id: 'random', name: 'random', type: 'text' },
            { id: 'announcements', name: 'announcements', type: 'text' }
        ],
        voice: [
            { id: 'voice-1', name: 'General Voice', type: 'voice' },
            { id: 'voice-2', name: 'Gaming Room', type: 'voice' },
            { id: 'voice-3', name: 'Music Room', type: 'voice' }
        ]
    },
    'server-1': {
        text: [
            { id: 'game-chat', name: 'game-chat', type: 'text' },
            { id: 'strategies', name: 'strategies', type: 'text' },
            { id: 'memes', name: 'memes', type: 'text' }
        ],
        voice: [
            { id: 'squad-voice', name: 'Squad Voice', type: 'voice' },
            { id: 'afk', name: 'AFK', type: 'voice' }
        ]
    },
    'server-2': {
        text: [
            { id: 'homework-help', name: 'homework-help', type: 'text' },
            { id: 'resources', name: 'resources', type: 'text' }
        ],
        voice: [
            { id: 'study-room', name: 'Study Room', type: 'voice' },
            { id: 'quiet-zone', name: 'Quiet Zone', type: 'voice' }
        ]
    }
};

// Mock messages data
const MOCK_MESSAGES = {
    'general': [
        {
            id: 'msg-1',
            author: 'Sarah Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            content: 'Hey everyone! How\'s it going?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            attachments: []
        },
        {
            id: 'msg-2',
            author: 'Mike Chen',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            content: 'Pretty good! Just finished a big project 🎉',
            timestamp: new Date(Date.now() - 3000000).toISOString(),
            attachments: []
        },
        {
            id: 'msg-3',
            author: 'Emma Wilson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            content: 'Congrats Mike! What was it about?',
            timestamp: new Date(Date.now() - 2400000).toISOString(),
            attachments: []
        },
        {
            id: 'msg-4',
            author: 'Mike Chen',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            content: 'A new web app for our team. Check it out!',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            attachments: []
        },
        {
            id: 'msg-5',
            author: 'Alex Rivera',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            content: 'That looks amazing! Great work 👏',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            attachments: []
        }
    ],
    'random': [
        {
            id: 'msg-r1',
            author: 'Chris Taylor',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
            content: 'Anyone up for a game later?',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            attachments: []
        }
    ]
};

// Mock members data
const MOCK_MEMBERS = [
    {
        id: 'user-1',
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        status: 'online',
        role: 'Admin'
    },
    {
        id: 'user-2',
        name: 'Mike Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        status: 'online',
        role: 'Moderator'
    },
    {
        id: 'user-3',
        name: 'Emma Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        status: 'online',
        role: null
    },
    {
        id: 'user-4',
        name: 'Alex Rivera',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        status: 'idle',
        role: null
    },
    {
        id: 'user-5',
        name: 'Chris Taylor',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
        status: 'dnd',
        role: null
    },
    {
        id: 'user-6',
        name: 'Jordan Lee',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        status: 'offline',
        role: null
    }
];

// Mock meeting participants
const MOCK_PARTICIPANTS = [
    {
        id: 'participant-1',
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        isSpeaking: false,
        isMuted: false,
        isVideoOn: true
    },
    {
        id: 'participant-2',
        name: 'Mike Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        isSpeaking: false,
        isMuted: false,
        isVideoOn: true
    },
    {
        id: 'participant-3',
        name: 'Emma Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        isSpeaking: false,
        isMuted: true,
        isVideoOn: false
    },
    {
        id: 'participant-4',
        name: 'Alex Rivera',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        isSpeaking: false,
        isMuted: false,
        isVideoOn: true
    }
];

// Application state
const AppState = {
    currentUser: null,
    currentServer: 'home',
    currentChannel: 'general',
    isInMeeting: false,
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false
};

// Helper function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function to generate random ID
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}
