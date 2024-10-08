import { View, Text, FlatList } from 'react-native'
import React from 'react'
import CallListItem from './call-list-item';
import Colors from '@/constants/Colors';
import { CallListItemType } from '@/constants/type';

const ItemDivider = () => (
  <View style={{ height: 1, backgroundColor: Colors.tertiaryGray }} />
)
const CallList = ({ data }: { data: CallListItemType[] }) => {
  return (
    <FlatList
      data={data}
      contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      ListEmptyComponent={
        <View>
          <Text style={{ color: Colors.white }}>No Call history found</Text>
        </View>
      }
      renderItem={({ item: track }) => (
        <CallListItem track={track} />
      )}
    />
  )
}

export default CallList