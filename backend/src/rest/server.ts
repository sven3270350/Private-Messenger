import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import allRoutes from './route'
import { config } from '../config'
import { logger } from '../util/logger'
import userAuthMiddleware from './middleware/validAuth'

export class REST {
  public app = express()

  constructor() {
    this.app.use((_req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, AUTHORIZATION',
      )
      next()
    })

    this.app.use(cors())
    this.app.use(helmet())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use('/api', userAuthMiddleware)
    this.app.use('/api', allRoutes)

    this.app.get('/ping', (_req: Request, res: Response) => {
      res.send('pong')
    })

    this.app.use((_, res) => {
      res.status(404).send('Not found')
    })

    this.app.listen(config.port, async () => {
      logger.info(`API is running on port ${config.port}`)
    })
  }
}
