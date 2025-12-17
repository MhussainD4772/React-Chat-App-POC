import { Request, Response } from "express";
import { chatRepo } from "../repositories/chatRepo";
import { officerRepo } from "../repositories/officerRepo";
import { randomUUID } from "crypto";
import { io } from "../server";
import { emitQueueChatCreated } from "../socket";

interface LoginRequest {
  customerId: string;
  officerId?: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, officerId }: LoginRequest = req.body;

    if (!customerId) {
      res.status(400).json({ error: "customerId is required" });
      return;
    }

    const existingChat = await chatRepo.findByCustomerId(customerId);

    if (existingChat) {
      res.json({
        chatId: existingChat.id,
        customerId: existingChat.customerId,
        assignedOfficerId: existingChat.assignedOfficerId,
        status: existingChat.status,
      });
      return;
    }

    if (officerId) {
      const officer = await officerRepo.findById(officerId);
      if (!officer) {
        res.status(400).json({ error: "Officer not found" });
        return;
      }

      const newChat = await chatRepo.create(
        randomUUID(),
        customerId,
        officerId,
        "assigned"
      );

      res.json({
        chatId: newChat.id,
        customerId: newChat.customerId,
        assignedOfficerId: newChat.assignedOfficerId,
        status: newChat.status,
      });
      return;
    }

    const newChat = await chatRepo.create(
      randomUUID(),
      customerId,
      null,
      "pending"
    );

    try {
      emitQueueChatCreated(io, {
        id: newChat.id,
        customerId: newChat.customerId,
        assignedOfficerId: newChat.assignedOfficerId,
        status: newChat.status,
        createdAt: newChat.createdAt,
      });
    } catch (error) {
      // Socket failures must not break REST endpoints
    }

    res.json({
      chatId: newChat.id,
      customerId: newChat.customerId,
      assignedOfficerId: newChat.assignedOfficerId,
      status: newChat.status,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
