# React Chat POC

A real-time chat application where customers can initiate conversations and loan officers manage a shared queue of unassigned chats.

## What We Built

This POC consists of three main components:

1. Backend (Node.js/Express)

   - REST APIs for all data operations (create chats, send messages, claim chats)
   - Socket.io server for real-time message delivery and queue updates
   - SQLite database for persistence

2. Customer Chat (React)

   - Login page to start a chat session
   - Chat interface to view message history and send messages
   - Real-time message reception via Socket.io

3. Officer Console (React)
   - Dashboard showing assigned chats and global queue of unassigned chats
   - Ability to claim unassigned chats
   - Real-time updates when new chats are created or claimed by other officers
   - Message viewing for selected chats

## Architecture

### Component Details

Backend Structure:

- Controllers (/controllers): Handle HTTP requests, validate input, call repositories, emit Socket.io events
- Repositories (/repositories): Database access layer, abstract SQL operations
- Routes (/routes): Express route definitions mapping URLs to controllers
- Socket (/socket): Socket.io event handlers for join_chat, join_officers, and broadcast helpers
- Database (/db): SQLite setup and schema initialization

Frontend Structure:

- Pages: Main route components (Login, Chat, Dashboard)
- Components: Reusable UI components (AssignedChats, GlobalQueue, ChatMessages)
- API (api.ts): REST API client functions using fetch
- Socket (socket.ts): Socket.io client initialization and connection

### Data Flow

Customer Login Flow:

1. Customer submits login form → POST /api/customers/login
2. Backend checks for existing chat by customerId
3. If exists: return existing chat
4. If not: create new chat (assigned if officerId provided, unassigned otherwise)
5. If unassigned: emit queue_chat_created to officers:all room
6. Return chat details to customer

Chat Claiming Flow:

1. Officer clicks "Claim" → POST /api/officers/:officerId/claim/:chatId
2. Backend validates chat exists, checks if already assigned
3. Atomically updates: UPDATE chats SET assigned_officer_id = ? WHERE id = ? AND assigned_officer_id IS NULL
4. If update succeeds: emit queue_chat_claimed to officers:all room
5. Return updated chat

Message Sending Flow:

1. User sends message → POST /api/chats/:chatId/messages
2. Backend creates message record in database
3. Emit new_message to chat:{chatId} room
4. All participants in the room receive the message instantly
5. Return created message

### REST vs Socket.io Split

REST APIs (State Mutations):

- POST /api/customers/login - Create/retrieve chat
- POST /api/officers/:officerId/claim/:chatId - Claim chat
- POST /api/chats/:chatId/messages - Send message
- POST /api/officers - Create officer

REST APIs (Read-Only):

- GET /api/officers/queue - List unassigned chats
- GET /api/officers/:officerId/chats - List officer's chats
- GET /api/chats/:chatId/messages - Get message history

Socket.io (Broadcasts Only):

- queue_chat_created → emitted to officers:all when new unassigned chat created
- queue_chat_claimed → emitted to officers:all when chat is claimed
- new_message → emitted to chat:{chatId} when message is created

Key Principle: REST APIs are the source of truth. Socket.io only broadcasts events after successful REST operations. Socket failures never break REST responses.

### Database Schema

```sql
-- Officers
CREATE TABLE officers (
  id TEXT PRIMARY KEY,
  created_at DATETIME
);

-- Chats (one per customer)
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  customer_id TEXT UNIQUE,
  assigned_officer_id TEXT,  -- NULL if unassigned
  status TEXT,                -- "pending" | "assigned"
  created_at DATETIME
);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT,
  sender_type TEXT,          -- "customer" | "officer"
  sender_id TEXT,
  content TEXT,
  created_at DATETIME
);
```

## Tech Stack

Backend:

- Node.js + Express
- TypeScript
- SQLite3
- Socket.io
- CORS

Frontend:

- React 18
- TypeScript
- Vite
- React Router
- Socket.io Client

## Prerequisites

Before running the application, ensure you have:

- Node.js (version 18 or higher)
- npm (comes with Node.js)

Verify installation:

```bash
node --version  # Should be v18 or higher
npm --version
```

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on http://localhost:3001

### Customer Chat

```bash
cd customer-chat
npm install
npm run dev
```

Runs on http://localhost:5173 (or next available port)

### Officer Console

```bash
cd officer-console
npm install
npm run dev
```

Runs on http://localhost:5174 (or next available port)

### Create an Officer

Before testing, create an officer:

```bash
curl -X POST http://localhost:3001/api/officers \
  -H "Content-Type: application/json" \
  -d '{"id": "officer-1"}'
```

## Quick Test

1. Create officer (see above)
2. Open customer app, login with customerId: "customer-1"
3. Open officer app, login with officerId: "officer-1"
4. Officer sees chat in Global Queue, clicks "Claim"
5. Chat moves to Assigned Chats
6. Both can send messages, see them appear in real-time
