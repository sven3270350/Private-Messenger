import CallList from '@/components/call-lists/call-list'
import Colors from '@/constants/Colors'
import { CallListItemType } from '@/constants/type'
import { getCalls } from '@/lib/api'
import { useHeaderHeight } from '@react-navigation/elements'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

const Page = () => {
  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();
  const [calls, setCalls] = useState<CallListItemType[]>([])
  
  useEffect(() => {
    if(isFocused) (async() => {
      const data: CallListItemType[] = await getCalls()
      setCalls(data)
    })()
  }, [isFocused])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: headerHeight, paddingHorizontal: 16 }}>
      <CallList data={calls} />
    </View>
  )
}

export default Page
