import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "@/constants/Colors";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "expo-router";

const Page: React.FC = () => {
  const headerHeight = useHeaderHeight();
	const navigation = useNavigation()

	useEffect(() => {
		navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity>
          <Text style={styles.headerRightText}>Done</Text>
				</TouchableOpacity>
      ),
    });
	}, [navigation])

  return (
    <View style={[styles.container, {paddingTop: headerHeight + hp(2)}]}>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: wp(4)
  },
  headerRightText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '500',
  },
});

export default Page;
