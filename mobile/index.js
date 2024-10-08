import "@thirdweb-dev/react-native-adapter";
import "expo-router/entry";
import firebase from '@react-native-firebase/app';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { router } from "expo-router";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_APIKEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTHDOMAIN || "",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_REALTIME_DATABASEURL || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECTID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGEBUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGINGSENDERID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APPID || "",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENTID || "",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var channelId='';

async function initializeNotifeeChannel() {
  const channel = await notifee.getChannel('private-messenger-channel')
  if(channel) {
    channelId = channel.id
    return
  }
  channelId = await notifee.createChannel({
    id: 'private-messenger-channel',
    name: 'Private Messenger',
    importance: AndroidImportance.HIGH,
  })
}

async function onMessageReceived(message) {
  const data = message.data;
  if(data.type === "new call") {
    const call = JSON.parse(data.data)
    const user = JSON.parse(data.user)
    await notifee.displayNotification({
      id: call.channel,
      title: `Incoming call from ${user.firstName} ${user.lastName}`,
      body: 'You have an incoming call',
      data: {
        token: call.token,
        channelName: call.channel,
        userAvatar: user.avatar,
      },
      android: {
        channelId,
        actions: [
          {
            title: 'Accept',
            pressAction: {
              id: 'accept_call',
            },
          },
          {
            title: 'Decline',
            pressAction: {
              id: 'decline_call',
            },
          },
        ],
      },
    });
  }
}

const handleNotificationInteraction = async ({type, detail}) => {
  if (type === EventType.ACTION_PRESS) {
    const { notification, pressAction } = detail;

    if (pressAction.id === 'accept_call') {
      // Navigate to the desired screen with params
      router.push({
        pathname: "/call-screen",
        params: notification.data
      })
    } else if (pressAction.id === 'decline_call') {
      // Remove notification
      await notifee.cancelNotification(notification.id);
      // Call backend API to decline call
    }
  }
}

notifee.onForegroundEvent(handleNotificationInteraction)
notifee.onBackgroundEvent(handleNotificationInteraction);

initializeNotifeeChannel()
// messaging().setBackgroundMessageHandler(onMessageReceived);
messaging().onMessage(onMessageReceived);