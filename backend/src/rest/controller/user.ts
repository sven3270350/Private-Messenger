import { Request, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { database } from '../../util/firebase'
import { ref, set, child, push, get, remove, query, orderByChild, equalTo } from "firebase/database";
import jwt from 'jsonwebtoken'

const generateToken = (address: string) => {
  const secretKey = process.env.SECRET_KEY || ''
  const options = { expiresIn: '24h' }

  const token = jwt.sign({ wallet: address }, secretKey, options)
  return token
}

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const newPostKey = push(child(ref(database), 'users')).key;
  const body = req.body;

  if (!body.walletAddress) {
    return res.status(400).json({success: "false", message: "Wallet Address is required."}) as Response
  }

  const result = await get(child(ref(database), `users/`))

  if (result.val() !== null) {
    const users = Object.values(result.val());
    if (users.some((val: any) => val.wallet === body.walletAddress)) {
      return res.status(400).json({success: "false", message: "Wallet Address already exist."}) as Response 
    }
  }

  try {
    await set(ref(database, 'users/' + newPostKey), {
      id: newPostKey,
      wallet: body.walletAddress,
      firstName: body.firstName ? body.firstName : null,
      lastName: body.lastName ? body.lastName : null,
      bio: body.bio ? body.bio : null,
      phone: body.phone ? body.phone : null,
      avatar: body.avatar ? body.avatar : null,
      isOnline: true,
      lastViewed: Date.now(),
      createdAt: Date.now(),
    });

    const result = await get(child(ref(database), `users/` + newPostKey))
    const user = result.val()
    return res.status(200).json({success: "true", message: "User is successfully created.", data: { token: generateToken(body.walletAddress), user: user }}) as Response
  } catch (error) {
    return res.status(400).json({success: "false", message: "Error while creating user."}) as Response
  }

})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    remove(ref(database, 'users/' + userId))
    return res.status(200).json({success: "true", message: "User is successfully deleted."}) as Response
  } catch (error) {
    return res.status(400).json({success: "false", error: error}) as Response
  }
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const body = req.body;
  const result = await get(child(ref(database), `users/` + userId))
  const user = result.val()
  
  if (user === null) {
    return res.status(400).json({ success: "false", error: "Invalid UserId." })
  }

  try {
    await set(ref(database, 'users/' + userId), {
      id: userId,
      wallet: body.walletAddress ? body.walletAddress : (user.wallet ? user.wallet : null),
      firstName: body.firstName ? body.firstName : (user.firstName ? user.firstName : null),
      lastName: body.lastName ? body.lastName : (user.lastName ? user.lastName : null),
      bio: body.bio ? body.bio : (user.bio ? user.bio : null),
      phone: body.phone ? body.phone : (user.phone ? user.phone : null),
      avatar: body.avatar ? body.avatar : (user.avatar ? user.avatar : null),
      isOnline: user.isOnline,
      lastViewed: user.lastViewed,
      createdAt: user.createdAt,
      updatedAt: Date.now(),
    });

    return res.status(200).json({success: "true", message: "User is successfully updated"})
  } catch (error) {
    return res.status(400).json({ success: "false", error: error })
  }
})

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const result = await get(child(ref(database), `users/` + userId))
  const user = result.val()
  return res.status(200).json({success: "true", data: user})
})

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const searchText = req.query.search
  if (!searchText) {
    return res.status(400).json('Invalid query string.') as Response
  }

  try {
    const result = await get(ref(database, 'users'))
    const users = Object.values(result.val())
    const filteredUsers = users.filter(
      (val: any) =>
        val.firstName?.toLowerCase().includes(searchText) ||
        val.lastName?.toLowerCase().includes(searchText) ||
        val.userName?.toLowerCase().includes(searchText),
    )

    return res
      .status(200)
      .json({ success: 'true', data: filteredUsers }) as Response
  } catch (error) {
    return res.status(400).json({ success: 'false', data: error }) as Response
  }
})

export const checkUserName = asyncHandler(async (req: Request, res: Response) => {
  const userName = req.query.userName as string
  if (!userName) {
    return res.status(400).json('Invalid query string.') as Response
  }

  try {
    const result = await get(query(ref(database, `users`), orderByChild("userName"), equalTo(userName)))
    const user = result.val()

    if (user === null) {
      return res
        .status(200)
        .json({ success: 'true', data: true }) as Response
    } else {
      return res
        .status(200)
        .json({ success: 'true', data: false, message: "Username is already taken by other user." }) as Response
    }
  } catch (error) {
    return res.status(400).json({ success: 'false', data: error }) as Response
  }
})

export const checkWallet = asyncHandler(async (req: Request, res: Response) => {
  const address = req.query.address as string
  if (!address) {
    return res.status(400).json('Invalid query string.') as Response
  }

  try {
    const result = await get(query(ref(database, `users`), orderByChild("wallet"), equalTo(address)))
    const user = result.val()

    if (user === null) {
      return res
        .status(200)
        .json({ success: 'true', data: true }) as Response
    } else {
      const token = generateToken(address);
      return res
        .status(200)
        .json({ success: 'true', data: {data: false, token: token}, message: "wallet address already exist." }) as Response
    }
  } catch (error) {
    return res.status(400).json({ success: 'false', data: error }) as Response
  }
})
