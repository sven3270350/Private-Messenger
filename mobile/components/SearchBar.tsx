// SearchBar.js
import React from "react";
import { StyleSheet, TextInput, View, Keyboard, Button } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

type SearchBarProps = {
  searchPhrase: string,
  setSearchPhrase: (value: string) => void,
}

const SearchBar = ({searchPhrase, setSearchPhrase}: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        {/* search Icon */}
        <Feather
          name="search"
          size={wp(5)}
          color='gray'
          style={{ marginLeft: 1 }}
        />
        {/* Input field */}
        <View style={styles.searchBarInner}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.gray}
          placeholder="Search"
          value={searchPhrase}
          onChangeText={setSearchPhrase}
        />
        {/* cross Icon, depending on whether the search bar is clicked or not */}
        <View style={styles.voiceBtn}>
        { searchPhrase==='' ?
          <Feather name="mic" size={wp(5)} color="gray" />
          :
          <Entypo name="cross" size={wp(5)} color="gray" style={{ padding: 1 }} onPress={() => {
            setSearchPhrase("")
          }}/>
        }
        </View>
        </View>
      </View>
      {/* cancel button, depending on whether the search bar is clicked or not */}
    </View>
  );
};
export default SearchBar;

// styles
const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  searchBar: {
    padding: wp(3),
    flex: 1,
    flexDirection: "row",
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "space-between",
    gap: wp(2),
  },
  searchBarInner: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  input: {
    fontSize: 20,
    backgroundColor: 'transparent',
    color: Colors.white,
    paddingRight: wp(6),
    width: "100%",
  },
  voiceBtn: {
    position: "absolute",
    right: 0,
  }
});