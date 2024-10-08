import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { createUser, uploadImage } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePicker from "react-native-image-crop-picker";
import ActionSheet from "react-native-actionsheet";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "@/hooks/useAuth";

const Header = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>Your info</Text>
  </View>
);

const SubHeader = () => (
  <View>
    <Text style={styles.headerSubText}>
      Enter your name and profile picture
    </Text>
  </View>
);

export default function PhoneNumber() {
  const actionSheet = useRef();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userImageX, setUserImageX] = useState("");
  const params = useLocalSearchParams();
  const {wallet: walletAddress, publicKey} = useAuth();
  let optionArray = ["Open Camera", "Open Gallery", "Cancel"];

  const showActionSheet = () => {
    if (actionSheet.current) {
      actionSheet.current.show();
    }
  };

  function openGallery() {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image) => {
      setUserImage(image.path);
    });
  }

  function openCamera() {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image) => {
      setUserImage(image.path);
    });
  }

  const onNext = useCallback(async () => {
    try {
      if (!userImageX) {
        alert("Please select profile picture");
      } else if (!firstName) {
        alert("Please enter your first name");
      } else if (!lastName) {
        alert("Please enter your last name");
      } else if(!(walletAddress && publicKey)) {
        alert("Something went wrong, Please try again");
      } else {
        let data = {
          walletAddress,
          firstName,
          lastName,
          avatar: userImageX,
          publicKey: publicKey,
        };
        const token = await createUser(data);
        if (token) {
          await AsyncStorage.setItem("userId", token?.data.user.id);
          await AsyncStorage.setItem("pm-token", token.data.token);
          router.replace(`/user-info`);
        }
      }
    } catch (e) {
    }
  }, [firstName, lastName, userImageX, walletAddress, publicKey]);

  const onUplaodImage = async () => {
    let formData = new FormData();
    formData.append("file", {
      uri: userImage,
      type: "image/jpg",
      name: "image.jpg",
    });
    const res = await uploadImage(formData);
    setUserImageX(res.url)
  };

  useEffect(() => {
    if(userImage === "") return
    onUplaodImage()
  }, [userImage])

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
        <View>
          <TouchableOpacity
            onPress={() => showActionSheet()}
            style={styles.imageContainer}
          >
            { userImageX ?
              <Image
                source={{ uri: userImageX }}
                style={{ height: wp(30), width: wp(30), borderRadius: wp(30) }}
              />
              :
              <View style={styles.imageWrapper}>
                <MaterialCommunityIcons name="camera-plus-outline" size={wp(12)} color={Colors.primary} />
              </View>
            }
            </TouchableOpacity>
          <View style={styles.phoneContainer}>
            <View style={styles.phoneNumberContainer}>
              <TextInput
                value={firstName}
                onChangeText={(e) => setFirstName(e)}
                placeholder="First Name"
                placeholderTextColor={"#505050"}
                style={styles.phoneNumberTextInput}
              />
            </View>
            <View style={styles.phoneNumberContainer}>
              <TextInput
                value={lastName}
                onChangeText={(e) => setLastName(e)}
                placeholder="Last Name"
                placeholderTextColor={"#505050"}
                style={styles.phoneNumberTextInput}
              />
            </View>
          </View>
        </View>
      </View>

      <View>
        <TouchableOpacity onPress={() => onNext()}>
          <View style={[styles.buttonBase, styles.buttonPrimary]}>
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>
              Next
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <ActionSheet
        ref={actionSheet}
        options={optionArray}
        cancelButtonIndex={2}
        onPress={(index: any) => {
          if (index == 0) {
            openCamera();
            return;
          }
          if (index == 1) {
            openGallery();
          }
        }}
      />
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
  headerContainer: {
    alignItems: "center",
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
    paddingHorizontal: wp(2),
    borderRadius: 100,
    gap: 6,
    width: wp(95),
    margin: "auto",
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
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
  phoneContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: wp(8),
  },
  phoneNumberContainer: {
    borderWidth: 1,
    borderColor: "#4B69FF",
    borderRadius: wp(8),
    paddingVertical: wp(3),
    width: "100%",
    height: wp(13),
    marginTop: wp(5),
  },
  phoneNumberTextInput: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
    marginLeft: wp(3),
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
  imageContainer: {
    alignItems: "center",
    paddingVertical: wp(5),
  },
  imageWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderColor: Colors.primary,
    borderWidth: 1,
    width: wp(30),
    height: wp(30),
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center",
  }
});
