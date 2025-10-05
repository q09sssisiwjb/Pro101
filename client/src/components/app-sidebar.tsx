import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "wouter";
import {
  Home,
  BookOpen,
  LogOut,
  User,
  Settings,
  Heart,
  Wand2,
  MessageCircle,
  Headphones,
  Image,
  Zap,
  Eraser,
  RefreshCw,
  PenTool,
  Palette,
  Shield,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { User as FirebaseUser } from "firebase/auth";
import { useQuery } from "@tanstack/react-query";
import { useUserMessages } from "@/hooks/useUserMessages";

const navigation = [
  { title: "Home", url: "/", icon: Home },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "My Art Style", url: "/my-art-style", icon: Palette },
  { title: "Art Styles", url: "/art-styles", icon: Wand2 },
  { title: "Effects", url: "/effects", icon: Sparkles },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Support", url: "/support", icon: Headphones },
  { title: "Guides", url: "/guides", icon: BookOpen },
];

const tools = [
  { title: "Generate", url: "/text-to-image", icon: Image },
  { title: "Upscale", url: "/upscale", icon: Zap },
  { title: "Remove BG", url: "/bg-remover", icon: Eraser },
  { title: "Transform", url: "/image-to-image", icon: RefreshCw },
  { title: "Sketch", url: "/image-to-sketch", icon: PenTool },
];

interface AppSidebarProps {
  user?: FirebaseUser | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { toast } = useToast();
  
  const { data: isAdminData } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check", user?.email],
    enabled: !!user?.email,
  });

  const { unreadCount } = useUserMessages();

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold">Visionary AI</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span className="relative">
                        {item.title}
                        {item.title === 'Messages' && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold">
                            {unreadCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdminData?.isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-testid="nav-admin-panel">
                    <Link href="/admin">
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <>
            <Separator className="mb-3" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <UserAvatar user={user} className="h-7 w-7" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || 'User'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
