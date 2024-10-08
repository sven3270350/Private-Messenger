import { NextFunction, Request, Response } from 'express'
// import { auth } from '../../util/thirdweb'
import jwt, { JwtPayload } from 'jsonwebtoken'

const userAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.path)
  if (!req.path.startsWith('/auth') && !req.path.startsWith('/upload')) {
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) {
      return res.status(403).json({ message: 'Token is required' })
    }
    jwt.verify(
      token,
      process.env.SECRET_KEY || '',
      (err: any, decoded: any) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' })
        }
        req.user = decoded as JwtPayload
        next()
      },
    )
    // try {
    //   if (!jwt) {
    //     throw new Error()
    //   }
    //   const parsedJWT = await auth.verifyJWT({ jwt })
    //   if (!parsedJWT.valid) {
    //     throw new Error()
    //   }
    //   req.user = parsedJWT.parsedJWT
    // } catch (error) {
    //   return res.status(401).json({
    //     message: 'Unauthorized.',
    //   })
    // }
  }
  else {
    next() // Continue to the next middleware or route handler
  }
}

export default userAuthMiddleware
