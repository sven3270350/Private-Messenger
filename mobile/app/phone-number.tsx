import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "@/constants/Colors";
import CountryPicker, { Country, DARK_THEME } from "react-native-country-picker-modal";
import { client } from "@/constants/thirdweb";
import { preAuthenticate } from "thirdweb/wallets/in-app";
import { router } from "expo-router";

const Header = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>Your Phone</Text>
  </View>
);

const SubHeader = () => (
  <View>
    <Text style={styles.headerSubText}>
      Please confirm your country code and enter your phone number.
    </Text>
  </View>
);

export default function PhoneNumber() {
  const [isConnecting, setIsConnecting] = useState(false);

  const [countryModal, setcountryModal] = useState(false);
  const [country, setCountry] = useState<Country>({
    callingCode: ["244"],
    cca2: "AO",
    currency: ["AOA"],
    flag: "flag-ao",
    name: "Angola",
    region: "Africa",
    subregion: "Middle Africa",
  });

  const [phoneNumber, setPhoneNumber] = useState("");

  const sendOTP = async () => {
    if (!phoneNumber) {
      alert("Please enter a phone number");
      return;
    }
    try {
      setIsConnecting(true);
      const formattedPhoneNumber = `+${country.callingCode[0]}${phoneNumber}`;
      const data = await preAuthenticate({
        strategy: "phone",
        phoneNumber: formattedPhoneNumber,
        client,
      });

      setIsConnecting(false);

      router.navigate({
        pathname: `/sms-verification`,
        params: { phoneNumber: formattedPhoneNumber },
      });
    } catch (error) {
      setIsConnecting(false);

      console.error("Error while sending OTP:", error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View>
        <Header />
        <SubHeader />
        <View>
          <TouchableOpacity
            onPress={() => setcountryModal(true)}
            style={styles.countryPickerButton}
          >
            <Text style={styles.countryText}>{(country.name as string)}</Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={25}
              color="white"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <View style={styles.phoneContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>
                +{country.callingCode[0]}
              </Text>
            </View>
            <View style={styles.phoneNumberContainer}>
              <TextInput
                value={phoneNumber}
                onChangeText={(e) => setPhoneNumber(e)}
                placeholder="000 000 0000"
                placeholderTextColor={"#505050"}
                style={styles.phoneNumberTextInput}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>
      </View>

      <View>
        {isConnecting ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity onPress={() => sendOTP()}>
            <View style={[styles.buttonBase, styles.buttonPrimary]}>
              <Text style={[styles.buttonText, styles.buttonTextWhite]}>
                Continue
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      {countryModal && (
        <CountryPicker
          onSelect={(e) => {
            setCountry(e);
            setcountryModal(false);
          }}
          theme={DARK_THEME}
          visible={countryModal}
          onClose={() => setcountryModal(false)} countryCode={"AO"}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: hp(3),
    backgroundColor: Colors.background,
    paddingTop: hp(9),
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
  countryPickerButton: {
    borderWidth: 1,
    borderColor: "#4B69FF",
    marginHorizontal: wp(8),
    marginTop: wp(10),
    borderRadius: wp(5),
    paddingVertical: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countryText: {
    color: "#EBEBEB",
    fontWeight: "400",
    fontSize: 18,
    fontFamily: "WorkSans-Regular",
    marginLeft: wp(5),
  },
  arrowIcon: {
    marginRight: wp(5),
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: wp(8),
  },
  countryCodeContainer: {
    borderWidth: 1,
    borderColor: "#4B69FF",
    marginTop: wp(5),
    borderRadius: wp(5),
    paddingVertical: wp(3),
    width: "20%",
    alignItems: "center",
  },
  countryCodeText: {
    color: "#EBEBEB",
    fontWeight: "400",
    fontSize: 18,
    fontFamily: "WorkSans-Regular",
  },
  phoneNumberContainer: {
    borderWidth: 1,
    borderColor: "#4B69FF",
    borderRadius: wp(5),
    paddingVertical: wp(3),
    width: "75%",
    height: wp(12),
    marginTop: wp(5),
  },
  phoneNumberTextInput: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
    marginLeft: wp(3),
  },
});
