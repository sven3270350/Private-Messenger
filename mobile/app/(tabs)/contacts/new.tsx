import { View, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { useHeaderHeight } from '@react-navigation/elements';
import {
  widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Entypo } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { toast } from '@backpackapp-io/react-native-toast';
import { addContact } from '@/lib/api';

const Page = () => {
	const navigation = useNavigation()
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	// const [phoneNumber, setPhoneNumber] = useState('')
	const [wallet, setWallet] = useState('')
	const headerHeight = useHeaderHeight();

	const handleContactCreate = useCallback(async () => {
		if(firstName==='' || wallet==='') {
			toast.error("Invalid input")
			return
		}
		await toast.promise(
			addContact(firstName, wallet, lastName),
			{
				loading: 'Adding...',
				success: (data: any) => !!data ? "Successfully added new contact" : "Adding contact failed",
				error: (err) => err.toString()
			}
		)
		router.back()
	}, [firstName, lastName, wallet])

	useEffect(() => {
		navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleContactCreate}>
					<View>
						<Text style={styles.headerRightText}>Create</Text>
					</View>
				</TouchableOpacity>
      ),
    });
	}, [navigation, handleContactCreate])

	return (
		<View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: headerHeight + 16, paddingHorizontal: 16 }}>
			<View style={styles.inputContainer}>
				<TextInput
					value={firstName}
					onChangeText={(e) => setFirstName(e)}
					placeholder="First Name"
					placeholderTextColor={"#505050"}
					style={styles.textInput}
				/>
			</View>
			<View style={styles.inputContainer}>
				<TextInput
					value={lastName}
					onChangeText={(e) => setLastName(e)}
					placeholder="Last Name"
					placeholderTextColor={"#505050"}
					style={styles.textInput}
				/>
			</View>
			{/* <Text style={styles.phoneNumberLabel}>Phone Number</Text>
			<View style={styles.inputContainer}>
				<Entypo name="plus" size={16} color="white" />
				<TextInput
					value={phoneNumber}
					onChangeText={(e) => setPhoneNumber(e)}
					style={styles.textInput}
					keyboardType="number-pad"
				/>
			</View> */}
			<Text style={styles.phoneNumberLabel}>Wallet Address</Text>
			<View style={styles.inputContainer}>
				<TextInput
					value={wallet}
					onChangeText={(e) => setWallet(e)}
					style={styles.textInput}
				/>
			</View>
		</View>
	);
};

export default Page;

const styles = StyleSheet.create({
  headerRightText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
	inputContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: Colors.primary,
		borderRadius: 100,
		padding: wp(3),
		height: hp(7),
		marginVertical: hp(1),
	},
	textInput: {
		color: "white",
		fontSize: 18,
		fontWeight: "400",
		width: "100%",
		marginLeft: wp(1),
	},
	phoneNumberLabel: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
		marginLeft: wp(5),
		marginTop: wp(1),
	}
});