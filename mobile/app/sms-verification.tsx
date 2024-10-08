import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "@/constants/Colors";
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal";
import { useState } from "react";
import OtpInputs from "react-native-otp-inputs";
import { Ionicons } from "@expo/vector-icons";
import { preAuthenticate } from "thirdweb/wallets/in-app";
import { chain, client } from "@/constants/thirdweb";
import { inAppWallet } from "thirdweb/wallets/in-app";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkWallet, setAuthorize } from "@/lib/api";
import axios from "axios";

const Header = ({ phoneNumber }: { phoneNumber: string }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>{phoneNumber}</Text>
  </View>
);

const SubHeader = () => (
  <View>
    <Text style={styles.headerSubText}>
      We have sent you an SMS with the code
    </Text>
  </View>
);

export default function Verification({}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const params = useLocalSearchParams();
  const { phoneNumber } = params as { phoneNumber: string };
  const [otp, setOtp] = useState("");

  async function connect() {
    if (!otp) {
      alert("Please enter a otp");
      return;
    }

    try {
      setIsConnecting(true);
      // create a in-app wallet instance
      const wallet = inAppWallet({
        smartAccount: {
          chain,
          sponsorGas: true,
        },
      });
      // if the OTP is correct, the wallet will be connected else an error will be thrown
      const account = await wallet.connect({
        client,
        strategy: "phone",
        phoneNumber,
        verificationCode: otp, // Pass the OTP entered by the user
      });
      const userExist = await checkWallet(account.address);
      setIsConnecting(false);
      if (userExist?.data.token) {
        router.push(`/(tabs)/chats`);
        await AsyncStorage.setItem("pm-token", userExist?.data.token);
      } else {
        router.navigate(`/user-name`);
      }
    } catch (e) {
      setIsConnecting(false);
    }
  }
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
        <Header phoneNumber={phoneNumber} />
        <SubHeader />
        <View style={styles.otpContainer}>
          <OtpInputs
            style={styles.otpInputsStyle}
            cursorColor={"white"}
            inputContainerStyles={styles.otpInputContainer}
            inputStyles={styles.otpInput}
            focusStyles={styles.otpFocus}
            handleChange={(code) => setOtp(code)}
            numberOfInputs={6}
            autofillFromClipboard={false}
          />
        </View>
      </View>

      <View>
        {isConnecting ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity onPress={() => connect()}>
            <View style={[styles.buttonBase, styles.buttonPrimary]}>
              <Text style={[styles.buttonText, styles.buttonTextWhite]}>
                Next
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
  otpContainer: {
    marginBottom: wp(5),
    marginTop: wp(10),
  },
  otpInputsStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  otpInputContainer: {
    margin: wp(1),
    borderRadius: wp(10),
    alignSelf: "center",
    alignItems: "center",
    width: wp(13),
    height: wp(13),
    borderColor: "#4B69FF",
    borderWidth: 1,
  },
  otpInput: {
    textAlign: "center",
    color: "white",
    fontSize: 25,
    top: 5,
  },
  otpFocus: {
    borderWidth: 1,
    borderColor: "#4B69FF",
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
});
