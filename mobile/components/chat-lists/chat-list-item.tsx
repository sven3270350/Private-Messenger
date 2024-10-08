import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { ChatListItemType } from "@/constants/type";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Timestamp } from "react-native-reanimated/lib/typescript/reanimated2/commonTypes";
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from "@/hooks/useAuth";
import { decryptAES, decryptRSA } from "@/lib/util";

const ChatListItem = ({ track }: { track: ChatListItemType }) => {
  const [message, setMessage] = useState('');
  const {wallet: address, privateKey} = useAuth();
  const getDate = (milisec: Timestamp) => {
    const date = new Date(milisec);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // Format the time as HH:MM
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime
  }

  const formatUnreadCount = (unreadCount: number) => {
    if (unreadCount >= 1e9) {
      return (unreadCount / 1e9).toFixed(0).replace(/\.0$/, '') + 'B';
    }
    if (unreadCount >= 1e6) {
      return (unreadCount / 1e6).toFixed(0).replace(/\.0$/, '') + 'M';
    }
    if (unreadCount >= 1e3) {
      return (unreadCount / 1e3).toFixed(0).replace(/\.0$/, '') + 'K';
    }
    return unreadCount.toString();
  }

  const openChat = () => {
    router.push({
      pathname: "/chat-screen",
      params: {
        chatId: track.chatId,
        oppositeId: track.opposite.id,
        oppositeType: track.opposite.type,
        encryptedKey: track.myKey,
      }
    })
  }

  useEffect(() => {
    if(!privateKey) return
    (async () => {
      const _decryptedKey = await decryptRSA(track.myKey, privateKey);
      const _message = await decryptAES(track.lastMessage.message, _decryptedKey)
      setMessage(_message)
    })()
  }, [])

  return (
    <View style={styles.chatListContainer}>
      { track.avatar ? 
        <Image
          style={styles.avatarImage}
          src={track.avatar}
        />
        :
        <View style={[styles.avatarImage, styles.grayCircle]} />
      }
      <TouchableOpacity style={styles.detailContainer} onPress={openChat}>
        <View style={styles.messageContainer}>
          <Text ellipsizeMode='tail' numberOfLines={1} style={styles.name}>{track.contactName}</Text>
          <Text ellipsizeMode='tail' numberOfLines={1} style={styles.message}>{message}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{getDate(track.lastMessage.createdAt)}</Text>
          <View style={styles.badgeContainer}>
          {
            track.totalMessageCount - (track.lastReadMessageId + 1) > 0 ?
            <View style={styles.badge}>
              <Text style={styles.unread}>{formatUnreadCount(track.totalMessageCount-(track.lastReadMessageId+1))}</Text>
            </View>
            :
            track.lastMessage.from === address ?
            track.totalMessageCount - (track.lastReadMessageIdOther + 1) > 0 ?
            <FontAwesome6 name="check" size={16} color="gray" />
            :
            <FontAwesome6 name="check-double" size={16} color="gray" />
            :
            <></>
          }
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatListItem;

const styles = StyleSheet.create({
  chatListContainer: {
    justifyContent: "flex-start",
    flexDirection: "row",
    paddingVertical: 12,
    gap: wp(4),
  },
  detailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  messageContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: wp(2),
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white
  },
  message: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.white,
  },
  timeContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: wp(2),
  },
  time: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.gray,
  },
  badgeContainer: {
    display: "flex",
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    padding: 2,
    minWidth: wp(5),
    minHeight: wp(5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  unread: {
    color: "white",
  },
  avatarImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: 100,
  },
  grayCircle: {
    backgroundColor: Colors.gray,
  },
});
