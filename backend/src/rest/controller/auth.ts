import { Request, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { auth } from '../../util/thirdweb'
import jwt from 'jsonwebtoken'

export const getPayload = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body
  const loginPayload = await auth.generatePayload(payload)
  res.status(200).json(loginPayload) as Response
})

export const verifyPayload = asyncHandler(
  async (req: Request, res: Response) => {
    const { payload, signature } = req.body
    const verifiedPayload = await auth.verifyPayload({
      payload,
      signature,
    })

    if (!verifiedPayload.valid) {
      return res.status(400).json({ error: 'Signature failed.' })
    }

    const jwt = await auth.generateJWT({ payload: verifiedPayload.payload })
    const parsedJWT = await auth.verifyJWT({ jwt })

    if (!parsedJWT.valid) {
      return res.status(400).json({ error: 'Generate JWT failed.' })
    }

    res.status(200).json({ jwt }) as Response
  },
)
