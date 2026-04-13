import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Image, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import api from '../api/api';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\+91[0-9]{10}$/.test(phone);
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('VALIDATION ERROR', 'MOBILE NUMBER MUST START WITH +91 FOLLOWED BY 10 DIGITS');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      Alert.alert('OTP DISPATCHED', 'CHECK YOUR TERMINAL LOGS FOR THE ACCESS CODE (DEMO)');
    } catch (err: any) {
      Alert.alert('TRANSMISSION FAILED', err.response?.data?.message?.toUpperCase() || 'SYSTEM ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('ERROR', 'ACCESS CODE MUST BE 6 DIGITS');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { phone, otp });
      setOtpVerified(true);
      Alert.alert('ACCESS GRANTED', 'PHONE NUMBER VERIFIED. PROCEED TO ESTABLISH IDENTITY.');
    } catch (err: any) {
      Alert.alert('VERIFICATION FAILED', err.response?.data?.message?.toUpperCase() || 'INVALID CODE');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert('ACCESS DENIED', 'PLEASE FILL IN ALL FIELDS');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('VALIDATION ERROR', 'ENTER A VALID TERMINAL EMAIL');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('SECURITY ERROR', 'PASSWORDS DO NOT MATCH');
      return;
    }

    if (!otpVerified) {
      Alert.alert('VERIFICATION REQUIRED', 'PLEASE VERIFY YOUR PHONE VIA OTP FIRST');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, phone });
      Alert.alert('VIRTUAL IDENTITY CREATED', 'PROFILE INITIALIZED SUCCESSFULLY. PROCEED TO AUTH.');
      navigation.navigate('Login');
    } catch (err: any) {
      console.error(err);
      Alert.alert('INITIALIZATION FAILED', err.response?.data?.message?.toUpperCase() || 'SYSTEM ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/GIET_BG.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/GIET.jpeg')} style={styles.logo} />
          <Text style={styles.title}>IDENTITY PORTAL</Text>
          <Text style={styles.statusText}>STATUS: INITIALIZING NEURAL PROFILE</Text>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.glassCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="ENTER YOUR NAME"
              placeholderTextColor="rgba(0, 212, 255, 0.4)"
              value={name}
              onChangeText={setName}
              editable={!otpVerified}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TERMINAL EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="USER@GIET.EDU"
              placeholderTextColor="rgba(0, 212, 255, 0.4)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!otpVerified}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>MOBILE NO (+91)</Text>
            <TextInput
              style={styles.input}
              placeholder="+91XXXXXXXXXX"
              placeholderTextColor="rgba(0, 212, 255, 0.4)"
              value={phone}
              onChangeText={(text) => {
                if (text.startsWith('+91')) {
                  // Only allow digits after +91
                  const digits = text.substring(3).replace(/[^0-9]/g, '');
                  if (digits.length <= 10) {
                    setPhone('+91' + digits);
                  }
                } else if (text === '' || text === '+') {
                  setPhone('+91');
                }
              }}
              keyboardType="phone-pad"
              editable={!otpSent}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSendOtp} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#00d4ff" /> : <Text style={styles.buttonText}>REQUEST ACCESS CODE</Text>}
            </TouchableOpacity>
          ) : !otpVerified ? (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ENTER ACCESS CODE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="6-DIGIT OTP"
                  placeholderTextColor="rgba(0, 212, 255, 0.4)"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.button, { flex: 1, marginRight: 10 }]} 
                  onPress={handleVerifyOtp} 
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#00d4ff" /> : <Text style={styles.buttonText}>VERIFY CODE</Text>}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} 
                  onPress={() => { setOtpSent(false); setOtp(''); }} 
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>EDIT NO.</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>SECURITY ACCESS CODE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="CREATE A PASSWORD"
                  placeholderTextColor="rgba(0, 212, 255, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CONFIRM ACCESS CODE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="RE-ENTER PASSWORD"
                  placeholderTextColor="rgba(0, 212, 255, 0.4)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister} 
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color="#00d4ff" />
                ) : (
                  <Text style={styles.buttonText}>ESTABLISH IDENTITY</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>ALREADY HAVE A PROFILE? AUTHORIZE</Text>
          </TouchableOpacity>
        </BlurView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>AUTHORIZED TERMINAL v2.1.0</Text>
          <Text style={styles.footerSubText}>SECURED LINK ACCESSED FROM SPACE</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  scrollContent: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#00d4ff',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
    color: '#00d4ff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    color: '#39ff14',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 5,
  },
  glassCard: {
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    overflow: 'hidden',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#00d4ff',
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    marginBottom: 5,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Rajdhani_500Medium',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    backgroundColor: '#003366',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    letterSpacing: 1,
    textAlign: 'center'
  },
  linkText: {
    marginTop: 20,
    color: '#00d4ff',
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Rajdhani_500Medium',
    letterSpacing: 1,
    opacity: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontFamily: 'Rajdhani_500Medium',
  },
  footerSubText: {
    color: '#00d4ff',
    fontSize: 8,
    fontFamily: 'Rajdhani_700Bold',
    marginTop: 4,
  },
});

export default RegisterScreen;