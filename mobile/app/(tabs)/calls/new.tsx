import { View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { useHeaderHeight } from '@react-navigation/elements';
import SearchBar from '@/components/SearchBar';
import ContactList from '@/components/contact-lists/contact-list';
import { ContactListItemType } from '@/constants/type';
import { getContacts } from '@/lib/api';

const Page = () => {
  const [searchPhrase, setSearchPhrase] = useState('');
  const headerHeight = useHeaderHeight();
  const [contacts, setContacts] = useState<ContactListItemType[]>([])
  const [filteredContacts, setFilteredContacts] = useState<ContactListItemType[]>([])
  useEffect(() => {
    (async () => {
      const data:ContactListItemType[] = await getContacts()
      setContacts(data)
    })()
  }, [])

  const search = useCallback(async () => {
    try {
      if (searchPhrase === '') {
        setFilteredContacts(contacts)
        return
      }
      const filterMap: ContactListItemType[] = contacts.filter((data: ContactListItemType) => `${data.firstName} ${data.lastName}`.search(searchPhrase) > -1)
      setFilteredContacts(filterMap);
    } catch (error) {
      console.error(error);
    }
  }, [searchPhrase, contacts])

  useEffect(() => {
    search()
  }, [searchPhrase, search])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: headerHeight, paddingHorizontal: 16 }}>
      <SearchBar searchPhrase={searchPhrase} setSearchPhrase={setSearchPhrase}/>
      <ContactList data={filteredContacts} type="call"/>
    </View>
  );
};

export default Page;
