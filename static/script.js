let socket;
let username;
let currentRoom;

// Landing page functions
function generateRoom() {
    username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Please enter your name');
        return;
    }

    fetch('/generate_room', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = `/room/${data.room_id}`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error generating room');
    });
}

function joinRoom() {
    username = document.getElementById('username').value.trim();
    const roomId = document.getElementById('roomId').value.trim();
    
    if (!username) {
        alert('Please enter your name');
        return;
    }
    if (!roomId) {
        alert('Please enter a room ID');
        return;
    }

    window.location.href = `/room/${roomId}`;
}

// Chat room functions
function initializeChat() {
    const roomIdElement = document.getElementById('roomId');
    if (!roomIdElement) return; // Not in chat room

    currentRoom = roomIdElement.textContent;
    username = localStorage.getItem('username') || prompt('Enter your name:');
    localStorage.setItem('username', username);

    socket = io();
    
    socket.on('connect', () => {
        socket.emit('join', {
            room: currentRoom,
            username: username
        });
    });

    socket.on('message', (data) => {
        displayMessage(data);
    });

    socket.on('user_joined', (data) => {
        displaySystemMessage(`${data.username} has joined the room`);
    });

    socket.on('user_left', (data) => {
        displaySystemMessage(`${data.username} has left the room`);
    });

    // Handle enter key in message input
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('message', {
            room: currentRoom,
            username: username,
            message: message
        });
        messageInput.value = '';
    }
}

function displayMessage(data) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (data.username === username) {
        messageElement.classList.add('sent');
    } else if (data.username === 'System') {
        messageElement.classList.add('system');
    } else {
        messageElement.classList.add('received');
    }

    messageElement.innerHTML = `
        <strong>${data.username}</strong>
        <p>${data.message}</p>
    `;
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displaySystemMessage(message) {
    displayMessage({
        username: 'System',
        message: message
    });
}

function leaveRoom() {
    if (socket) {
        socket.emit('leave', {
            room: currentRoom,
            username: username
        });
    }
    window.location.href = '/';
}

// Initialize chat if we're in the chat room
document.addEventListener('DOMContentLoaded', initializeChat); 