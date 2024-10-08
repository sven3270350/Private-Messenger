import Colors from '@/constants/Colors';
import { Link, router, Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Chats',
          headerTransparent: true,
          headerTintColor: 'white',
          headerBlurEffect: 'regular',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity>
              <View>
                <Text style={styles.headerLeftText}>Edit</Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 30 }}>
              <Link href={`(tabs)/chats/new`}>
                <View style={styles.button}>
                  <AntDesign name="plus" size={18} color="white" />
                  <Text style={styles.buttonText}>New</Text>
                </View>
              </Link>
            </View>
          ),
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitle: () => (
            <TouchableOpacity>
              <Text style={styles.headerTitle}>Chats</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name='new'
        options={{
          title: 'New Chats',
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
              <Text style={styles.headerTitle}>New Chat</Text>
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
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
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
