import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useIsFocused } from '@react-navigation/native';
import api from '../api/api';

const MyItemsScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const fetchMyItems = useCallback(async () => {
    try {
      const response = await api.get('/items/my-items');
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch my items', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchMyItems();
    }
  }, [isFocused, fetchMyItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyItems();
  }, [fetchMyItems]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.cardWrapper}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item._id })}
      activeOpacity={0.9}
    >
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
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
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#001f3f', '#000000']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>LOADING YOUR ITEMS...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
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
            <Ionicons name="file-tray-outline" size={60} color="#005a7d" />
            <Text style={styles.emptyText}>YOU HAVE NOT REPORTED ANY ITEMS</Text>
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

export default MyItemsScreen;