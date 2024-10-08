import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useCallback } from 'react'
import Colors from '@/constants/Colors';
import { ContactListItemType, CreateCallType } from '@/constants/type';
import { encryptRSA, generateAESKey, getFormattedTime } from '@/lib/util';
import { createCall, getOne2OneChatId } from '@/lib/api';
import { router } from 'expo-router';
import { Feather, Octicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { toast } from '@backpackapp-io/react-native-toast';
import { useAuth } from '@/hooks/useAuth';

const ContactListItem = ({track, type}: {track: ContactListItemType, type: string}) => {
  const { wallet, publicKey } = useAuth();

  const handleContactListItemPress = useCallback(async () => {
    if(!wallet || !publicKey) return
    const key = await generateAESKey('Mathew', 'salt', 5000, 256)
    let keys: any = {};
    keys[wallet] = await encryptRSA(key, publicKey);
    keys[track.contactWallet] = await encryptRSA(key, track.contactPublicKey);
    const chatId = await getOne2OneChatId(track.contactWallet, keys)
    router.push({
      pathname: `/chat-screen`,
      params: {
        chatId: chatId,
        oppositeId: track.contactId,
        oppositeType: "individual",
        encryptedKey: keys[wallet],
      }
    })
  }, [wallet, publicKey])

  const handleVideoCall = async() => {
    const param: CreateCallType = {
      targetAddress: [track.contactWallet],
      type: "one2one-video",
      expireTime: 60,
      role: "publisher",
      tokentype: "uid",
    }
    const createdCall = await createCall(param)
    if(createdCall) {
      router.push({
        pathname: "/call-screen",
        params: {
          channelName: createdCall.id,
          token: createdCall.token,
          userAvatar: track.avatar,
        }
      })
    } else {
      toast.error("Calling failed")
    }
  }

  return (
    <View style={styles.contactListContainer}>
      <TouchableOpacity style={styles.userContainer} onPress={handleContactListItemPress}>
        { track.avatar ? 
          <Image
            style={styles.avatarImage}
            src={track.avatar}
          />
          :
          <View style={[styles.avatarImage, styles.grayCircle]} />
        }
        <View style={styles.detailContainer}>
          <Text style={styles.nameText}>{`${track.firstName} ${track.lastName}`}</Text>
          { track.isOnline ? 
            <Text style={[styles.statusText, styles.isOnline]}>Online</Text>
            :
            <Text style={styles.statusText}>Last seen {getFormattedTime(track.lastViewed)}</Text>
          }
        </View>
      </TouchableOpacity>
      {
        type === "call" &&
        <View style={styles.callContainer}>
          <Feather name="phone" size={wp(7)} color="white" onPress={handleVideoCall} />
          <Octicons name="device-camera-video" size={wp(7)} color="white" onPress={handleVideoCall} />
        </View>
      }
    </View>
  )
}

export default ContactListItem

const styles = StyleSheet.create({
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 12,
  },
  contactListContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 6,
  },
  userContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex:1,
  },
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 2,
  },
  callContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp(4),
  },
  nameText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  isOnline: {
    color: Colors.primary
  },
  statusText: {
    color: Colors.gray,
    fontSize: 12
  },
  grayCircle: {
    backgroundColor: Colors.gray,
  },
})