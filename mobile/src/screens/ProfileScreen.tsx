import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'LOGOUT SEQUENCE',
      'Are you sure you want to terminate the current session?',
      [
        { text: 'ABORT', style: 'cancel' },
        { text: 'TERMINATE', onPress: async () => await logout(), style: 'destructive' },
      ]
    );
  };

  if (!user) return null;

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          {user.profilePic ? (
            <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
          ) : (
            <View style={styles.placeholderPic}>
              <Ionicons name="person" size={50} color="#00d4ff" />
            </View>
          )}
          <View style={styles.onlineBadge} />
        </View>
        <Text style={styles.name}>{(user.name || 'UNKNOWN').toUpperCase()}</Text>
        <Text style={styles.email}>{(user.email || 'N/A').toUpperCase()}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{(user.role || 'USER').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <BlurView intensity={20} tint="dark" style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyItems')}>
            <Ionicons name="file-tray-full-outline" size={22} color="#00d4ff" />
            <Text style={styles.menuText}>MY REPORTED ITEMS</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(0, 212, 255, 0.3)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Leaderboard')}>
            <Ionicons name="trophy-outline" size={22} color="#00d4ff" />
            <Text style={styles.menuText}>LEADERBOARD</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(0, 212, 255, 0.3)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Chats')}>
            <Ionicons name="chatbubbles-outline" size={22} color="#00d4ff" />
            <Text style={styles.menuText}>NEURAL CHAT</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(0, 212, 255, 0.3)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={22} color="#00d4ff" />
            <Text style={styles.menuText}>SYSTEM CONFIG</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(0, 212, 255, 0.3)" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ff0066" />
            <Text style={[styles.menuText, styles.logoutText]}>TERMINATE SESSION</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  placeholderPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.5)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#39ff14',
    borderWidth: 2,
    borderColor: '#001f3f',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Orbitron_700Bold',
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 2,
  },
  email: {
    fontSize: 12,
    fontFamily: 'Rajdhani_500Medium',
    color: 'rgba(0, 212, 255, 0.6)',
    marginBottom: 15,
    letterSpacing: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  roleText: {
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    color: '#00d4ff',
    letterSpacing: 1,
  },
  menu: {
    padding: 20,
  },
  menuCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.1)',
  },
  menuText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 15,
    color: '#fff',
    fontFamily: 'Rajdhani_700Bold',
    letterSpacing: 1.5,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff0066',
  },
});

export default ProfileScreen;
