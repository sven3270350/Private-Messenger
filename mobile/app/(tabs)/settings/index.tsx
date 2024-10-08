import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "@/constants/Colors";
import { useHeaderHeight } from "@react-navigation/elements";
import { getUser } from "@/lib/api";

const Page: React.FC = () => {
  const headerHeight = useHeaderHeight();
  const [user, setUser] = useState<any>();  

  useEffect(() => {
    (async () => {
      const data = await getUser()
      console.log(data)
      setUser(data)
    })();
  }, []);
  
  return (
    <View style={[styles.container, {paddingTop: headerHeight + hp(2)}]}>
      <View style={styles.detailContainer}>
        {user?.avatar &&
          <Image
          style={styles.avatarImage}
          src={user.avatar}
          />
        }
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.otherInfo}>{user?.wallet}</Text>
        <Text style={styles.otherInfo}>{user?.username}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={{
        fontSize: 20,
        fontWeight:"bold",
        color: Colors.white
      }}>Switch account</Text>
      <View style={styles.divider} />
      <View style={{
        flex:1,
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "flex-end",
        marginBottom: Platform.OS === 'ios' ? 90 : 70,
      }}>
        <TouchableOpacity>
          <Text style={{
            color: Colors.primary,
            fontSize: 20,
            marginBottom: hp(5),
          }}>Add a new account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: wp(4)
  },
  detailContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: wp(2)
  },
  avatarImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: 100,
  },
  name: {
    fontSize: 20,
    fontWeight: "semibold",
    color: Colors.white,
  },
  otherInfo: {
    fontSize: 16,
    color: Colors.gray,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.tertiaryGray,
    marginVertical: hp(3)
  },
});

export default Page;
