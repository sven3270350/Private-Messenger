import { View, Text, FlatList } from 'react-native'
import React from 'react'
import ContactListItem from './contact-list-item';
import Colors from '@/constants/Colors';
import { ContactListItemType } from '@/constants/type';

const ItemDivider = () => (
  <View style={{ height: 1, backgroundColor: Colors.tertiaryGray }} />
)
const ContactList = ({data, type=''}: {data: ContactListItemType[], type?: string}) => {
  return (
    <FlatList
      data={data}
      contentContainerStyle={{
        paddingTop: 10,
        paddingBottom: 128,
      }}
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      ListEmptyComponent={
        <View>
          <Text style={{ color: Colors.white }}>No Contacts found</Text>
        </View>
      }
      renderItem={({ item: track  }) => (
        <ContactListItem track={track} type={type}/>
      )}
    />
  )
}
export default ContactList


