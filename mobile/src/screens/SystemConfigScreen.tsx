import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';

const SystemConfigScreen = ({ navigation }: any) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const { logout } = useAuth();

  const handleClearCache = async () => {
    Alert.alert(
      'PURGE LOCAL DATA',
      'This will clear your local session and requires re-authorization. Proceed?',
      [
        { text: 'ABORT', style: 'cancel' },
        { 
          text: 'PURGE', 
          style: 'destructive', 
          onPress: async () => {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            await logout();
          } 
        },
      ]
    );
  };

  const renderSettingItem = (icon: any, label: string, value: any, onValueChange?: any, isSwitch = false) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color="#00d4ff" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#001f3f', true: 'rgba(0, 212, 255, 0.5)' }}
          thumbColor={value ? '#00d4ff' : '#005a7d'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="rgba(0, 212, 255, 0.3)" />
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>CORE SETTINGS</Text>
        <BlurView intensity={20} tint="dark" style={styles.card}>
          {renderSettingItem('notifications-outline', 'PUSH NOTIFICATIONS', notificationsEnabled, setNotificationsEnabled, true)}
          <View style={styles.divider} />
          {renderSettingItem('finger-print-outline', 'HAPTIC FEEDBACK', hapticFeedback, setHapticFeedback, true)}
        </BlurView>

        <Text style={styles.sectionTitle}>NEURAL INTERFACE</Text>
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={22} color="#00d4ff" />
              <Text style={styles.settingLabel}>THEME: CYBER_DARK (ACTIVE)</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={22} color="#00d4ff" />
              <Text style={styles.settingLabel}>LANGUAGE: ENGLISH (US)</Text>
            </View>
          </TouchableOpacity>
        </BlurView>

        <Text style={styles.sectionTitle}>SYSTEM UTILITIES</Text>
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color="#ff0066" />
              <Text style={[styles.settingLabel, { color: '#ff0066' }]}>PURGE CACHE & RESET</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="pulse-outline" size={22} color="#39ff14" />
              <Text style={styles.settingLabel}>SERVER STATUS: OPERATIONAL</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
        </BlurView>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>LOST-LINK MOBILE v2.1.0</Text>
          <Text style={styles.versionSubText}>BUILD ID: 0b6b66d-prod</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Orbitron_700Bold',
    color: 'rgba(0, 212, 255, 0.6)',
    marginBottom: 10,
    marginLeft: 10,
    letterSpacing: 2,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    overflow: 'hidden',
    marginBottom: 25,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 12,
    fontFamily: 'Rajdhani_700Bold',
    color: '#fff',
    marginLeft: 15,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#39ff14',
    shadowColor: '#39ff14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
  },
  versionSubText: {
    fontSize: 8,
    fontFamily: 'Rajdhani_500Medium',
    color: 'rgba(0, 212, 255, 0.3)',
    marginTop: 4,
  },
});

export default SystemConfigScreen;