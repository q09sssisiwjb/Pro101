import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Trash2, CheckCircle, Bell } from "lucide-react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Message {
  id: string;
  type: 'welcome' | 'info' | 'notification' | 'admin';
  title: string;
  content: string;
  timestamp?: Date;
  createdAt?: Date;
  isRead: boolean;
  senderAdminEmail?: string | null;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch messages from API
  const { data: apiMessages = [], isLoading, refetch } = useQuery<Message[]>({
    queryKey: ['/api/messages', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const response = await fetch(`/api/messages?userId=${user?.uid}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.map((msg: any) => ({
        ...msg,
        timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      }));
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("PATCH", `/api/messages/${messageId}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', user?.uid] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("DELETE", `/api/messages/${messageId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', user?.uid] });
      toast({
        title: "Message deleted",
        description: "The message has been removed.",
      });
    },
  });

  const markAsRead = (messageId: string) => {
    markAsReadMutation.mutate(messageId);
  };

  const deleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate(messageId);
  };

  const markAllAsRead = () => {
    apiMessages.filter(msg => !msg.isRead).forEach(msg => {
      markAsReadMutation.mutate(msg.id);
    });
  };

  const messages = apiMessages;
  const unreadCount = messages.filter(msg => !msg.isRead).length;


  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getMessageBadgeColor = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'notification':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'admin':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 via-background to-primary/10 border-primary/20 mt-8">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Visionary AI Messages</h3>
              <p className="text-muted-foreground mb-4">
                Sign up or log in to receive personalized welcome messages, notifications, and updates about your creative journey.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode: 'login' } }))}>
                  Log In
                </Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode: 'signup' } }))}>
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Messages</h1>
                <p className="text-muted-foreground">
                  Stay updated with your latest notifications and updates
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {unreadCount} unread
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                  data-testid="button-mark-all-read"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 && user && (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  When you receive notifications or updates, they'll appear here.
                </p>
              </CardContent>
            </Card>
          )}
          
          {messages.length > 0 && messages.map((message) => (
            <Card 
              key={message.id} 
              className={`bg-card/50 backdrop-blur border-border/50 transition-all duration-200 ${
                !message.isRead ? 'border-primary/30 bg-primary/5' : ''
              }`}
              data-testid={`message-${message.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getMessageIcon(message.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate">{message.title}</CardTitle>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getMessageBadgeColor(message.type)}`}
                        >
                          {message.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {message.timestamp.toLocaleDateString()} at {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!message.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(message.id)}
                        data-testid={`button-mark-read-${message.id}`}
                        className="flex-shrink-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      data-testid={`button-delete-${message.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-foreground leading-relaxed">{message.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;