import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';

const PostItemScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'lost' | 'found'>('lost');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('PERMISSION DENIED', 'WE NEED PERMISSION TO ACCESS YOUR GALLERY');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      setImages([...images, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      Alert.alert('ACCESS DENIED', 'PLEASE FILL IN ALL REQUIRED FIELDS');
      return;
    }

    setLoading(true);
    try {
      let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      
      let latitude = 0;
      let longitude = 0;

      if (locStatus === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
        } catch (e) {
          console.log('Could not get precise location, using defaults');
        }
      }
      
      const payload = {
        title,
        description,
        status,
        category,
        images,
        latitude,
        longitude,
      };

      const response = await api.post('/items', payload);
      Alert.alert('SUCCESS', 'ITEM REPORTED SUCCESSFULLY!');
      navigation.navigate('ItemDetail', { itemId: response.data._id });
    } catch (err: any) {
      console.error('Report Error:', err);
      const msg = err.response?.data?.message || 'SERVER ERROR. IMAGE MIGHT BE TOO LARGE.';
      Alert.alert('ERROR', msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.headerTitle}>INITIALIZE REPORT</Text>
            <Text style={styles.headerSubtitle}>DATA UPLOAD TO NEURAL GRID</Text>
          </View>
          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <Text style={styles.label}>TRANSMISSION STATUS</Text>
            <View style={styles.statusToggle}>
              <TouchableOpacity 
                style={[styles.toggleBtn, status === 'lost' && styles.activeToggle]} 
                onPress={() => setStatus('lost')}
              >
                <Text style={[styles.toggleText, status === 'lost' && styles.activeText]}>LOST</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, status === 'found' && styles.activeToggle]} 
                onPress={() => setStatus('found')}
              >
                <Text style={[styles.toggleText, status === 'found' && styles.activeText]}>FOUND</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>OBJECT IDENTIFIER</Text>
            <TextInput
              style={styles.input}
              placeholder="E.G. QUANTUM CORE, NEURAL LINK"
              placeholderTextColor="#005a7d"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>DATA DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="INPUT DETAILED COORDINATES AND DESCRIPTION"
              placeholderTextColor="#005a7d"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>CATEGORY TAG</Text>
            <TextInput
              style={styles.input}
              placeholder="E.G. ELECTRONICS, KEYS"
              placeholderTextColor="#005a7d"
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.imageSection}>
              <Text style={styles.label}>VISUAL DATA CAPTURE</Text>
              <View style={styles.imageList}>
                {images.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={styles.thumbnail} />
                ))}
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                  <Ionicons name="camera-outline" size={32} color="#00d4ff" />
                  <Text style={styles.addText}>SCAN IMAGE</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#00d4ff" />
              ) : (
                <Text style={styles.submitText}>INITIALIZE REPORT</Text>
              )}
            </TouchableOpacity>
          </BlurView>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    paddingBottom: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
    color: '#00d4ff',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    color: '#39ff14',
    letterSpacing: 1,
  },
  glassCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    overflow: 'hidden',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    color: '#00d4ff',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  statusToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    color: '#00d4ff',
    letterSpacing: 1,
  },
  activeText: {
    color: '#fff',
    textShadowColor: '#00d4ff',
    textShadowRadius: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.5)',
    paddingVertical: 12,
    marginBottom: 25,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Rajdhani_500Medium',
    letterSpacing: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 8,
    color: '#00d4ff',
    fontFamily: 'Rajdhani_700Bold',
    marginTop: 5,
  },
  submitBtn: {
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
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    letterSpacing: 1,
  },
});

export default PostItemScreen;
