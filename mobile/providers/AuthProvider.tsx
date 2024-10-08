import { setAuthorize } from '@/lib/api';
import { generateRSAKeyPair } from '@/lib/util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useState, useEffect } from 'react';

type sessionType = {
  token?: string | null,
  wallet?: string | null,
}

export const AuthContext = createContext<{
  setAuth: (session: sessionType) => void;
  token?: string | null;
  wallet?: string | null;
  privateKey?: string | null;
  publicKey?: string | null;
}>({
  setAuth: () => null,
  token: null,
  wallet: null,
  privateKey: null,
  publicKey: null,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>();
  const [wallet, setWallet] = useState<string | null>();
  const [privateKey, setPrivateKey] = useState<string | null>();
  const [publicKey, setPublicKey] = useState<string | null>();

  const loadSession = async () => {
    const _token = await AsyncStorage.getItem("pm-token")
    setToken(_token)
    setAuthorize(_token)
    const _wallet = await AsyncStorage.getItem("pm-wallet")
    setWallet(_wallet)
  }

  const loadKeyPair = async () => {
    let _privateKey = await AsyncStorage.getItem("pm-private-key")
    let _publicKey = await AsyncStorage.getItem("pm-public-key")
    if(!(_privateKey && _publicKey)) {
      const _keyPair = await generateRSAKeyPair()
      _privateKey = _keyPair.private
      _publicKey = _keyPair.public
    }
    setPrivateKey(_privateKey)
    setPublicKey(_publicKey)
  }

  useEffect(() => {
    loadSession()
    loadKeyPair()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        setAuth: (session: sessionType) => {
          if(session.token) setToken(session.token);
          if(session.wallet) setWallet(session.wallet);
        },
        token,
        wallet,
        privateKey,
        publicKey,
      }}>
      {children}
    </AuthContext.Provider>
  );
}