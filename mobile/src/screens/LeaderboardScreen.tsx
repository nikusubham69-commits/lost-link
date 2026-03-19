import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import api from '../api/api';

const LeaderboardScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await api.get('/users/leaderboard');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const renderRank = (rank: number) => {
    if (rank === 1) return <Ionicons name="trophy" size={24} color="#FFD700" />;
    if (rank === 2) return <Ionicons name="trophy" size={24} color="#C0C0C0" />;
    if (rank === 3) return <Ionicons name="trophy" size={24} color="#CD7F32" />;
    return <Text style={styles.rankNumber}>{rank}</Text>;
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <BlurView intensity={20} tint="dark" style={styles.userCard}>
      <View style={styles.rankContainer}>{renderRank(index + 1)}</View>
      <View style={styles.avatarContainer}>
        {item.profilePic ? (
          <Image source={{ uri: item.profilePic }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Ionicons name="person" size={24} color="#00d4ff" />
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{(item.name || 'UNKNOWN').toUpperCase()}</Text>
        <Text style={styles.userEmail}>{item.email || 'N/A'}</Text>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={styles.points}>{item.points}</Text>
        <Text style={styles.pointsLabel}>POINTS</Text>
      </View>
    </BlurView>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#001f3f', '#000000']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>CALCULATING RANKINGS...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
        }
        contentContainerStyle={styles.listContent}
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    overflow: 'hidden',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankNumber: {
    fontSize: 18,
    fontFamily: 'Orbitron_700Bold',
    color: '#00d4ff',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 10,
    fontFamily: 'Rajdhani_500Medium',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  points: {
    fontSize: 22,
    fontFamily: 'Orbitron_700Bold',
    color: '#39ff14',
  },
  pointsLabel: {
    fontSize: 8,
    fontFamily: 'Rajdhani_700Bold',
    color: '#39ff14',
    letterSpacing: 1,
  },
});

export default LeaderboardScreen;