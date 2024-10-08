import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { CallListItemType } from '@/constants/type';
import { useAuth } from '@/hooks/useAuth';

const CallListItem = ({ track }: { track: CallListItemType }) => {
  const { wallet } = useAuth();

  const formatCallDuration = (duration: number) => {
    duration /= 1000
    if (duration < 60) return `${duration} sec`
    duration /= 60
    if (duration < 60) return `${duration} min`
    const hour = duration / 60
    const min = duration % 60
    return `${hour} h ${min} min`
  }

  const formatCallDay = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getMonth()}/${date.getDay()}`
  }

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
      <View style={styles.detailContainer}>
        <Text style={styles.name}>{track.contactName}</Text>
        {
          track.callStatus in ["canceled", "declined", "missed"] ?
          <Text style={[styles.text, { color: Colors.red }]}>{track.callStatus}</Text>
          :
          (
            (track.endedAt && track.startedAt) &&
            <Text style={styles.text}>
              {wallet === track.caller ? "Outgoing" : "Incoming"}
              {`(${formatCallDuration(track.endedAt-track.startedAt)})`}
            </Text>
          )
        }
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.time}>{formatCallDay(track.createdAt)}</Text>
        <Ionicons name="information-circle-outline" size={24} color="white" />
      </View>
    </View>
  )
}

export default CallListItem

const styles = StyleSheet.create({
  chatListContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 6,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 12,
  },
  grayCircle: {
    backgroundColor: Colors.gray,
  },
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 2,
    flex: 1
  },
  dateContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.gray,
  },
  time: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray,
  },
})