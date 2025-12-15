const BASE_URL = "http://localhost:3001";

export interface ErrorResponse {
  error: string;
}

export interface Chat {
  id: string;
  customerId: string;
  assignedOfficerId: string | null;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderType: "customer" | "officer";
  senderId: string;
  content: string;
  createdAt: string;
}

export async function fetchAssignedChats(officerId: string): Promise<Chat[]> {
  const response = await fetch(`${BASE_URL}/api/officers/${officerId}/chats`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as ErrorResponse).error || "Failed to fetch assigned chats"
    );
  }

  return data as Chat[];
}

export async function fetchUnassignedChats(): Promise<Chat[]> {
  const response = await fetch(`${BASE_URL}/api/officers/queue`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as ErrorResponse).error || "Failed to fetch unassigned chats"
    );
  }

  return data as Chat[];
}

export async function claimChat(
  chatId: string,
  officerId: string
): Promise<Chat> {
  const response = await fetch(
    `${BASE_URL}/api/officers/${officerId}/claim/${chatId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ErrorResponse).error || "Failed to claim chat");
  }

  return data as Chat;
}

export async function fetchChatMessages(chatId: string): Promise<Message[]> {
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as ErrorResponse).error || "Failed to fetch messages"
    );
  }

  return data as Message[];
}

export async function sendChatMessage(
  chatId: string,
  payload: {
    senderType: "customer" | "officer";
    senderId: string;
    content: string;
  }
): Promise<Message> {
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ErrorResponse).error || "Failed to send message");
  }

  return data as Message;
}

export interface Officer {
  id: string;
  createdAt: string;
}

export async function createOfficer(id: string): Promise<Officer> {
  const response = await fetch(`${BASE_URL}/api/officers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as ErrorResponse).error || "Failed to create officer"
    );
  }

  return data as Officer;
}
