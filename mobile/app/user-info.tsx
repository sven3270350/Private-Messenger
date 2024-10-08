import { useEffect, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserNameList, updateProfile } from "@/lib/api";

// Define types for the user data
interface UserNameItem {
  userName: string;
  url: string;
  price: number;
  status: "AVAILABLE" | "TAKEN";
}

const Header = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>Username</Text>
  </View>
);

const SubHeader = () => (
  <View>
    <Text style={styles.headerSubText}>
      You can choose a username and people will be able to find you by this
      username and contact you without needing your phone number.
    </Text>
  </View>
);

export default function Verification() {
  const [userName, setUserName] = useState<string>("");
  const [userNameList, setUserNameList] = useState<UserNameItem[]>([]);

  useEffect(() => {
    onGetUserList();
  }, []);

  const onGetUserList = async () => {
    try {
      const userList = await getUserNameList();
      setUserNameList(userList.data);
    } catch (e) {
    }
  };

  const onUpdateProfile = async () => {
    if (!userName) {
      alert("Please enter username");
      return;
    }
    try {
      let data = {
        userName,
      };
      let id = await AsyncStorage.getItem("userId");
      const res = await updateProfile(id, data);
      if (res) {
        router.replace(`/(tabs)/chats`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const renderItem: ListRenderItem<UserNameItem> = ({ item }) => (
    <TouchableOpacity
      onPress={() => item.status === "AVAILABLE" && setUserName(item.userName)}
      style={styles.row}
    >
      <View style={styles.usernameContainer}>
        <Text style={styles.username}>{item.userName}</Text>
        <Text style={styles.link}>{item.url}</Text>
      </View>
      <Text style={styles.value}>{item.price}ETH</Text>

      <TouchableOpacity>
        <Text
          style={[
            styles.status,
            item.status === "AVAILABLE" ? styles.available : styles.taken,
          ]}
        >
          {item.status}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backContainer}
        >
          <Ionicons name="chevron-back" size={25} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Header />
        <SubHeader />

        <View style={styles.phoneNumberContainer}>
          <Text style={{color: Colors.gray, fontSize: 20}}>@</Text>
          <TextInput
            value={userName}
            onChangeText={(e) => setUserName(e)}
            placeholder="username"
            placeholderTextColor={"#505050"}
            style={styles.phoneNumberTextInput}
          />
        </View>
        <View style={styles.suggestedUsernamesContainer}>
          <Text style={styles.suggestedUsernamesText}>Suggested usernames</Text>
          <View style={styles.suggestedUsernamesHeader}>
            <Text style={styles.suggestedUsernamesHeaderText}>Username</Text>
            <Text style={styles.suggestedUsernamesHeaderText}>Value</Text>
            <Text style={styles.suggestedUsernamesHeaderText}>Status</Text>
          </View>
          <View style={styles.separator} />
          <FlatList
            data={userNameList}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>

      <View>
        <TouchableOpacity onPress={() => onUpdateProfile()}>
          <View style={[styles.buttonBase, styles.buttonPrimary]}>
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>
              Next
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: hp(3),
    backgroundColor: Colors.background,
  },
  backContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: wp(2),
    paddingTop: hp(5),
  },
  backText: {
    color: "#EBEBEB",
    fontSize: 18,
    fontFamily: "WorkSans-Bold",
    fontWeight: "600",
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: hp(3),
  },
  headerText: {
    color: Colors.primary,
    fontSize: 32,
    textAlign: "center",
    fontFamily: "WorkSans-Bold",
    fontWeight: "700",
  },
  headerSubText: {
    color: Colors.white,
    textAlign: "center",
    fontSize: 16,
    paddingTop: hp(1.5),
    paddingHorizontal: wp(4),
    fontFamily: "WorkSans-Regular",
    fontWeight: "400",
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: wp(2),
    paddingHorizontal: wp(2),
    borderRadius: 100,
    gap: 6,
    width: wp(95),
    margin: "auto",
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    marginBottom: wp(3),
    height: 60,
    borderRadius: 60,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "WorkSans-Bold",
  },
  buttonTextWhite: {
    color: Colors.white,
  },
  phoneNumberContainer: {
    borderWidth: 1,
    borderColor: "#4B69FF",
    borderRadius: wp(8),
    paddingVertical: wp(3),
    paddingHorizontal: wp(5),
    width: "100%",
    height: wp(13),
    marginTop: wp(5),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  phoneNumberTextInput: {
    color: "white",
    fontWeight: "semibold",
    fontSize: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginHorizontal: "5%",
  },
  usernameContainer: {
    width: "30%",
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#4b93d3",
    fontSize: 12,
  },
  value: {
    color: "#fff",
    fontSize: 14,
    width: "40%",
    alignItems: "center",
    textAlign: "center",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  available: {
    color: "#00ff00",
  },
  taken: {
    color: "#ff0000",
  },
  suggestedUsernamesContainer: {
    marginTop: "5%",
  },
  suggestedUsernamesText: {
    color: "#EBEBEB",
    fontWeight: "700",
    fontSize: 20,
    fontFamily: "WorkSans-Bold",
    marginLeft: wp(4),
    marginBottom: wp(2),
  },
  suggestedUsernamesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp(5),
  },
  suggestedUsernamesHeaderText: {
    color: "#888888",
    fontWeight: "400",
    fontSize: 14,
    fontFamily: "WorkSans-Regular",
  },
  separator: {
    backgroundColor: "#373737",
    height: 1,
    width: "100%",
    marginTop: wp(2),
  },
});
