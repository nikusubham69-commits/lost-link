import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

const ItemDetailScreen = ({ route, navigation }: any) => {
  const { itemId } = route.params || {};
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!itemId) {
      Alert.alert('ERROR', 'INVALID ITEM ID');
      navigation.goBack();
      return;
    }

    navigation.setOptions({
      headerStyle: { backgroundColor: '#001f3f' },
      headerTintColor: '#00d4ff',
      headerTitleStyle: { fontFamily: 'Orbitron_700Bold', fontSize: 16, letterSpacing: 2 },
    });

    const fetchItem = async () => {
      try {
        const response = await api.get(`/items/${itemId}`);
        setItem(response.data);
      } catch (err) {
        console.error('Failed to fetch item', err);
        Alert.alert('ERROR', 'FAILED TO LOAD ITEM DETAILS');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleResolve = async () => {
    try {
      await api.patch(`/items/${itemId}/resolve`);
      setItem((prev: any) => ({ ...prev, isResolved: true }));
      Alert.alert('SUCCESS', 'ITEM MARKED AS RESOLVED');
    } catch (err) {
      console.error('Failed to resolve item', err);
      Alert.alert('ERROR', 'FAILED TO UPDATE STATUS');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'DELETE ITEM',
      'ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS ITEM?',
      [
        { text: 'CANCEL', style: 'cancel' },
        { 
          text: 'DELETE', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/items/delete/${itemId}`);
              Alert.alert('DELETED', 'ITEM HAS BEEN REMOVED');
              navigation.goBack();
            } catch (err: any) {
              console.error('Failed to delete item', err);
              Alert.alert('ERROR', err.response?.data?.message || 'FAILED TO DELETE ITEM');
            }
          }
        }
      ]
    );
  };

  const handleStartChat = async () => {
    if (!item || !user || !item.reportedBy?._id) {
      Alert.alert('INFO', "SENDER INFORMATION INCOMPLETE.");
      return;
    }
    
    if (item.reportedBy._id === user.id) {
      Alert.alert('INFO', "COMMUNICATION WITH SELF IS RESTRICTED.");
      return;
    }

    try {
      const response = await api.post('/chats', { 
        itemId: item._id, 
        participantId: item.reportedBy._id 
      });
      navigation.navigate('ChatDetail', { 
        chatId: response.data._id, 
        otherUser: item.reportedBy 
      });
    } catch (err) {
      console.error('Failed to start chat', err);
      Alert.alert('ERROR', 'FAILED TO INITIALIZE NEURAL LINK.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'UNKNOWN';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'UNKNOWN' : d.toLocaleDateString().toUpperCase();
    } catch (e) {
      return 'UNKNOWN';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#001f3f', '#000000']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>EXTRACTING DATA PACKETS...</Text>
      </LinearGradient>
    );
  }

  if (!item) return null;

  return (    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <ScrollView>
        <View style={styles.imageSection}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {item.images && Array.isArray(item.images) && item.images.length > 0 ? (
              item.images.map((img: string, idx: number) => (
                <Image key={idx} source={{ uri: img }} style={styles.image} />
              ))
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={60} color="#005a7d" />
              </View>
            )}
          </ScrollView>
          <BlurView intensity={20} tint="dark" style={styles.imageOverlay}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: (item.status || 'lost') === 'lost' ? 'rgba(255, 0, 102, 0.8)' : 'rgba(57, 255, 20, 0.8)' }
            ]}>
              <Text style={styles.statusText}>{(item.status || 'UNKNOWN').toUpperCase()}</Text>
            </View>
          </BlurView>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{(item.category || 'GENERAL').toUpperCase()}</Text>
          <Text style={styles.title}>{(item.title || 'UNTITLED').toUpperCase()}</Text>
          
          <BlurView intensity={20} tint="dark" style={styles.infoCard}>
            <Text style={styles.description}>{item.description || 'NO DESCRIPTION PROVIDED'}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#00d4ff" />
              <Text style={styles.infoText}>TIMESTAMP: {formatDate(item.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#00d4ff" />
              <Text style={styles.infoText}>ORIGIN: {item.reportedBy?.name?.toUpperCase() || 'UNKNOWN'}</Text>
            </View>
          </BlurView>

          {item.location && item.location.coordinates && Array.isArray(item.location.coordinates) && item.location.coordinates.length >= 2 && (
            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>GEOSPATIAL COORDINATES</Text>
              <View style={styles.mapWrapper}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: Number(item.location.coordinates[1]) || 0,
                    longitude: Number(item.location.coordinates[0]) || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  customMapStyle={darkMapStyle}
                >
                  <Marker
                    coordinate={{
                      latitude: Number(item.location.coordinates[1]) || 0,
                      longitude: Number(item.location.coordinates[0]) || 0,
                    }}
                  >
                    <Ionicons name="location" size={30} color="#ff0066" />
                  </Marker>
                </MapView>
              </View>
            </View>
          )}

          {user?.role === 'admin' && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#ff0066" />
              <Text style={styles.deleteBtnText}>ADMIN: PERMANENTLY DELETE</Text>
            </TouchableOpacity>
          )}

          {user?.role === 'admin' && !item.isResolved && (
            <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
              <Ionicons name="checkmark-done-circle-outline" size={22} color="#39ff14" />
              <Text style={styles.resolveBtnText}>ADMIN: MARK AS RESOLVED</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.chatBtn} onPress={handleStartChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#00d4ff" />
            <Text style={styles.chatBtnText}>INITIALIZE CONTACT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#00d4ff',
    fontFamily: 'Orbitron_400Regular',
    fontSize: 12,
    letterSpacing: 1,
  },
  imageSection: {
    position: 'relative',
  },
  image: {
    width: width,    height: 300,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: 'rgba(0, 90, 125, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 15,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 10,
    color: '#00d4ff',
    fontFamily: 'Rajdhani_700Bold',
    letterSpacing: 2,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 1,
  },
  infoCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    overflow: 'hidden',
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Rajdhani_500Medium',
    lineHeight: 22,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(0, 212, 255, 0.7)',
    fontFamily: 'Rajdhani_700Bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
  mapSection: {
    marginTop: 30,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    color: '#00d4ff',    marginBottom: 15,
    letterSpacing: 1,
  },
  mapWrapper: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  chatBtn: {
    backgroundColor: '#003366',
    borderRadius: 8,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  chatBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
  resolveBtn: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 8,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.4)',
  },
  resolveBtnText: {
    color: '#39ff14',
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 102, 0.1)',
    borderWidth: 1,
    borderColor: '#ff0066',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  deleteBtnText: {
    color: '#ff0066',
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    marginLeft: 10,
    letterSpacing: 1,
  },
});

export default ItemDetailScreen;
