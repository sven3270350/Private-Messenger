// ChatScreen.tsx
import { BlurView } from "expo-blur";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ListRenderItem,
  StatusBar
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import moment from "moment";
import { firebase } from "@react-native-firebase/database";
import { Link, router, useLocalSearchParams } from "expo-router";
import { createCall, getChat, sendMessage, updateReadStatus } from "@/lib/api";
import { Octicons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import Colors from "@/constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { decryptAES, decryptRSA, encryptAES, getFormattedTime } from '@/lib/util';
import { Feather } from '@expo/vector-icons';
import { useAuth } from "@/hooks/useAuth";
import { CreateCallType } from "@/constants/type";
import { toast } from "@backpackapp-io/react-native-toast";

interface Message {
  id: number;
  createdAt: number;
  sender: "me" | "other";
  message: string;
  date?: string;
  from: string;
  notDelivered?: boolean;
  read?: boolean;
}

const ChatScreen: React.FC = () => {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const {wallet, privateKey} = useAuth();
  const [userData, setUserData] = useState<any>();
  const {chatId, oppositeId, oppositeType, encryptedKey} = useLocalSearchParams();
  const [lastReadMessageId, setLastReadMessageId] = useState(-1);
  const [lastReadMessageIdOther, setLastReadMessageIdOther] = useState(-1);
  const [key, setKey] = useState<string>();

  const ref = React.useRef<FlatList>(null);

  const onViewRef = useCallback((viewableItems: any) => {
    let Check = [];
    for (var i = 0; i < viewableItems.viewableItems.length; i++) {
      Check.push(viewableItems.viewableItems[i].item);
    }
    if(lastReadMessageId < Check[0].id) setLastReadMessageId(Check[0].id);
  }, [lastReadMessageId])

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 80 });

  useEffect(() => {
    if(!lastReadMessageId) return
    updateReadStatus(chatId as string, lastReadMessageId)
  }, [lastReadMessageId])

  useEffect(() => {
    if(!privateKey || !encryptedKey) return
    (async() => {
      const decryptedKey = await decryptRSA(encryptedKey as string, privateKey);
      setKey(decryptedKey);
    })()
  }, [])

  useEffect(() => {
    if(!key) return
    onGetMessage();
    setupRealTimeUserLisnter();
    setupRealtimeMessageListener();
  }, [key]);

  const onGetMessage = useCallback(async () => {
    if(!key) return
    try {
      const messages = await getChat(chatId as string)
      const decryptedMessages = messages.map(async (message: any) => {
        const decryptedMessage = await decryptAES(message.message, key)
        return {
          ...message,
          message: decryptedMessage,
        }
      })
      setMessageList(decryptedMessages.reverse());
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const onSendMessage = useCallback(async () => {
    if (!message || !key) {
      return;
    }
    try {
      const _message = await encryptAES(message, key)
      sendMessage(chatId as string, _message);
      setMessage("");
    } catch (error) {
      console.error(error);
    }
  }, [message, chatId, key]);

  const setupRealTimeUserLisnter = () => {
    // Listen for new messages added to Firebase
    if (oppositeType === "individual") {
      firebase
        .database()
        .ref(`users/${oppositeId}`)
        .on('value', (snapshot) => {
          setUserData(snapshot.val())
        });
    } else {

    }
  };

  const setupRealtimeMessageListener = useCallback(() => {
    if(!key) return
    // Listen for new messages added to Firebase
    firebase
      .database()
      .ref(`chats/${chatId}/messages`).limitToLast(1)
      .on('child_added', async (snapshot) => {
        const newMessage = snapshot.val();
        const index = messageList.findIndex(
          (msg) => msg.id === newMessage.id
        )
        const decrypedNewMessage = await decryptAES(newMessage.message, key)
        if (index === -1) {
          const message: Message = {
            id: newMessage.id,
            createdAt: newMessage.createdAt,
            sender: newMessage.from === wallet ? "me" : "other",
            from: newMessage.from,
            message: decrypedNewMessage,
            read: newMessage.readStatus,
          }
          // If message with same id does not exist, add it to the beginning
          setMessageList((prevMessages) => [message, ...prevMessages]);
        }
      });
    firebase
      .database()
      .ref(`chats/${chatId}/read`)
      .on('value', (snapshot) => {
        const readUpdate = snapshot.val();
        if(readUpdate) {
          let maximumLastReadMessageId = -1;
          Object.keys(snapshot.val()).forEach((key) => {
            if(key ===  wallet) return
            if(maximumLastReadMessageId < readUpdate[key]) maximumLastReadMessageId = readUpdate[key]
          })
          setLastReadMessageIdOther(maximumLastReadMessageId)
        }
      });
  }, [setMessageList, messageList, key]);

  const markMessageAsRead = (messageId: string) => {
    // Update the read status of a message in Firebase
    const messageRef = firebase
      .database()
      .ref(` chats/${chatId}/messages/${messageId} ⁠)`);
    messageRef.update({ read: true });
  };

  const handleCall = async() => {
    const param: CreateCallType = {
      targetAddress: [userData.wallet],
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
          userAvatar: userData.avatar,
        }
      })
    } else {
      toast.error("Calling failed")
    }
  }

  const renderItem: ListRenderItem<Message> = ({ item }) => {
    const isMe = item.from === wallet;
    return (
      <View style={styles.messageWrapper}>
        {isMe ? (
          <View style={[styles.myMessageContainer]}>
            <View style={[styles.message, styles.myMessage]}>
              <Text style={styles.text}>{item?.message}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-end",
                marginRight: wp(2),
              }}
            >
              <Text style={[styles.time, styles.myTime]}>
                {" "}
                {moment(item.createdAt).format("hh:mm")}
              </Text>
              { item.id > lastReadMessageIdOther ?
                <FontAwesome6 name="check" size={16} color="gray" />
                :
                <FontAwesome6 name="check-double" size={16} color="gray" />
              }
            </View>
          </View>
        ) : (
          <View style={[styles.otherMessageContainer]}>
            <View style={[styles.message, styles.otherMessage]}>
              <Text style={styles.text}>{item?.message}</Text>
            </View>
            <Text style={[styles.time, styles.otherTime]}>
              {moment(item.createdAt).format("hh:mm")}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "rgba(50, 50, 50, 0.7)",
          paddingTop: StatusBar.currentHeight,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: wp(3),
            marginVertical: wp(2),
          }}
        >
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: wp(3),
          }}>
            <Ionicons name="chevron-back" size={wp(8)} color="white" onPress={() => router.back()}/>
            <View style={{ flexDirection: "row", alignItems: "center"}}>
              { userData &&
                <Link href={{
                  pathname: `profile`,
                  params: {
                    profileId: oppositeId,
                    profileType: oppositeType,
                  }
                }}>
                  <View style={styles.contactListContainer}>
                    { userData.avatar ? 
                      <Image
                        style={styles.avatarImage}
                        src={userData.avatar}
                      />
                      :
                      <View style={[styles.avatarImage, styles.grayCircle]} />
                    }
                    <View style={styles.detailContainer}>
                      <Text style={styles.nameText}>{`${userData.firstName} ${userData.lastName}`}</Text>
                      { userData.isOnline ? 
                        <Text style={[styles.statusText, styles.isOnline]}>Online</Text>
                        :
                        <Text style={styles.statusText}>Last seen {getFormattedTime(userData.lastViewed)}</Text>
                      }
                    </View>
                  </View>
                </Link>
              }
            </View>
          </View>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: wp(3),
          }}>
            <Feather name="phone" size={wp(6)} color="white" onPress={handleCall}/>
            <MaterialCommunityIcons name="dots-vertical" size={wp(8)} color="white" />
          </View>
        </View>
      </View>
      {
        messageList.length > 0 ?
        <FlatList
          onLayout={() => {
            // setupRealtimeMessageListener();
          }}
          data={messageList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chat}
          inverted
          ref={ref}
          onViewableItemsChanged={onViewRef}
          viewabilityConfig={viewConfigRef.current}
          // initialScrollIndex={10}
          // getItemLayout={(data, index) => (
          //   {length: 100, offset: 100 * index, index}
          // )}
        />
        :
        <View style={{flex: 1}}></View>
      }
      <View style={styles.inputContainer}>
        <SimpleLineIcons name="emotsmile" size={wp(8)} color="white" />
        <View style={styles.textInputWrapper}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            onPress={() => onSendMessage()}
            style={styles.sendIconWrapper}
          >
            <Octicons name="paper-airplane" size={wp(6)} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chat: {
    padding: wp(2)
  },
  messageWrapper: {
    flex: 1,
    paddingVertical: wp(2),
  },
  myMessageContainer: {
    flexDirection: "row-reverse",
    marginLeft: wp(25),
  },
  otherMessageContainer: {
    flexDirection: "row",
    marginRight: wp(25),
  },
  message: {
    padding: wp(3),
    borderRadius: wp(4),
  },
  myMessage: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: wp(1),
  },
  otherMessage: {
    backgroundColor: Colors.secondaryGray,
    borderTopLeftRadius: wp(1),
  },
  text: {
    color: Colors.white,
    fontWeight: "400",
    fontSize: 16,
  },
  time: {
    fontWeight: "400",
    fontSize: 12,
    alignSelf: "flex-end",
  },
  myTime: {
    color: Colors.gray,
    marginRight: wp(1),
  },
  otherTime: {
    color: Colors.gray,
    marginLeft: wp(2),
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(50, 50, 50, 0.7)",
    justifyContent: "space-between",
    gap: wp(2),
    alignItems: "center",
    padding: 10,
  },
  textInputWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: wp(10),
  },
  input: {
    color: "white",
    borderRadius: 20,
    height: wp(13),
    paddingLeft: wp(5),
    paddingRight: wp(13),
    paddingVertical: wp(2),
    fontSize: 18,
    flex: 1,
  },
  sendIconWrapper: {
    position: "absolute",
    right: wp(2),
    backgroundColor: Colors.primary,
    borderRadius: 100,
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: wp(10),
    height: wp(10),
    borderRadius: 100,
    marginRight: wp(3),
  },
  contactListContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 2,
    flex: 1
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
});

export default ChatScreen;
