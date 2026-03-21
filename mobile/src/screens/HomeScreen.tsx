import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useIsFocused } from '@react-navigation/native';
import { io } from 'socket.io-client';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface Item {
  _id: string;
  title: string;
  description: string;
  status: 'lost' | 'found';
  images: string[];
  category: string;
  date: string;
}

const HomeScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const { token, user } = useAuth();

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchItems();
    }
  }, [isFocused, fetchItems]);

  useEffect(() => {
    if (!token) return;

    const socket = io('https://lost-link-server.onrender.com', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Real-time connection established on Home');
    });

    socket.on('new-item', (newItem: any) => {
      console.log('New item received from server', newItem);
      
      // Update list
      setItems(prevItems => [newItem, ...prevItems]);

      // Show global notification if not posted by current user
      const isMine = user && newItem.postedBy && (newItem.postedBy._id === user.id || newItem.postedBy === user.id);
      
      if (!isMine) {
        Alert.alert(
          '🚨 NEW BROADCAST',
          `A new ${newItem.category.toUpperCase()} has been ${newItem.type.toUpperCase()} in the sector: ${newItem.title.toUpperCase()}`,
          [
            { text: 'DISMISS', style: 'cancel' },
            { text: 'VIEW INTEL', onPress: () => navigation.navigate('ItemDetail', { itemId: newItem._id }) }
          ]
        );
      }
    });

    socket.on('disconnect', () => {
      console.log('Real-time connection lost');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, [fetchItems]);

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={styles.cardWrapper}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item._id })}
      activeOpacity={0.9}
    >
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color="#005a7d" />
            </View>
          )}
          <View style={[
            styles.statusBadge, 
            { backgroundColor: (item.status || 'lost') === 'lost' ? 'rgba(255, 0, 102, 0.8)' : 'rgba(57, 255, 20, 0.8)' }
          ]}>
            <Text style={styles.statusText}>{(item.status || 'UNKNOWN').toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.categoryText}>{(item.category || 'GENERAL').toUpperCase()}</Text>
          <Text style={styles.title} numberOfLines={1}>{(item.title || 'UNTITLED').toUpperCase()}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description || 'No description provided.'}</Text>
          <View style={styles.footer}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color="#00d4ff" />
              <Text style={styles.dateText}>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</Text>
            </View>
            <View style={styles.actionBtn}>
              <Text style={styles.actionText}>VIEW DATA</Text>
              <Ionicons name="chevron-forward" size={14} color="#00d4ff" />
            </View>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#001f3f', '#000000']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>SCANNING NEURAL GRID...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEURAL FEED</Text>
        <Text style={styles.headerSubtitle}>GLOBAL DATA TRANSMISSION</Text>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#005a7d" />
            <Text style={styles.emptyText}>NO DATA DETECTED IN GRID</Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
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
  listContent: {
    padding: 15,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  card: {
    flexDirection: 'row',
    height: 140,
  },
  imageContainer: {
    width: 120,
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: 'rgba(0, 90, 125, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: 'Rajdhani_700Bold',
    letterSpacing: 1,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 9,
    color: '#00d4ff',
    fontFamily: 'Rajdhani_700Bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Orbitron_700Bold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Rajdhani_500Medium',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(0, 212, 255, 0.7)',
    fontFamily: 'Rajdhani_500Medium',
    marginLeft: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 9,
    color: '#00d4ff',
    fontFamily: 'Orbitron_700Bold',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 20,
    color: '#005a7d',
    fontFamily: 'Orbitron_400Regular',
    fontSize: 14,
    letterSpacing: 2,
  },
});

export default HomeScreen;
