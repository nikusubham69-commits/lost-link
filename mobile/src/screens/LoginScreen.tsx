import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Dimensions, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const { width, height } = Dimensions.get('window');

const makeCaptcha = () => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return {
    question: `SOLVE TO VERIFY: ${a} + ${b} = ?`,
    answer: String(a + b)
  };
};

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(makeCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    setCaptcha(makeCaptcha());
    setCaptchaInput('');
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('ACCESS DENIED', 'PLEASE FILL IN ALL FIELDS');
      return;
    }

    if (captchaInput.trim() !== captcha.answer) {
      Alert.alert('HUMAN VERIFICATION FAILED', 'CAPTCHA INCORRECT. TRY AGAIN.');
      setCaptcha(makeCaptcha());
      setCaptchaInput('');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      Alert.alert('VIRTUAL IDENTITY VERIFIED', `WELCOME BACK, ${(user.name || 'USER').toUpperCase()}`);
      await login(token, user);
    } catch (err: any) {
      console.error('Login Error:', err);
      let errorMsg = 'SYSTEM ERROR: UNKNOWN FAILURE';
      
      if (!err.response) {
        errorMsg = 'COMMUNICATION ERROR: CANNOT REACH SERVER';
      } else if (err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message.toUpperCase();
      }
      
      Alert.alert('ACCESS DENIED', errorMsg);
      setCaptcha(makeCaptcha());
      setCaptchaInput('');
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
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/GIET.jpeg')} style={styles.logo} />
          <Text style={styles.title}>SYSTEM AUTH</Text>
          <Text style={styles.statusText}>STATUS: ENCRYPTION ACTIVE</Text>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.glassCard}>
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ACCESS CODE</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(0, 212, 255, 0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CAPTCHA VERIFICATION</Text>
            <Text style={styles.captchaQuestion}>{captcha.question}</Text>
            <TextInput
              style={styles.input}
              placeholder="TYPE ANSWER HERE"
              placeholderTextColor="rgba(0, 212, 255, 0.4)"
              value={captchaInput}
              onChangeText={setCaptchaInput}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin} 
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#00d4ff" />
            ) : (
              <Text style={styles.buttonText}>ESTABLISH CONNECTION</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>NEW USER? INITIALIZE ACCOUNT</Text>
          </TouchableOpacity>
        </BlurView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>AUTHORIZED TERMINAL v2.0.56</Text>
          <Text style={styles.footerSubText}>SECURED LINK ACCESSED FROM SPACE</Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
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
  captchaQuestion: {
    color: '#39ff14',
    fontSize: 12,
    fontFamily: 'Rajdhani_500Medium',
    marginBottom: 5,
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
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    letterSpacing: 1,
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

export default LoginScreen;
