import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
}

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const socketRef = useRef<any>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ 
      title: otherUser?.name?.toUpperCase() || 'NEURAL_LINK',
      headerStyle: { backgroundColor: '#001f3f' },
      headerTintColor: '#00d4ff',
      headerTitleStyle: { fontFamily: 'Orbitron_700Bold', fontSize: 16, letterSpacing: 2 },
    });

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chats/${chatId}/messages`);
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    socketRef.current = io('https://lost-link-server.onrender.com', {
      auth: { token },
    });

    socketRef.current.emit('join-chat', chatId);

    socketRef.current.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-chat', chatId);
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      await api.post(`/chats/${chatId}/messages`, { content: input });
      setInput('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === user?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.otherRow]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.myTime : styles.otherTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#001f3f', '#000000']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>ESTABLISHING SECURE LINK...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#001f3f', '#000000']} style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <BlurView intensity={30} tint="dark" style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="TYPE MESSAGE..."
            placeholderTextColor="#005a7d"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>
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
  messageList: {
    padding: 15,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  otherRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  myBubble: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderBottomRightRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.4)',
  },
  otherBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Rajdhani_500Medium',
    letterSpacing: 0.5,
  },
  myText: {
    color: '#fff',
  },
  otherText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeText: {
    fontSize: 9,
    fontFamily: 'Rajdhani_500Medium',
    marginTop: 4,
    alignSelf: 'flex-end',
    letterSpacing: 0.5,
  },
  myTime: {
    color: 'rgba(0, 212, 255, 0.6)',
  },
  otherTime: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.2)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Rajdhani_500Medium',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendBtn: {
    padding: 5,
  },
});

export default ChatDetailScreen;
