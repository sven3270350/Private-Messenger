import { Request, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { database } from '../../util/firebase'
import { ref, set, child, push, get, update, increment } from "firebase/database";

export const newMessage = asyncHandler(async (req: Request, res: Response) => {
  const chatId = req.body.chatId;
  const message = req.body.message;
  const address = req.user.wallet;
  if (!chatId) {
    return res.status(400).json("Chat Id is required.") as Response
  }

  const result = await get(child(ref(database), `chats/` + chatId))
  const chat = result.val()
  if (chat === null) {
    return res.status(400).json("Invalid chat Id.") as Response
  }

  if (!message) {
    return res.status(400).json("New message is required.") as Response
  }

  if (!address) {
    return res.status(400).json("Sender Address is required.") as Response
  }
  const updates = {} as any;
  updates[`chats/${chatId}/totalCount`] = increment(1);
  await update(ref(database), updates);
  const newPostKey = push(child(ref(database), 'chats/' + chatId + '/messages')).key;
  const id = (await get(ref(database, 'chats/' + chatId + '/totalCount'))).val()

  const contact = await set(ref(database, 'chats/' + chatId + '/messages/' + newPostKey), {
    id: id - 1,
    address: address,
    message: message,
    readStatus: false,
    createdAt: Date.now()
  });

  return res.status(200).json({ success: "true", message: "Message is sent successfully." }) as Response
})

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  if (!chatId) {
    return res.status(400).json("Contact Id is required.") as Response
  }
  try {
    const result = await get(child(ref(database), `chats/` + chatId + "/messages"))
    if (result.val() === null) {
      return res.status(200).json({success: "true", data: null}) as Response
    }
    const messages = Object.values(result.val())
  
    return res.status(200).json({success: "true", data: messages}) as Response
  } catch (error) {
    return res.status(400).json({success: "false", message: "Invalid chat Id."}) as Response
  }
})
