import { REST } from './rest/server'
// import { JWTPayload } from 'thirdweb/dist/types/utils/jwt/types'
import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      // user: JWTPayload // Define user property as optional
      user: JwtPayload
    }
  }
}

export const rest = new REST()
