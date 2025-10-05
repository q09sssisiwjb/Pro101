import { useEffect, useRef } from 'react';
import HeroSlider from '@/components/HeroSlider';
import ToolsSection from '@/components/ToolsSection';
import CommunityGallery from '@/components/CommunityGallery';
import { useUserMessages } from '@/hooks/useUserMessages';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { unreadAdminMessages, isLoading } = useUserMessages();
  const lastNotifiedMessageId = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    lastNotifiedMessageId.current = null;
    hasInitialized.current = false;
  }, [user?.uid]);

  useEffect(() => {
    if (!user || isLoading) return;

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      if (unreadAdminMessages.length > 0) {
        const sortedMessages = [...unreadAdminMessages].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        lastNotifiedMessageId.current = sortedMessages[0].id;
      }
      return;
    }

    if (unreadAdminMessages.length === 0) {
      lastNotifiedMessageId.current = null;
      return;
    }

    const sortedMessages = [...unreadAdminMessages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const newestUnreadAdminMessage = sortedMessages[0];

    if (newestUnreadAdminMessage && newestUnreadAdminMessage.id !== lastNotifiedMessageId.current) {
      lastNotifiedMessageId.current = newestUnreadAdminMessage.id;
      
      toast({
        title: "New Message",
        description: "Admin sent you a message",
        variant: "default",
      });
    }
  }, [unreadAdminMessages, user, toast, isLoading]);

  return (
    <main className="flex-1" data-testid="home-page">
      <HeroSlider />
      <ToolsSection />
      <CommunityGallery />
    </main>
  );
};

export default Home;
