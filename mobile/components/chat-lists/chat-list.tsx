import { View, Text, FlatList } from 'react-native'
import React from 'react'
import ChatListItem from './chat-list-item';
import Colors from '@/constants/Colors';
import { ChatListItemType } from '@/constants/type';

const ItemDivider = () => (
  <View style={{ height: 2, backgroundColor: Colors.whiteLow }} />
)
const ChatList = ({ data }: { data: ChatListItemType[] }) => {
  
  return (
    <FlatList
      data={data}
      contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      ListEmptyComponent={
        <View>
          <Text style={{ color: Colors.white }}>No Chats found</Text>
        </View>
      }
      renderItem={({ item: track }) => (
        <ChatListItem track={track} />
      )}
    />
  )
}

export default ChatList