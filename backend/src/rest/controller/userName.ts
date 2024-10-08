import { Request, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { database } from '../../util/firebase'
import { ref, set, child, push, get, remove } from "firebase/database";

export const createUserName = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.userName) {
    return res.status(400).json({success: "false", message: "User Name is required."}) as Response
  }
  const newPostKey = push(child(ref(database), 'userNames')).key;
  try {
    await set(ref(database, 'userNames/' + newPostKey), {
      id: newPostKey,
      userName: body.userName,
      price: body.price ? body.price : "unknown",
      claimed: false,
      status: "AVAILABLE",
      owner: null,
      url: `${body.userName.substring(1)}.s.me`,
      createdAt: Date.now(),
    });
    return res.status(200).json({success: "true", message: "UserName is successfully created."}) as Response
  } catch (error) {
    return res.status(400).json({success: "false", message: "Error while creating username."}) as Response
  }
})

export const deleteUserName = asyncHandler(async (req: Request, res: Response) => {
  const userNameId = req.params.id;
  const result = await get(child(ref(database), `userNames/` + userNameId))
  const userName = result.val()
  
  if (userName === null) {
    return res.status(400).json({ success: "false", error: "Invalid UserNameId." })
  }

  try {
    remove(ref(database, 'userNames/' + userNameId))
    return res.status(200).json({success: "true", message: "UserName is successfully deleted."}) as Response
  } catch (error) {
    return res.status(400).json({success: "false", error: error}) as Response
  }
})

export const updateUserName = asyncHandler(async (req: Request, res: Response) => {
  const userNameId = req.params.id;
  const body = req.body;
  const result = await get(child(ref(database), `userNames/` + userNameId))
  const userName = result.val()
  
  if (userName === null) {
    return res.status(400).json({ success: "false", error: "Invalid UserNameId." })
  }

  try {
    await set(ref(database, 'userNames/' + userNameId), {
      id: userNameId,
      userName: body.userName ? body.userName : (userName.userName ? userName.userName : null),
      price: body.price ? body.price : (userName.price ? userName.price : "unknown"),
      claimed: body.claimed ? body.claimed : (userName.claimed ? userName.claimed : false),
      status: body.status ? body.status : (userName.status ? userName.status : "AVAILABLE"),
      owner: body.owner ? body.owner : (userName.owner ? userName.owner : null),
      url: body.url ? body.url : (body.userName ? `${body.userName.substring(1)}.s.me` : (userName.url ? userName.url : null)),
      createdAt: userName.createdAt,
      updatedAt: Date.now(),
    });

    return res.status(200).json({success: "true", message: "User Name is successfully updated"})
  } catch (error) {
    return res.status(400).json({ success: "false", error: error })
  }
})

export const purchaseUserName = asyncHandler(async (req: Request, res: Response) => {
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

export const getUserNames = asyncHandler(async (req: Request, res: Response) => {
  const result = await get(child(ref(database), `userNames/`))
  const userNames = result.val()
  if (userNames === null) {
    return res.status(200).json({ success: "true", message: "There is no user name right now." })
  }
  return res.status(200).json({success: "true", data: Object.values(userNames)})
})
