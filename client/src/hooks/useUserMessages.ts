import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useMemo } from 'react';

interface Message {
  id: string;
  type: 'welcome' | 'info' | 'notification' | 'admin';
  title: string;
  content: string;
  timestamp?: Date;
  createdAt?: Date;
  isRead: boolean;
  senderAdminEmail?: string | null;
  recipientUserId: string;
}

export function useUserMessages(options?: { refetchInterval?: number }) {
  const { user } = useAuth();
  const enabled = !!user?.uid;

  const { data: messages = [], isLoading, refetch, error } = useQuery<Message[]>({
    queryKey: ['/api/messages', user?.uid],
    enabled,
    refetchInterval: options?.refetchInterval || 30000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!user?.uid) return [];
      
      const response = await fetch(`/api/messages?userId=${user.uid}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.map((msg: any) => ({
        ...msg,
        timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      }));
    },
  });

  const unreadCount = useMemo(() => {
    return messages.filter(msg => !msg.isRead).length;
  }, [messages]);

  const unreadMessages = useMemo(() => {
    return messages.filter(msg => !msg.isRead);
  }, [messages]);

  const unreadAdminMessages = useMemo(() => {
    return messages.filter(msg => !msg.isRead && msg.type === 'admin');
  }, [messages]);

  return {
    messages,
    unreadCount,
    unreadMessages,
    unreadAdminMessages,
    isLoading,
    refetch,
    error,
  };
}
