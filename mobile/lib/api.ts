import axios from "axios";
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreateCallType, EncryptedMessage } from "@/constants/type";

const baseURL = process.env.EXPO_PUBLIC_BACKEND_URL!;

if (!baseURL) {
  throw new Error(
    "Missing EXPO_PUBLIC_BACKEND_URL - make sure to set it in your .env file"
  );
}

axios.defaults.baseURL = baseURL;

export function setAuthorize(token: any) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  updateDeviceToken()
}

export async function login(wallet: string) {
  const url = `/api/auth/w-login?address=${wallet}`
  const res = await axios.get(url)
  if (!res) {
    throw new Error("Server Error:");
  }
  setAuthorize(res.data.token);
  return res.data.token as string;
}

export async function createUser(data: any) {
  const url = `/api/auth/user`;
  try {
    const res = await axios.post(url, data);
    if (res.data.data.token) {
      setAuthorize(res.data.data.token);
    }
    console.log('<createUser> ', res.data)
    return res.data;
  } catch (error: any) {
    return new Error(error);
  }
}

export async function checkWallet(wallet: any) {
  const url = `/api/auth/w-login?address=${wallet}&expireTime=30d`;
  try {
    const res = await axios.get(url);
    if (res.data.data.token) {
      setAuthorize(res.data.data.token);
    }
    console.log('<checkWallet> ', res.data)
    return res.data;
  } catch (error: any) {
    return new Error(error);
  }
}

export async function getUserNameList() {
  const url = `/api/username`;
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error: any) {
    return new Error(error);
  }
}

export async function updateProfile(id: any, data: any) {
  const url = `/api/user/${id}`;
  try {
    const res = await axios.put(url, data);
    return res.data;
  } catch (error: any) {
    return new Error(error);
  }
}

export async function uploadImage(data: any) {
  const url = `/api/upload`;
  try {
    const res = await axios.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("<uploadImage> ", res.data);
    return res.data;
  } catch (error: any) {
    console.error("<uploadImage> ", error)
    return new Error(error);
  }
}

export async function getContactlist() {
  try {
    const url = `/api/user/contact`;
    const res = await axios.get(url);
    if (!res) {
      throw new Error("Server Error:");
    }
    return res.data;
  } catch (err: any) {
    return new Error(err);
  }
}

export async function searchUsers(searchPhrase: string) {
  try {
    const url = `/api/search-user?search=${searchPhrase}`
    const res = await axios.get(url)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return [];
    console.log('<searchUsers> ', res.data.data)
    return res.data.data
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function getChat(chatId: string) {
  try {
    const url = `/api/message/${chatId}`
    const res = await axios.get(url)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return []
    if (res.data.data === null) return []
    // console.log('<getChat> ', res.data.data)
    return res.data.data
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function sendMessage(chatId: string, message: EncryptedMessage) {
  try {
    const messageData = {
      chatId,
      message,
    };
    const url = `/api/message`
    const res = await axios.post(url, messageData)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return [];
    console.log('<sendMessage> ', res.data)
    return res.data
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function getOne2OneChatId(walletAddress: string, keys: any) {
  try {
    const url = `/api/chat`
    const res = await axios.post(url, {
      walletAddress,
      keys,
    })
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return '';
    console.log('<getOne2OneChatId> ', res.data.data)
    return res.data.data.chatId
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function setOnlineStatus(isOnline: boolean) {
  try {
    const url = `/api/user/is-online`
    await axios.post(url, {
      isOnline
    })
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function getChatList() {
  try {
    const url = `/api/chat`
    const res = await axios.get(url)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return []
    if (res.data.data === null) return []
    // console.log('<getChatList> ', res.data.data)
    return res.data.data
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function updateReadStatus(chatId: string, readMessageId: number) {
  try {
    const url = `/api/chat/read-status`
    const res = await axios.post(url, {
      chatId,
      readMessageId
    })
    if (!res) {
      throw new Error("Server Error:")
    }
    return res.data.success === "true"
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function updateDeviceToken() {
  // const oldToken = await AsyncStorage.getItem("device-token");

  await messaging().registerDeviceForRemoteMessages();
  const newToken = await messaging().getToken();

  let data: any = {
    token: newToken
  }
  // if(oldToken)
  //   if(oldToken !== newToken) data.oldToken = oldToken
  //   else return false
  console.log("<device token> ", data)
  try {
    const url = `/api/user/save-token`
    const res = await axios.post(url, data)
    if (!res) {
      throw new Error("Server Error:")
    }
    console.log("<device token> ", res.data);
    // await AsyncStorage.setItem("device-token", newToken);
    return res.data.success === "true"
  }
  catch (err: any) {
    console.log(err)
    return new Error(err)
  }
}

export async function createCall(param: CreateCallType) {
  try {
    const url = `/api/call`
    console.log("param", param)
    const res = await axios.post(url, param)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return null;
    console.log('<createCall> ', res.data.data)
    return res.data.data
  }
  catch (err: any) {
    console.log(err)
    return null
  }
}

export async function getUser() {
  try {
    const url = `/api/user`
    const res = await axios.get(url)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return null;
    console.log('<getUser> ', res.data.data)
    return res.data.data
  }
  catch (err: any) {
    console.log(err)
    return null
  }
}

export async function addContact(firstName: string, wallet: string, lastName?: string) {
  try {
    const url = `/api/contact`
    const res = await axios.post(url, {
      firstName,
      lastName,
      contactAddress: wallet
    })
    if (!res) {
      throw new Error("Server Error:")
    }
    return res.data.success === "true";
  }
  catch (err: any) {
    console.log(err)
    return null
  }
}

export async function getContacts() {
  try {
    const url = `/api/contact`
    const res = await axios.get(url)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return null;
    console.log('<getContacts> ', res.data.data)
    return res.data.data
  }
  catch (err: any) {
    console.log(err)
    return null
  }
}

export async function getCalls() {
  try {
    const url = `/api/call`
    const res = await axios.get(url)
    if (!res) {
      throw new Error("Server Error:")
    }
    if (res.data.success !== "true") return null;
    console.log('<getCalls> ', res.data.data)
    return res.data.data
  }
  catch (err: any) {
    console.log(err)
    return null
  }
}