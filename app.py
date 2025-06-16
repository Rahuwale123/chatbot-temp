
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app)

# Store active rooms and their users
active_rooms = {}

def generate_room_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/room/<room_id>')
def room(room_id):
    return render_template('room.html', room_id=room_id)

@app.route('/generate_room', methods=['POST'])
def generate_room():
    room_id = generate_room_id()
    active_rooms[room_id] = []
    return jsonify({'room_id': room_id})

@socketio.on('join')
def on_join(data):
    room_id = data['room']
    username = data['username']
    join_room(room_id)
    if room_id not in active_rooms:
        active_rooms[room_id] = []
    active_rooms[room_id].append(username)
    emit('user_joined', {'username': username}, room=room_id)
    emit('message', {'username': 'System', 'message': f'{username} has joined the room'}, room=room_id)

@socketio.on('leave')
def on_leave(data):
    room_id = data['room']
    username = data['username']
    leave_room(room_id)
    if room_id in active_rooms and username in active_rooms[room_id]:
        active_rooms[room_id].remove(username)
    emit('user_left', {'username': username}, room=room_id)
    emit('message', {'username': 'System', 'message': f'{username} has left the room'}, room=room_id)

@socketio.on('message')
def handle_message(data):
    room_id = data['room']
    emit('message', {
        'username': data['username'],
        'message': data['message']
    }, room=room_id)

if __name__ == '__main__':
    socketio.run(app, debug=True) 