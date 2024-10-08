import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import ClipBoard from "@react-native-clipboard/clipboard";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from "@/constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import { firebase } from "@react-native-firebase/database";
import { getFormattedTime } from '@/lib/util';
import { toast } from "@backpackapp-io/react-native-toast";
import { createCall } from "@/lib/api";
import { CreateCallType } from "@/constants/type";

const Page: React.FC = () => {
  const {profileId, profileType} = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<string | null>("MEDIA");
  let tabs = ["MEDIA", "DOCS", "LINKS", "AUDIO", "GIFS"];
  const [userData, setUserData] = useState<any>();

  const setupRealTimeUserLisnter = () => {
    // Listen for new messages added to Firebase
    if (profileType === "individual") {
      firebase
        .database()
        .ref(`users/${profileId}`)
        .on('value', (snapshot) => {
          setUserData(snapshot.val())
        });
    } else {

    }
  };

  const handleVideoCall = useCallback(async() => {
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
  }, [userData]);


  const copyWalletAddress = useCallback(() => {
    ClipBoard.setString(userData.wallet)
    toast.success('Wallet address copied!')
  }, [userData])

  useEffect(() => {
    setupRealTimeUserLisnter()
  }, [])

  return (
    <ScrollView>
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {
          userData?.avatar && 
          <Image
            src={userData.avatar}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        }
        <View style={styles.menuContainer}>
          <Ionicons name="chevron-back" size={wp(8)} color="white" onPress={() => router.back()}/>
          <MaterialCommunityIcons name="dots-vertical" size={wp(8)} color="white" />
        </View>
        <LinearGradient 
          style={styles.linearGradient}
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          start={{x:0.5, y:1}}
          end={{x:0.5, y:0}}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{`${userData?.firstName} ${userData?.lastName}`}</Text>
            { userData?.isOnline ? 
              <Text style={[styles.headerSubtitle, styles.headerSubtitleIsOnline]}>Online</Text>
              :
              <Text style={[styles.headerSubtitle, styles.headerSubtitleIsOffline]}>Last seen {getFormattedTime(userData?.lastViewed)}</Text>
            }
          </View>
          <View style={styles.callContainer}>
            <View style={styles.callIcon}>
              <MaterialCommunityIcons name="message-reply-text-outline" size={wp(10)} color="white" />
            </View>
            <View style={styles.callIcon}>
              <Octicons name="search" size={wp(10)} color="white" />
            </View>
            <View style={styles.callIcon}>
              <TouchableOpacity onPress={handleVideoCall}>
                <Feather name="phone" size={wp(10)} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.callIcon}>
              <TouchableOpacity onPress={handleVideoCall}>
                <Octicons name="device-camera-video" size={wp(10)} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.detailContainer}>
          <View style={styles.profileInfo}>
            <Feather name="at-sign" size={30} color={Colors.gray} />
            <View style={{flex: 1}}>
              <Text style={styles.detailName}>{userData?.username}</Text>
              <Text style={styles.detailLabel}>Username</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.profileInfo}>
            <Ionicons name="wallet-outline" size={30} color={Colors.gray} />
            <TouchableOpacity style={{flex: 1}} onPress={copyWalletAddress}>
              <Text style={styles.detailName} numberOfLines={1} lineBreakMode={`tail`} >{userData?.wallet}</Text>
              <Text style={styles.detailLabel}>Wallet Address</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.profileInfo}>
            <MaterialCommunityIcons name="information-outline" size={30} color={Colors.gray} />
            <View style={{flex: 1}}>
              <Text style={styles.detailName}>{userData?.bio}</Text>
              <Text style={styles.detailLabel}>Bio</Text>
            </View>
          </View>
        </View>
        <View style={styles.detailContainer}>
          <View style={styles.profileInfo}>
            <Ionicons name="notifications-outline" size={30} color={Colors.gray} />
            <View>
              <Text style={styles.detailName}>Notifications</Text>
              <Text style={styles.detailLabel}>Enabled</Text>
            </View>
          </View>
        </View>
        <View style={styles.detailContainer}>
          <View style={{ marginHorizontal: wp(3), paddingVertical: 10 }}>
            <FlatList
              data={tabs}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    selectedTab === item && styles.selectedTab,
                  ]}
                  onPress={() => setSelectedTab(item)}
                >
                  <Text style={styles.tabText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  imageContainer: {
    width: wp(100),
    height: wp(120),
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
    objectFit: "cover",
  },
  menuContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    top: StatusBar.currentHeight,
    padding: wp(2),
    height: "50%",
    width: "100%",
  },
  linearGradient: {
    position: "absolute",
    flexDirection: "column",
    justifyContent: "flex-end",
    top: "50%",
    height: "50%",
    width: "100%",
  },
  header: {
    marginHorizontal: wp(5),
    marginTop: wp(5),
  },
  headerTitle: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 32,
  },
  headerSubtitle: {
    fontWeight: "500",
    fontSize: 20,
  },
  headerSubtitleIsOnline: {
    color: Colors.primary,
  },
  headerSubtitleIsOffline: {
    color: Colors.white,
  },
  callContainer: {
    margin: wp(5),
    marginBottom: wp(10),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callIcon: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 100,
    width: wp(18),
    height: wp(18),
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center",
  },
  contentContainer: {
    marginTop: -wp(10),
  },
  detailContainer: {
    backgroundColor: Colors.tertiaryGray,
    borderRadius: wp(6),
    marginTop: wp(5),
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(3),
    gap: wp(5),
  },
  detailName: {
    color: Colors.white,
    fontWeight: "500",
    fontSize: 20,
  },
  detailLabel: {
    color: Colors.gray,
    fontWeight: "500",
    fontSize: 14,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: wp(5),
  },
  tabItem: {
    padding: wp(3),
    borderRadius: wp(6),
    paddingHorizontal: wp(5),
  },
  selectedTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.white,
  },
});

export default Page;
