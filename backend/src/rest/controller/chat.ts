import { Request, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { database } from '../../util/firebase'
import { ref, set, child, push, get } from 'firebase/database'

export const createOne2OneChat = asyncHandler(
  async (req: Request, res: Response) => {
    const userAddress = req.user.wallet
    const walletAddress = req.body.walletAddress
    if (!walletAddress) {
      return res
        .status(400)
        .json('Target Wallet Address is required.') as Response
    }

    const result = await get(child(ref(database), `chats/`))
    if (result.val() !== null) {
      const chats = Object.values(result.val())
      const chat = chats.filter(
        (val: any, index) =>
          val.participants.includes(userAddress) &&
            val.participants.includes(walletAddress)
      ) as any
      if (chat.length !== 0) {
        return res
          .status(200)
          .json({
            success: 'true',
            data: { chatId: chat[0].id }
          }) as Response
      }
    }

    const newPostKey = push(child(ref(database), 'chats')).key

    await set(ref(database, 'chats/' + newPostKey), {
      id: newPostKey,
      participants: [userAddress, walletAddress],
      type: "ONE2ONE",
      totalCount: 1,
      createdAt: Date.now()
    })

    const chat = (await get(ref(database, 'chats/' + newPostKey))).val()

    return res
      .status(200)
      .json({
        success: 'true',
        data: { chatId: chat.id }
      }) as Response
  },
)

export const getChatRoom = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = req.user.wallet
  const targetAddress = req.params.targetAddress
  if (!targetAddress) {
    return res
      .status(400)
      .json('Target Wallet Address is required.') as Response
  }
  const result = await get(child(ref(database), `chats`))
  const chats = Object.values(result.val())
  const userChats = chats.filter((item: any, index) => {
    if (item.participants.includes(targetAddress)) {
      return item
    }
  })

  const filteredChats = userChats.map((val: any) => {
    const result = {
      id: val.id,
      participants: val.participants,
      type: val.type,
      createdAt: val.createdAt,
      lastMessage: val.messages ? Object.values(val.messages).at(-1) : null,
      unreadCount: val.messages
        ? Object.values(val.messages).reduce((result: any, value: any) => {
            if (value.address !== userAddress && !value.readStatus) {
              result++
            }
            return result
          }, 0)
        : null,
    }
    return result
  })

  return res
    .status(200)
    .json({ success: 'true', data: filteredChats }) as Response
})
