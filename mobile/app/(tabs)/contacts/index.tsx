import ContactList from '@/components/contact-lists/contact-list'
import Colors from '@/constants/Colors'
import { useHeaderHeight } from '@react-navigation/elements'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { getContacts } from '@/lib/api'
import { ContactListItemType } from '@/constants/type'
import { useIsFocused } from '@react-navigation/native'

const Page = () => {
  const [contacts, setContacts] = useState<ContactListItemType[]>([])
  const isFocused = useIsFocused();

  const fetchData = async () => {
    try {
      const contactList = await getContacts();
      setContacts(contactList);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect( () => {
    if(isFocused) fetchData()
  }, [isFocused])

  const headerHeight = useHeaderHeight();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: headerHeight + 16, paddingHorizontal: 16 }}>
      <ContactList data={contacts} />
    </View>
  )
}

export default Page
