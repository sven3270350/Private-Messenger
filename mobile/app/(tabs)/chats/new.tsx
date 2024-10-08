import { View, StyleSheet, TextInput, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { useHeaderHeight } from '@react-navigation/elements';
import Feather from '@expo/vector-icons/Feather';
import SearchBar from '@/components/SearchBar';
import ContactList from '@/components/contact-lists/contact-list';
import { ContactListItemType } from '@/constants/type';
import { searchUsers } from '@/lib/api';

const Page = () => {
  const [searchPhrase, setSearchPhrase] = useState('');
  const headerHeight = useHeaderHeight();
  const [contacts, setContacts] = useState<ContactListItemType[]>([])

  const search = useCallback(async () => {
    try {
      if (searchPhrase === '') return setContacts([])
      const searchList = await searchUsers(searchPhrase);
      if (!searchList) return
      const filterMap: ContactListItemType[] = searchList.map((data: any) => ({
        contactId: data.id,
        contactWallet: data.wallet,
        contactPublicKey: data.publicKey,
        firstName: data.firstName,
        lastName: data.lastName,
        isOnline: data.isOnline,
        lastViewed: data.lastViewed,
        avatar: data.avatar,
      }))
      setContacts(filterMap);
    } catch (error) {
      console.error(error);
    }
  }, [searchPhrase])

  useEffect(() => {
    search()
  }, [searchPhrase, search])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: headerHeight, paddingHorizontal: 16 }}>
      <View style={styles.addContainer}>
        <View style={styles.addContainerRow}>
          <Feather name="users" size={24} color="#4B69FF" />
          <Text style={{color: '#4B69FF', fontSize: 16}}>New Group</Text>
        </View>
        <View style={styles.addContainerRow}>
          <Feather name="user-plus" size={24} color="#4B69FF" />
          <Text style={{color: '#4B69FF', fontSize: 16}}>New Contact</Text>
        </View>
      </View>
      <SearchBar searchPhrase={searchPhrase} setSearchPhrase={setSearchPhrase}/>
      <ContactList data={contacts}/>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF15',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 6,
    marginTop: 12,
  },
  searchInput: {
    backgroundColor: 'transparent',
    fontSize: 19,
    color: Colors.white,
    flex: 1,
  },
  addContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderBottomColor: Colors.gray,
    borderBottomWidth: 1,
    borderTopColor: Colors.gray,
    borderTopWidth: 1,
    paddingVertical: 12,
    marginVertical: 12,
  },
  addContainerRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});