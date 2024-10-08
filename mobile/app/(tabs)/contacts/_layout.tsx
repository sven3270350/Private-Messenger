import Colors from '@/constants/Colors';
import { Link, router, Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';


const Layout = () => {
  return (
    <Stack initialRouteName='index'>
      <Stack.Screen
        name="index"
        options={{
          title: 'Contacts',
          headerTransparent: true,
          headerTintColor: 'white',
          headerBlurEffect: 'regular',
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 30 }}>
              <Link href={`(tabs)/contacts/new`}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="white" />
                  <Text style={styles.buttonText}>Add</Text>
                </View>
              </Link>
            </View>
          ),
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitle: () => (
            <Text style={styles.headerTitle}>Contacts</Text>
          ),
        }}
      />
      <Stack.Screen
        name='new'
        options={{
          title: 'New Contact',
          headerTransparent: true,
          headerTintColor: 'white',
          headerBlurEffect: 'regular',
          headerTitleAlign: 'center',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <View>
                <Text style={styles.headerLeftText}>Cancel</Text>
              </View>
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitle: () => (
            <TouchableOpacity>
              <Text style={styles.headerTitle}>New Contact</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};
export default Layout;

const styles = StyleSheet.create({
  headerLeftText: {
    color: Colors.secondaryGray,
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
