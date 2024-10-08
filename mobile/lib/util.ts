import { KeyPair, RSA, RSAKeychain } from 'react-native-rsa-native';
// import RNRandomBytes from 'react-native-randombytes';
import Aes from 'react-native-aes-crypto';
import { EncryptedMessage } from '@/constants/type';

export const getFormattedTime = (timeStamp: number) => {
  const timeStampOffset = new Date().getTime() - timeStamp;
	const diffInHours = Math.floor(timeStampOffset / (1000 * 60 * 60));
	const diffInMinutes = Math.floor(timeStampOffset / (1000 * 60));
	if (diffInHours) {
		return `${diffInHours} hour${diffInHours > 1 && `s`} ago`
	}
	if (diffInMinutes) {
		return `${diffInMinutes} minute${diffInMinutes > 1 && `s`} ago`
	}
	return `recently`
}

// Generate a RSA key pair
export function generateRSAKeyPair(): Promise<KeyPair> {
	return RSA.generateKeys(2048);
}

// Encrypt data using the public key
export function encryptRSA(data: string, publicKey: string): Promise<string> {
  return RSA.encrypt(data, publicKey);
}

// Decrypt data using the private key
export async function decryptRSA(encryptedData: string, privateKey: string): Promise<string> {
	return RSA.decrypt(encryptedData, privateKey)
}

export const generateAESKey = (password: string, salt: string, cost: number, length: number) => Aes.pbkdf2(password, salt, cost, length, 'sha256')

export const decryptAES = (encryptedData: EncryptedMessage, key: string) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc')

export const encryptAES = async (text: string, key: string) => {
	const iv = await Aes.randomKey(16);
	const cipher = await Aes.encrypt(text, key, iv, 'aes-256-cbc');
	return ({
		cipher,
		iv,
	});
}
