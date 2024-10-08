import { Timestamp } from "react-native-reanimated/lib/typescript/reanimated2/commonTypes"

export type ContactListItemType = {
  contactId: string,
  contactPublicKey: string,
  contactWallet: string,
  firstName: string,
  lastName?: string,
  isOnline: boolean,
  lastViewed: Timestamp,
  avatar?: string,
}

export type EncryptedMessage = {
  cipher: string,
  iv: string,
}

type Message = {
  id: number,
  from: string,
  message: EncryptedMessage,
  createdAt: Timestamp,
  readStatus: boolean,
}

export type ChatListItemType = {
  chatId: string,
  myKey: string,
  opposite: {
    id: string,
    type: "individual" | "group",
  },
  contactName: string,
  lastMessage: Message,
  lastReadMessageId: number,
  lastReadMessageIdOther: number,
  totalMessageCount: number,
  avatar?: string
}

export type CreateCallType = {
  targetAddress: string[],
  type: "one2one-video" | "one2one-audio" | "group-video" | "group-audio",
  expireTime: number,   // in seconds
  role: "publisher" | "audience",
  tokentype: "userAccount" | "uid",
}

export type CallListItemType = {
  callId: string,
  avatar: string,
  contactName: string,
  caller: string,
  callStatus: "canceled" | "missed" | "declined" | "accepted"
  createdAt: Timestamp,
  startedAt?: Timestamp,
  endedAt?: Timestamp,
}