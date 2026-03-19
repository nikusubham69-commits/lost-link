# Chat System Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOST-LINK CHAT SYSTEM                       │
└─────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │   Web Browser    │
                        │ (React Client)   │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌─────────────┐ ┌────────────┐ ┌──────────────┐
            │  REST API   │ │ Socket.io  │ │ Local Store  │
            │  (HTTP)     │ │ (WebSocket)│ │ (Token/User) │
            └──────┬──────┘ └─────┬──────┘ └──────────────┘
                   │              │
            ┌──────┴──────────────┴──────┐
            │                             │
            ▼                             ▼
    ┌─────────────────────┐     ┌──────────────────┐
    │   Express Server    │     │   Socket.io      │
    │   (Node.js)         │◄───►│   Server         │
    └──────────┬──────────┘     └──────────────────┘
               │
    ┌──────────┴────────────────┐
    │                           │
    ▼                           ▼
┌──────────────────┐    ┌──────────────────┐
│ Route Handler    │    │ Chat Controller  │
│ /api/chat/*      │    │ Business Logic   │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            ┌─────────────────────┐
            │   MongoDB Database  │
            │  Collections:       │
            │  • ChatMessage      │
            │  • User             │
            │  • Item             │
            └─────────────────────┘
```

## Data Flow: Sending a Message

```
User A                    Client (React)           Server (Node.js)         Database (MongoDB)
  │                            │                         │                         │
  ├─ Types message ─────────► │                         │                         │
  │                            │                         │                         │
  ├─ Clicks Send ────────────► │ HTTP POST               │                         │
  │                            │ /api/chat/send ────────► │                         │
  │                            │ {to: userId, msg}       │ Saves message ────────► │
  │                            │                         │                         │
  │                            ◄─── Response ─────────── │ {message object}        │
  │                            │                         │                         │
  │                            │ Socket.io emit          │                         │
  │                            │ 'sendMessage' ─────────► │ Broadcasts to─►┐       │
  │                            │                         │ User B socket   │       │
  │                            │                         │◄─ Emits        │       │
  │                            │                         │ 'receiveMessage'│       │
  │◄─ Message displayed ───── │◄─── Socket.io ─────────┤                │       │
  │  (with animation)          │ 'receiveMessage'        │                │       │
  │                            │                         │                ▼
  │                            │                         │              Stored ✓
  │                            │                         │
  │ ─────────────────────────────────────────────────────────────────────────────
  │                            │                         │                         │
User B                         │                         │                         │
  │                            │                         │                         │
  ├─ Receives Socket           │ Socket.io event         │                         │
  │  'receiveMessage'          │ listener fires ────────►│                         │
  │                    ┌───────┤ Message displayed       │                         │
  │                    │       │ (with animation)        │                         │
  └────────────────────┴──────────────────────────────────────────────────────────
                        ✓ Message appears
                        Real-time delivery
```

## Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.jsx                                │
│  (Main application with routing)                               │
└────────┬────────────────────────────────────────────────────────┘
         │
         ├──► Route: /chat ──► ChatPage.jsx
         │                      │
         │                      └──► Chat.jsx (Main Component)
         │                           │
         │                           ├─► useChat Hook (Socket.io)
         │                           │
         │                           ├─► Left Sidebar
         │                           │   • Conversation List
         │                           │   • unreadCount badge
         │                           │
         │                           └─► Right Main Area
         │                               • Message Display
         │                               • Message Form
         │
         └──► Updated NavBar.jsx
              • Chat Link (💬 Chat)
              • StartChatButton (optional)
```

## Message Display Flow

```
                    ┌─ Sent Message (User's own)
                    │  ├─ Align: right
                    │  ├─ Color: Neon Blue (#00d4ff)
                    │  ├─ Animation: slideIn (right)
                    │  └─ Glow effect: Yes
                    │
Message Received ──┤
                    │
                    └─ Received Message (Other user)
                       ├─ Align: left
                       ├─ Color: Dark with border
                       ├─ Animation: slideIn (left)
                       └─ Glow effect: Border glow
```

## State Management Flow

```
┌──────────────────────────────────┐
│      Local Storage                │
│  • Token                          │
│  • User (id, name, email)         │
│  • (Persisted)                    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│     Socket.io Connection         │
│  • Initialized on Chat load      │
│  • User identified               │
│  • Real-time event listeners     │
│  • Maintained throughout session │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│    React Component State          │
│  • conversations: Array           │
│  • selectedConversation: Object   │
│  • messages: Array                │
│  • messageInput: String           │
│  • loading: Boolean               │
│  • unreadCount: Number            │
└──────────────────────────────────┘
```

## API Call Sequence

```
1. User visits /chat
   GET /api/chat/conversations
   ↓
   Returns: [{ _id, lastMessage, otherUser }, ...]

2. User clicks conversation
   GET /api/chat/history/:conversationId
   ↓
   Returns: [{ sender, receiver, message, createdAt }, ...]

3. User types and sends message
   POST /api/chat/send
   Body: { receiverId, message }
   ↓
   Returns: { message object with timestamps }

4. User checks for unread
   GET /api/chat/unread-count
   ↓
   Returns: { unreadCount: number }

5. User deletes conversation
   DELETE /api/chat/conversations/:conversationId
   ↓
   Returns: { message: "Conversation deleted" }
```

## Real-time Event Flow (Socket.io)

```
                    CLIENT                         SERVER
                      │                              │
    User types msg ──►│                              │
                      │─── 'identify' ──────────────►│ Store socket mapping
                      │                              │
    Send clicked ────►│                              │
                      │─── 'sendMessage' ───────────►│ Broadcast to receiver
                      │                              │
                      │◄─ 'receiveMessage' ─────────│ Receiver gets msg
    Display msg ◄─────│                              │
                      │                              │
    (Optional) Auth ──│─── 'typing' ────────────────►│ If typing
                      │                              │
    Button released ──│─── 'stopTyping' ────────────►│ Stop indicator
                      │                              │
    User leaves  ────►│─── disconnect ──────────────►│ Clean up mapping
                      │                              │
```

## Database Query Optimization

```
ChatMessage Collection
├─ Index 1: { conversationId: 1, createdAt: -1 }
│  └─ Fast retrieval of recent messages in conversation
│
└─ Index 2: { sender: 1, receiver: 1 }
   └─ Fast user-to-user queries

Aggregation Pipeline for getConversations:
$match    ──► Filter by sender OR receiver
  │
$sort     ──► Recent messages first
  │
$group    ──► Group by conversationId
  │
Result    ──► Fast minimal data for list
```

## Authentication & Authorization

```
┌────────────────────────────────────────┐
│        Request Flow                     │
└────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ Check JWT Token in Authorization Header   │
│ (Bearer <token>)                           │
└────────┬────────────────────────────────────┘
         │
         ├─ Valid Token ──► Continue
         │
         ├─ Invalid Token ──► 401 Unauthorized
         │
         └─ No Token ──► 401 Unauthorized

┌────────────────────────────────────────┐
│   Access Control                       │
└────────────────────────────────────────┘
• User A can only access messages where:
  - User A is sender, OR
  - User A is receiver

• Cannot access other users' private chats
* Cannot modify/delete messages they didn't send
```

## Animation Timeline

```
Message Arrival Event:
│
├─ t=0ms: 'receiveMessage' event
│
├─ t=10ms: Element added to DOM
│
├─ t=20ms: messageSlideIn animation starts
│  ├─ opacity: 0 → 1 (400ms)
│  ├─ transform: translateY(10px) → translateY(0) (400ms)
│  └─ transform: scale(0.95) → scale(1) (400ms)
│
├─ t=150ms: bubbleIn animation (child)
│  ├─ opacity: 0 → 1 (300ms)
│  └─ transform: scale(0.85) → scale(1) (300ms)
│
└─ t=420ms: Animation complete, message visible
```

## Responsive Design Breakpoints

```
Desktop (> 768px)
├─ Sidebar: 320px wide
├─ Main: Flex 1
└─ Layout: Horizontal split

Tablet (768px - 600px)
├─ Sidebar: 250px wide
├─ Main: Flex 1
└─ Layout: Horizontal split

Mobile (< 600px)
├─ Sidebar: 100% width
├─ Main: 100% width
└─ Layout: Vertical stack
   ├─ Conversations: 40% height
   └─ Chat: 60% height
```

## Performance Optimization

```
Lazy Loading:
  • Messages loaded on demand
  • Only visible conversations fetched
  
Caching:
  • User data cached in localStorage
  • Conversations cached in state
  
Indexing:
  • Database queries use indexes
  • O(log n) message retrieval
  
Connection Pooling:
  • Socket.io maintains single connection
  • Multiplexed events
  
Debouncing:
  • Typing indicators debounced
```

## Error Handling Flow

```
API Error:
Message Send ──► API Call ──► Error Response
                               │
                               ├─ 401 Unauthorized → Redirect to login
                               ├─ 400 Bad Request → Show error message
                               ├─ 500 Server Error → Show retry option
                               └─ Network Error → Show offline indicator

Socket Connection Error:
Connection Fails ──► Auto Retry ──► Backoff Strategy
  1st retry: 1000ms
  2nd retry: 2000ms
  3rd retry: 3000ms
  4th retry: 4000ms
  5th retry: Fail over
```

---

## Quick Navigation

- **For Setup:** See CHAT_FEATURE_GUIDE.md
- **For Testing:** See CHAT_INTEGRATION_CHECKLIST.md
- **For Testing Code:** See CHAT_TEST.js
- **For Summary:** See CHAT_IMPLEMENTATION_SUMMARY.md
