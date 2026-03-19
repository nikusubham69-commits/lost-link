import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

interface Chat {
  _id: string;
  participants: any[];
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  item?: {
    title: string;
  };
}

const ChatListScreen = ({ navigation }: any) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (err) {
      console.error('Failed to fetch chats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, []);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p._id !== user?.id);
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherUser = getOtherParticipant(item);
    
    return (
      <TouchableOpacity 
        style={styles.chatCardWrapper}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item._id, otherUser })}
      >
        <BlurView intensity={20} tint="dark" style={styles.chatCard}>
          <View style={styles.avatarContainer}>
            {otherUser?.profilePic ? (
              <Image source={{ uri: otherUser.profilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="person" size={24} color="#00d4ff" />
              </View>
            )}
            <View style={styles.onlineStatus} />
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{otherUser?.name?.toUpperCase() || 'UNKNOWN USER'}</Text>
              {item.lastMessage && (
                <Text style={styles.timeText}>
                  {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
            
            <Text style={styles.itemRef}>RE: {item.item?.title?.toUpperCase() || 'NEURAL OBJECT'}</Text>
            <Text style={styles.lastMsg} numberOfLines={1}>
              {item.lastMessage?.content || 'NO RECENT TRANSMISSIONS'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(0, 212, 255, 0.3)" />
        </BlurView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#001f3f', '#000000']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>SYNCING NEURAL CHANNELS...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEURAL CHAT</Text>
        <Text style={styles.headerSubtitle}>SECURE ENCRYPTED CHANNELS</Text>
      </View>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#005a7d" />
            <Text style={styles.emptyText}>NO ACTIVE TRANSMISSIONS</Text>
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
  chatCardWrapper: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  chatCard: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
    position: 'relative',
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
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#39ff14',
    borderWidth: 2,
    borderColor: '#001f3f',
  },
  chatInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    color: '#fff',
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'Rajdhani_500Medium',
    color: 'rgba(0, 212, 255, 0.6)',
  },
  itemRef: {
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    color: '#00d4ff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  lastMsg: {
    fontSize: 12,
    fontFamily: 'Rajdhani_500Medium',
    color: 'rgba(255, 255, 255, 0.6)',
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

export default ChatListScreen;
