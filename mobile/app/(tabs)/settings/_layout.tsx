import Colors from '@/constants/Colors';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link, router, Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerTransparent: true,
          headerTintColor: 'white',
          headerBlurEffect: 'regular',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Link href={{
              pathname: `(tabs)/settings/edit`
            }}>
              <Text style={styles.headerLeftText}>Edit</Text>
            </Link>
          ),
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitle: () => (
            <Text style={styles.headerTitle}>Settings</Text>
          ),
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Settings',
          headerTransparent: true,
          headerTintColor: 'white',
          headerBlurEffect: 'regular',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.headerLeftText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitle: () => (
            <Text style={styles.headerTitle}>Edit Profile</Text>
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
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
