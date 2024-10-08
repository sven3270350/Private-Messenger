import dotenv from 'dotenv'
dotenv.config()

interface IConfig {
  port: number
  isProduction: boolean
  isDevelopment: boolean
  isTestEnvironment: boolean
  thirdWebSecretKey: string
  thirdWebPrivateKey: string
  thirdWebAuthDomain: string
}

export const initConfig = (): IConfig => {
  const {
    NODE_ENV,
    PORT,
    THIRDWEB_SECRET_KEY,
    THIRDWEB_PRIVATE_KEY,
    THIRDWEB_AUTH_DOMAIN,
  } = process.env
  const defaultConfig = {
    isProduction: false,
    isDevelopment: false,
    isTestEnvironment: false,
    port: Number(PORT) || 8000,
    thirdWebSecretKey: THIRDWEB_SECRET_KEY || '',
    thirdWebPrivateKey: THIRDWEB_PRIVATE_KEY || '',
    thirdWebAuthDomain: THIRDWEB_AUTH_DOMAIN || '',
  }
  switch (NODE_ENV) {
    case 'development':
      return {
        ...defaultConfig,
        isDevelopment: true,
      }
    case 'production':
      return {
        ...defaultConfig,
        isProduction: true,
      }
    case 'test':
      return {
        ...defaultConfig,
        isTestEnvironment: true,
        port: Number(PORT) || 5001,
      }
    default:
      return {
        ...defaultConfig,
        isDevelopment: true,
      }
  }
}

export const config = initConfig()
