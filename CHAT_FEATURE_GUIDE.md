# Chat Feature Implementation Guide

## Overview
A real-time user-to-user chat system with persistent message history, beautiful animations, and Socket.io integration.

## Features Implemented

### Backend (`server/`)
1. **ChatMessage Model** (`models/ChatMessage.js`)
   - Stores chat messages with sender, receiver, and conversation metadata
   - Indexed for fast queries

2. **Chat Controller** (`controllers/chatController.js`)
   - `getConversations()` - Fetch all conversations for a user
   - `getChatHistory()` - Get messages between two users
   - `sendMessage()` - Save and send a message
   - `getUnreadCount()` - Count unread messages
   - `deleteConversation()` - Remove a conversation

3. **Chat Routes** (`routes/chatRoutes.js`)
   - Protected routes with authentication middleware
   - Endpoints:
     - `GET /api/chat/conversations` - All conversations
     - `GET /api/chat/history/:conversationId` - Chat history
     - `POST /api/chat/send` - Send message
     - `GET /api/chat/unread-count` - Unread count
     - `DELETE /api/chat/conversations/:conversationId` - Delete conversation

4. **Socket.io Integration** (`index.js`)
   - Real-time message delivery
   - User identification and online status
   - Typing indicators
   - Handlers: `identify`, `sendMessage`, `typing`, `stopTyping`

### Frontend (`client/`)

1. **Chat Component** (`src/components/Chat.jsx`)
   - Dual-pane interface (conversations list + chat area)
   - Real-time message updates via Socket.io
   - Message history loading
   - Unread message badge
   - Auto-scroll to latest message

2. **Chat Page** (`src/pages/ChatPage.jsx`)
   - Container for Chat component with styling

3. **Chat Styles** (`src/styles/Chat.css`)
   - Beautiful gradient backgrounds
   - Smooth animations (slideIn, fadeIn, messageSlideIn, bubbleIn)
   - Neon color scheme matching project theme
   - Responsive design for mobile
   - Glowing effects and transitions

4. **useChat Hook** (`src/hooks/useChat.js`)
   - Handles Socket.io connection
   - Auto-reconnection logic
   - User identification

5. **StartChatButton** (`src/components/StartChatButton.jsx`)
   - Quick button to initiate chat with any user
   - Can be added to user profiles or item listings

6. **Navigation Integration**
   - Chat link in NavBar with neon styling
   - Only visible when logged in

## Setup Instructions

### 1. Install Dependencies
No additional dependencies needed (socket.io-client and axios already installed)

### 2. Update Environment Variables
Add to your `.env` files:

**Server** (`.env` or existing)
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

**Client** (`.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Database
ChatMessage model uses existing MongoDB connection. Indexes will be created automatically on first run.

### 4. Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

## Usage

### For End Users:
1. **Access Chat**: Click "💬 Chat" link in navbar (logged-in users only)
2. **View Conversations**: Left sidebar shows all conversations
3. **Open Chat**: Click any conversation to view history
4. **Send Message**: Type message and click "Send" or press Enter
5. **Delete Conversation**: Click ✕ button in header
6. **Quick Start**: Use "Message [User]" button on other users' profiles

### For Developers: Adding Chat to Custom Pages

Import and use the Chat button:
```jsx
import StartChatButton from '../components/StartChatButton';

<StartChatButton userId="userId123" userName="John Doe" />
```

Or use the hook for custom Socket.io handling:
```jsx
import useChat from '../hooks/useChat';

const MyComponent = () => {
  const { socket, isConnected } = useChat();
  // Your code
};
```

## Real-time Events

### Socket.io Events

**Client → Server:**
- `identify` - Identify user with their ID
- `sendMessage` - Send a message in real-time
- `typing` - Notify typing status
- `stopTyping` - Stop typing notification

**Server → Client:**
- `receiveMessage` - Receive a new message
- `userTyping` - Another user is typing
- `userStoppedTyping` - User stopped typing

## Styling

All components use the project's existing color scheme:
- Primary: Neon Blue (#00d4ff)
- Secondary: Neon Green (#39ff14)
- Accent: Neon Red (#ff0066)
- Background: Dark gradients

Animations include:
- Message slide-in effect
- Message bubble pop animation
- Smooth transitions
- Glow effects on focus
- Pulse effects on notifications

## Database Schema

### ChatMessage Collection
```javascript
{
  sender: ObjectId (User),
  receiver: ObjectId (User),
  message: String,
  read: Boolean,
  conversationId: String,
  timestamps: true (createdAt, updatedAt)
}
```

Indexes:
- `{ conversationId: 1, createdAt: -1 }`
- `{ sender: 1, receiver: 1 }`

## Known Features & Limitations

✅ **Features:**
- Persistent message history
- Real-time message delivery
- Unread message counter
- Conversation management
- Responsive design
- Beautiful animations
- Auto-reconnection

⚠️ **Future Enhancements:**
- Typing indicators
- Message read receipts
- File/image sharing
- Voice/video calling
- Message reactions/emoji
- Group chats
- Search functionality
- Message editing/deletion

## Troubleshooting

**Messages not sending?**
- Check authentication token in localStorage
- Verify Socket.io connection in browser console
- Check server logs for errors

**Socket.io not connecting?**
- Verify VITE_SOCKET_URL environment variable
- Check CORS settings in server
- Ensure both client and server are running

**Chat history not loading?**
- Check MongoDB connection
- Verify JWT authentication
- Check browser console for errors

## File Structure Summary

```
server/
  models/ChatMessage.js
  controllers/chatController.js
  routes/chatRoutes.js
  index.js (updated with Socket.io handlers)

client/
  src/
    components/
      Chat.jsx (main component)
      StartChatButton.jsx
    pages/ChatPage.jsx
    hooks/useChat.js
    styles/Chat.css
  src/App.jsx (updated with chat route)
  src/components/NavBar.jsx (updated with chat link)
```

## Support
For issues or enhancements, check the console logs and ensure all services are running properly.
