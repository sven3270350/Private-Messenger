import { Request, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { database } from '../../util/firebase'
import { ref, set, child, push, get, remove, query, equalTo, orderByChild } from "firebase/database";

export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const owner = req.user?.wallet;
  if (!body.contactAddress) {
    return res.status(400).json({success: "false", message: "Target User Address is required."}) as Response
  }
  const result = await get(query(ref(database, `users`), orderByChild("wallet"), equalTo(body.contactAddress)))
  if (result.val() === null) {
    return res.status(400).json({success: "false", message: "Invalid Target User Address."}) as Response
  }
  const user: any = Object.values(result.val())[0]
  const newPostKey = push(child(ref(database), 'contacts')).key;
  try {
    await set(ref(database, 'contacts/' + newPostKey), {
      id: newPostKey,
      owner: owner,
      contactAddress: body.contactAddress,
      contactName: body.contactName ? body.contactName : user.firstName + " " + user.lastName,
      userId: user.id,
      createdAt: Date.now(),
    });
    return res.status(200).json({success: "true", message: "Successfully created the Contact."}) as Response
  } catch (error) {
    return res.status(400).json({success: "false", message: "Error while creating contact."}) as Response
  }
})

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const contactId = req.params.id;
  const result = await get(child(ref(database), `contacts/` + contactId))
  const userName = result.val()
  
  if (userName === null) {
    return res.status(400).json({ success: "false", error: "Invalid contactId." })
  }

  try {
    remove(ref(database, 'contacts/' + contactId))
    return res.status(200).json({success: "true", message: "User Contact is successfully deleted."}) as Response
  } catch (error) {
    return res.status(400).json({success: "false", error: error}) as Response
  }
})

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const contactId = req.params.id;
  const body = req.body;
  const result = await get(child(ref(database), `contacts/` + contactId))
  const contact = result.val()
  
  if (contact === null) {
    return res.status(400).json({ success: "false", error: "Invalid contactId." })
  }

  try {
    await set(ref(database, 'userNames/' + contactId), {
      id: contactId,
      owner: contact.owner,
      contactAddress: contact.contactAddress,
      contactName: body.contactName ? body.contactName : contact.contactName,
      userId: contact.userId,
      createdAt: contact.createdAt,
      updatedAt: Date.now(),
    });

    return res.status(200).json({success: "true", message: "Contact is successfully updated"})
  } catch (error) {
    return res.status(400).json({ success: "false", error: error })
  }
})

export const searchContact = asyncHandler(async (req: Request, res: Response) => {
  const userNameId = req.params.id;
  const body = req.body;
  const result = await get(child(ref(database), `userNames/` + userNameId))
  const userName = result.val()
  
  if (userName === null) {
    return res.status(400).json({ success: "false", error: "Invalid UserNameId." })
  }

  if (!body.owner) {
    return res.status(400).json({success: "false", message: "Owner wallet address is required."}) as Response
  }

  if (!body.transactionHash) {
    return res.status(400).json({success: "false", message: "Transaction Hash is required."}) as Response
  }

  try {
    await set(ref(database, 'userNames/' + userNameId), {
      id: userNameId,
      userName: body.userName ? body.userName : (userName.userName ? userName.userName : null),
      price: body.price ? body.price : (userName.price ? userName.price : "unknown"),
      claimed: true,
      status: "TAKEN",
      owner: body.owner,
      url: body.url ? body.url : (userName.url ? userName.url : null),
      transactionHash: body.transactionHash,
      createdAt: userName.createdAt,
      updatedAt: Date.now(),
    });

    return res.status(200).json({success: "true", message: `User Name is successfully purchased by ${body.owner}`})
  } catch (error) {
    return res.status(400).json({ success: "false", error: error })
  }
})

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = req.user?.wallet;
  const result = await get(query(ref(database, `contacts`), orderByChild("owner"), equalTo(userAddress)))
  const userNames = result.val()
  if (userNames === null) {
    return res.status(200).json({ success: "true", message: "There is no contact right now." })
  }
  return res.status(200).json({success: "true", data: Object.values(userNames)})
})
