import { createThirdwebClient } from 'thirdweb'
import { createAuth } from 'thirdweb/auth'
import { privateKeyToAccount } from 'thirdweb/wallets'
import { config } from '../config'

const thirdwebClient = createThirdwebClient({
  secretKey: config.thirdWebSecretKey,
})

export const auth = createAuth({
  domain: config.thirdWebAuthDomain,
  client: thirdwebClient,
  adminAccount: privateKeyToAccount({
    client: thirdwebClient,
    privateKey: config.thirdWebPrivateKey,
  }),
})
