// import { Logger } from "winston";
import winston from 'winston'

// export const logger = new Logger();

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
})
