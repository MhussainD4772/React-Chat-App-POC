# Demo Script - React Chat POC

A step-by-step walkthrough for demonstrating the real-time chat application.

## Setup (Before Demo)

### 1. Start Backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3001`

### 2. Start Customer Chat

```bash
cd customer-chat
npm run dev
```

Opens on `http://localhost:5173`

### 3. Start Officer Console

```bash
cd officer-console
npm run dev
```

Opens on `http://localhost:5174`

### 4. Create an Officer

```bash
curl -X POST http://localhost:3001/api/officers \
  -H "Content-Type: application/json" \
  -d '{"id": "officer-1"}'
```

## Demo Walkthrough

### Step 1: Officer Login

**Action:**

- Open officer console (`http://localhost:5174`)
- Enter `officerId: "officer-1"`
- Click "Login"

**What to Show:**

- Dashboard loads with two sections: "Assigned Chats" and "Global Queue"
- Both sections are empty initially
- Officer is ready to receive chats

**Say:**

> "The officer console shows assigned chats on the left and the global queue of unassigned chats on the right. Currently both are empty."

### Step 2: Customer Login (Unassigned)

**Action:**

- Open customer chat (`http://localhost:5173`)
- Enter `customerId: "customer-1"`
- Leave `officerId` empty
- Click "Login"

**What to Show:**

- Customer chat interface loads
- Chat status shows "pending" (unassigned)
- Customer can see the chat but no messages yet

**Say:**

> "When a customer logs in without specifying an officer, a new unassigned chat is created. Notice the status is 'pending'."

### Step 3: Real-Time Queue Update

**Action:**

- Switch back to officer console (keep it visible)

**What to Show:**

- Global Queue section now shows the new chat
- Chat appears automatically without refresh
- Chat shows customer ID and status

**Say:**

> "Watch the officer console - the chat appears in the Global Queue instantly. This is a real-time update via Socket.io. No refresh needed."

### Step 4: Officer Claims Chat

**Action:**

- Click "Claim" button on the chat in Global Queue

**What to Show:**

- Chat disappears from Global Queue
- Chat appears in Assigned Chats section
- Status updates to "assigned"

**Say:**

> "When the officer claims the chat, it moves from the Global Queue to their Assigned Chats. The claim operation is atomic - only one officer can claim a chat."

### Step 5: View Chat Messages

**Action:**

- Click on the assigned chat in the left panel

**What to Show:**

- Messages section appears on the right
- Currently empty (no messages yet)
- Shows the chat is ready for conversation

**Say:**

> "Selecting a chat shows the message history. Right now it's empty, but we're ready to start messaging."

### Step 6: Customer Sends Message

**Action:**

- Switch to customer chat
- Type a message: "Hello, I need help with my loan application"
- Click "Send"

**What to Show:**

- Message appears immediately in customer chat (right-aligned, blue)
- Message appears instantly in officer console (left-aligned, gray)
- No refresh needed on either side

**Say:**

> "The customer sends a message. Notice it appears instantly in both the customer view and the officer console. This is real-time delivery via Socket.io."

### Step 7: Officer Responds

**Action:**

- Switch to officer console
- Type a response: "Hello! I'd be happy to help. What specific questions do you have?"
- Click "Send" (if send functionality exists, otherwise just show the message appearing)

**What to Show:**

- Message appears in officer console (right-aligned, blue)
- Message appears instantly in customer chat (left-aligned, gray)
- Both sides see the conversation in real-time

**Say:**

> "The officer responds, and the customer sees it immediately. Both sides are synchronized in real-time."

### Step 8: Customer Refresh (Reconnection)

**Action:**

- Switch to customer chat
- Refresh the browser page (F5 or Cmd+R)

**What to Show:**

- Page reloads
- Customer sees the same chat
- All previous messages are still visible
- Socket.io reconnects automatically

**Say:**

> "If the customer refreshes the page, they reconnect to the same chat. All message history is preserved, and Socket.io automatically reconnects for real-time updates."

### Step 9: Multiple Customers (Optional)

**Action:**

- Open a new customer chat window (or use incognito)
- Login with `customerId: "customer-2"`
- Show it appears in officer's Global Queue

**What to Show:**

- New chat appears in Global Queue
- Officer can see multiple unassigned chats
- Each chat can be claimed independently

**Say:**

> "Multiple customers can create chats simultaneously. All unassigned chats appear in the Global Queue, and officers can claim them one by one."

## Key Points to Emphasize

1. **Real-Time Updates**: No manual refresh needed - chats and messages appear instantly
2. **Atomic Operations**: Chat claiming prevents race conditions
3. **State Persistence**: Refreshing doesn't lose chat or messages
4. **REST + Socket.io**: REST handles all data operations, Socket.io provides real-time notifications
5. **One Chat Per Customer**: Each customer has exactly one active chat

## Troubleshooting During Demo

- **Backend not running**: Check `http://localhost:3001/health`
- **Socket.io not connecting**: Check browser console for errors
- **Chat not appearing**: Verify officer was created first
- **Messages not syncing**: Check both browser consoles for Socket.io connection status
