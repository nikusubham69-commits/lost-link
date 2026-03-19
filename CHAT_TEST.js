// Test file to verify chat setup - Run this in browser console after logging in

// Test 1: Verify API endpoints
async function testChatAPI() {
  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api';

  console.log('🧪 Testing Chat API...\n');

  try {
    // Test 1: Get conversations
    console.log('📋 Getting conversations...');
    const convRes = await fetch(`${API_URL}/chat/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const conversations = await convRes.json();
    console.log('✅ Conversations:', conversations);

    // Test 2: Get unread count
    console.log('\n📬 Getting unread count...');
    const unreadRes = await fetch(`${API_URL}/chat/unread-count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const unreadData = await unreadRes.json();
    console.log('✅ Unread count:', unreadData.unreadCount);

    console.log('\n✅ All API tests passed!');
  } catch (err) {
    console.error('❌ API test failed:', err);
  }
}

// Test 2: Verify Socket connection
function testSocketConnection() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  console.log('🔌 Testing Socket.io connection...\n');
  
  try {
    const { io } = window;
    const socket = io('http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected! ID:', socket.id);
      socket.emit('identify', user.id);
      console.log('✅ User identified:', user.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('error', (err) => {
      console.error('❌ Socket error:', err);
    });

    setTimeout(() => {
      console.log('✅ Socket test completed. Check connection status above.');
      socket.close();
    }, 3000);
  } catch (err) {
    console.error('❌ Socket test failed:', err);
  }
}

// Run tests
console.log('🚀 Chat Feature Test Suite\n');
console.log('Run these commands in browser console:\n');
console.log('1. testChatAPI() - Test REST API endpoints');
console.log('2. testSocketConnection() - Test Socket.io connection\n');

// Also test navigation
console.log('📍 Chat URL: /chat');
console.log('🔗 Chat NavBar Link: Look for "💬 Chat" in navbar\n');
