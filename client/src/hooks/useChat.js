import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useChat = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const currentUser = JSON.parse(localStorage.getItem('user'));
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            
            // Identify user to socket server
            if (currentUser) {
                newSocket.emit('identify', currentUser.id);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return { socket, isConnected };
};

export default useChat;
