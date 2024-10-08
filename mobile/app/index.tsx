import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, Redirect, router } from "expo-router";
import { SimpleLineIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useConnect } from "thirdweb/react";
import Colors from "@/constants/Colors";
import { inAppWallet } from "thirdweb/wallets/in-app";
import { chain, client } from "@/constants/thirdweb";
import { createWallet, InAppWalletSocialAuth } from "thirdweb/wallets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { checkWallet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const Header = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>Let’s get you</Text>
    <Text style={styles.headerText}>Started</Text>
  </View>
);

const SubHeader = () => (
  <View>
    <Text style={styles.headerSubText}>
      In order to use the app please sign in via your phone number or login with
      your google account.
    </Text>
  </View>
);

export default function HomeScreen() {
  const { token, wallet } = useAuth();
  if(token && wallet) {
    return <Redirect href="(tabs)/chats" />;
  }

  return (
    <View style={styles.mainContainer}>
      <View>
        <Header />
        <SubHeader />
      </View>

      <View style={styles.imageContainer}>
        <Image
          style={styles.mainImage}
          source={require("../assets/images/wallet-coin-main.png")}
        />
      </View>

      <View style={{gap: wp(3)}}>
        <Link href={"/phone-number"} replace asChild>
          <TouchableOpacity>
            <View style={[styles.buttonBase, styles.buttonPrimary]}>
              <SimpleLineIcons name="phone" size={24} color="white" />
              <Text style={[styles.buttonText, styles.buttonTextWhite]}>
                Sign In Via Phone Number
              </Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* <ConnectWithSocial key={"google"} auth={"google"} /> */}

        <ConnectWithMetaMask />
      </View>
    </View>
  );
}

function ConnectWithSocial(props: { auth: InAppWalletSocialAuth }) {
  const router = useRouter();
  const { connect, isConnecting } = useConnect();
  const strategy = props.auth;
  const connectInAppWallet = async () => {
    await connect(async () => {
      const wallet = inAppWallet({
        smartAccount: {
          chain,
          sponsorGas: true,
        },
      });

      await wallet.connect({
        client,
        strategy,
        redirectUrl: "com.onchain.messenger://",
      });

      return wallet;
    }).then(wallet => async () => {
      if (!wallet) return;
      const account = wallet.getAccount();
      if (!account) return;
      const userExist = await checkWallet(account.address);
      if (userExist?.data.token) {
        router.push(`/(tabs)/chats`);
        await AsyncStorage.setItem("pm-token", userExist?.data.token);
      } else {
        router.navigate(`/user-name`);
      }
    });
  };

  return (
    <View>
      {isConnecting ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity
          style={[styles.buttonBase, styles.transparent]}
          key={strategy}
          onPress={connectInAppWallet}
          disabled={isConnecting}
        >
          <Text style={styles.buttonText}>Google Login</Text>
          <Image
            source={getSocialIcon(strategy)}
            style={{
              width: 25,
              height: 25,
              resizeMode: "contain",
            }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const ConnectWithMetaMask = () => {
  const router = useRouter();
	const { connect, isConnecting } = useConnect()
  const { setAuth } = useAuth()
  const connectExternalWallet = async () => {
    const wallet = await connect(async () => {
      const wallet = createWallet('io.metamask');
      try {
        await wallet.connect({
          client,
        });
      } catch (error) {
        return wallet;
      }
      return wallet;
    })
    const account = wallet?.getAccount();
    if (!account) return;
    await AsyncStorage.setItem("pm-wallet", account.address);
    setAuth({wallet: account.address});
    const userExist = await checkWallet(account.address);
    if (userExist?.data.token) {
      router.push(`/(tabs)/chats`);
      await AsyncStorage.setItem("pm-token", userExist?.data.token);
      setAuth({token: userExist?.data.token});
    } else {
      router.navigate(`/user-name`);
    }
  };
	return (
    <View>
      <TouchableOpacity
        style={[styles.buttonBase, styles.transparent, {backgroundColor: 'transparent', borderColor: Colors.primary, borderWidth: 2}]}
        key={'io.metamask'}
        onPress={connectExternalWallet}
        disabled={isConnecting}
      >
        {isConnecting? 
        <>
          <ActivityIndicator animating={isConnecting} color={"white"}/>
          <Text style={[styles.buttonText, {color: "white"}]}>Connecting...</Text>
        </>:
        <>
          <Text style={[styles.buttonText, {color: "white"}]}>Connect with MetaMask</Text>
          <Image
            source={require("@/assets/images/metamask.png")}
            style={{
              width: 25,
              height: 25,
              resizeMode: "contain",
            }}
          />
        </>
        }
      </TouchableOpacity>
    </View>
	);
};

function getSocialIcon(strategy: string) {
  switch (strategy) {
    case "google":
      return require("@/assets/images/google.png");
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: hp(9),
    backgroundColor: Colors.background,
  },
  transparent: {
    backgroundColor: Colors.white,
    height: 60,
    borderRadius: 60,
  },
  headerContainer: {
    alignItems: "center",
  },
  headerText: {
    color: Colors.primary,
    fontSize: 32,
    textAlign: "center",
    fontFamily: "WorkSans-Bold",
  },
  headerSubText: {
    color: Colors.white,
    textAlign: "center",
    fontSize: 18,
    paddingTop: hp(1.5),
    paddingHorizontal: wp(4),
    fontFamily: "WorkSans-Regular",
  },
  imageContainer: {
    alignItems: "center",
  },
  mainImage: {
    width: wp(70),
    height: wp(70),
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
    height: 60,
    borderRadius: 60,
  },
  buttonWhite: {
    height: 60,
    borderRadius: 30,
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
