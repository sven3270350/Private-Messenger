import { View, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { useHeaderHeight } from '@react-navigation/elements';
import SearchBar from '@/components/SearchBar';
import ChatList from '@/components/chat-lists/chat-list';
import { ChatListItemType } from '@/constants/type';
import { getChatList } from '@/lib/api';
import { useIsFocused } from '@react-navigation/native';
import { firebase } from '@react-native-firebase/database';

const Page = () => {
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();
  const [chatList, setChatList] = useState<ChatListItemType[]>([]);

  const setupChatListListner = useCallback(() => {
    chatList.forEach((chat) => {
      firebase
        .database()
        .ref(`chats/${chat.chatId}/read`)
        .on('value', async (snapshot) => {
          console.log("<snapshot-read> ", snapshot.val())
          fetchChatList()
        })
    })
  }, [chatList])

  const fetchChatList = async () => {
    const chats = await getChatList()
    const data: ChatListItemType[] = chats.map((chat: any) => ({
      chatId: chat.chatId,
      myKey: chat.myKey,
      opposite: chat.opposite,
      contactName: chat.contactName,
      lastMessage: chat.lastMessage,
      lastReadMessageId: chat.lastReadMessageId,
      lastReadMessageIdOther: chat.lastReadMessageIdOther,
      totalMessageCount: chat.totalCount,
      avatar: chat.avatar
    }))
    setChatList(data)
  }

  useEffect(() => {
    setupChatListListner()
    if(isFocused) fetchChatList()
  }, [isFocused])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: headerHeight, paddingHorizontal: 16 }}>
      <View style={styles.searchBar}>
        <SearchBar searchPhrase={searchPhrase} setSearchPhrase={setSearchPhrase} />
      </View>
      <ChatList data={chatList} />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  searchBar: {
    paddingVertical: 6
  }
});