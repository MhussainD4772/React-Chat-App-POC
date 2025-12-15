const BASE_URL = "http://localhost:3001";

export interface LoginRequest {
  customerId: string;
  officerId?: string;
}

export interface ChatResponse {
  chatId: string;
  customerId: string;
  assignedOfficerId: string | null;
  status: string;
}

export interface ErrorResponse {
  error: string;
}

export async function loginCustomer(
  customerId: string,
  officerId?: string
): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/api/customers/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      officerId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ErrorResponse).error || "Login failed");
  }

  return data as ChatResponse;
}

export interface Message {
  id: string;
  chatId: string;
  senderType: "customer" | "officer";
  senderId: string;
  content: string;
  createdAt: string;
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

export interface SendMessagePayload {
  senderType: "customer";
  senderId: string;
  content: string;
}

export async function sendChatMessage(
  chatId: string,
  payload: SendMessagePayload
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
