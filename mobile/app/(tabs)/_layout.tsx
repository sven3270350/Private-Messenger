import { ChatsIcon, ContactsIcon, PhoneIcon, SettingsIcon } from '@/assets/images/tabs';
import Colors from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const TabsLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        initialRouteName='chats'
        backBehavior='history'
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '500',
          },
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 90 : 70,
            borderTopWidth: 0,
          },
          tabBarBackground: () => (
            <BlurView
              // experimentalBlurMethod="dimezisBlurView"
              intensity={100} tint="dark"
              style={{
                ...StyleSheet.absoluteFillObject,
                overflow: 'hidden',
                backgroundColor: 'rgba(50,50,50,0.7)'
              }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="chats"
          options={{
            title: 'Chats',
            tabBarIcon: ({ focused }) => <ChatsIcon fill={focused ? Colors.primary : Colors.gray} />,
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: 'bold',
              marginTop: Platform.OS === "ios" ? 4 : 0,
              marginBottom: Platform.OS === "ios" ? 0 : 10
            },
          }}
        />
        <Tabs.Screen
          name="calls"
          options={{
            title: 'Calls',
            tabBarIcon: ({ focused }) => <PhoneIcon stroke={focused ? Colors.primary : Colors.gray} />,
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: 'bold',
              marginTop: Platform.OS === "ios" ? 4 : 0,
              marginBottom: Platform.OS === "ios" ? 0 : 10
            },
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            headerShown: false,
            tabBarIcon: ({ focused }) => <ContactsIcon stroke={focused ? Colors.primary : Colors.gray} />,
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: 'bold',
              marginTop: Platform.OS === "ios" ? 4 : 0,
              marginBottom: Platform.OS === "ios" ? 0 : 10
            },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <SettingsIcon stroke={focused ? Colors.primary : Colors.gray} />,
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: 'bold',
              marginTop: Platform.OS === "ios" ? 4 : 0,
              marginBottom: Platform.OS === "ios" ? 0 : 10
            },
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};
export default TabsLayout;