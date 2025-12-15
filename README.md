# React Chat POC

A real-time chat application where customers can initiate conversations and loan officers manage a shared queue of unassigned chats.

## System Architecture

The application consists of three components:

1. **Backend** (Node.js/Express) - REST APIs and Socket.io server with SQLite database
2. **Customer Chat** (React) - Customer-facing chat interface
3. **Officer Console** (React) - Officer dashboard for managing chats

### Data Flow

**Customer Login:**

- Customer submits login → POST /api/customers/login
- Backend creates/retrieves chat
- If unassigned, emits `queue_chat_created` to all officers

**Chat Claiming:**

- Officer claims chat → POST /api/officers/:officerId/claim/:chatId
- Backend atomically assigns chat to officer
- Emits `queue_chat_claimed` to all officers

**Message Sending:**

- User sends message → POST /api/chats/:chatId/messages
- Backend saves message and emits `new_message` to chat room
- All participants receive message in real-time

### API Endpoints

**REST APIs:**

- POST /api/customers/login - Create/retrieve chat
- POST /api/officers/:officerId/claim/:chatId - Claim chat
- POST /api/chats/:chatId/messages - Send message
- GET /api/officers/queue - List unassigned chats
- GET /api/officers/:officerId/chats - List officer's chats
- GET /api/chats/:chatId/messages - Get message history

**Socket.io Events:**

- `queue_chat_created` - New unassigned chat created
- `queue_chat_claimed` - Chat claimed by officer
- `new_message` - New message in chat

## Prerequisites

- Node.js (version 18 or higher)
- npm

## How to Run Locally

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start Customer Chat

```bash
cd customer-chat
npm install
npm run dev
```

### 3. Start Officer Console

```bash
cd officer-console
npm install
npm run dev
```

```

## Quick Test

1. Create officer (see above)
2. Open customer app, login with `customerId: "customer-1"`
3. Open officer app, login with `officerId: "officer-1"`
4. Officer sees chat in Global Queue, clicks "Claim"
5. Chat moves to Assigned Chats
6. Both can send messages, see them appear in real-time
```
