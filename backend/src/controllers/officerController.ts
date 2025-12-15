import { Request, Response } from "express";
import { chatRepo } from "../repositories/chatRepo";
import { officerRepo } from "../repositories/officerRepo";
import { io } from "../server";
import { emitQueueChatClaimed } from "../socket";

interface CreateOfficerRequest {
  id: string;
}

export const createOfficer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id }: CreateOfficerRequest = req.body;

    if (!id) {
      res.status(400).json({ error: "Officer ID is required" });
      return;
    }

    const existingOfficer = await officerRepo.findById(id);
    if (existingOfficer) {
      res.status(409).json({ error: "Officer already exists" });
      return;
    }

    const officer = await officerRepo.create(id);
    res.json(officer);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const chats = await chatRepo.findAllUnassigned();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOfficerChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { officerId } = req.params;

    const officer = await officerRepo.findById(officerId);
    if (!officer) {
      res.status(400).json({ error: "Officer not found" });
      return;
    }

    const chats = await chatRepo.findByAssignedOfficerId(officerId);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const claimChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { officerId, chatId } = req.params;

    if (!chatId || !officerId) {
      res.status(400).json({ error: "Chat ID and Officer ID are required" });
      return;
    }

    const chat = await chatRepo.findById(chatId);
    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    if (chat.assignedOfficerId !== null) {
      res.status(409).json({ error: "Chat already assigned" });
      return;
    }

    const officer = await officerRepo.findById(officerId);
    if (!officer) {
      res.status(400).json({ error: "Officer not found" });
      return;
    }

    const updatedChat = await chatRepo.assignChat(chatId, officerId);
    if (!updatedChat) {
      res.status(409).json({ error: "Chat already assigned" });
      return;
    }

    try {
      emitQueueChatClaimed(io, chatId, officerId);
    } catch (error) {
      // Socket failures must not break REST endpoints
    }

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
