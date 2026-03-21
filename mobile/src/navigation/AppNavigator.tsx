import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PostItemScreen from '../screens/PostItemScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import MyItemsScreen from '../screens/MyItemsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SystemConfigScreen from '../screens/SystemConfigScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const commonHeaderOptions = {
  headerStyle: { backgroundColor: '#001f3f', shadowColor: 'transparent' },
  headerTintColor: '#00d4ff',
  headerTitleStyle: { fontFamily: 'Orbitron_700Bold', fontSize: 16, letterSpacing: 2 },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any;
        if (route.name === 'Lost-Link') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Report Item') iconName = focused ? 'add-circle' : 'add-circle-outline';
        else if (route.name === 'Messages') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarStyle: {
        backgroundColor: '#001f3f',
        borderTopColor: 'rgba(0, 212, 255, 0.3)',
      },
      tabBarActiveTintColor: '#00d4ff',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Lost-Link" component={HomeScreen} />
    <Tab.Screen name="Report Item" component={PostItemScreen} />
    <Tab.Screen name="Messages" component={ChatListScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={commonHeaderOptions}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'ITEM INTEL' }} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="MyItems" component={MyItemsScreen} options={{ title: 'MY REPORTS' }} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'LEADERBOARD' }} />
          <Stack.Screen name="SystemConfig" component={SystemConfigScreen} options={{ title: 'SYSTEM CONFIG' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
