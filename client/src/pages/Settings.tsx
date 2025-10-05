import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { auth, logOut } from "@/lib/firebase";
import { deleteUser, updateProfile } from "firebase/auth";
import { Settings, Loader2, Trash2, Bell, User, Lock } from "lucide-react";
import { useLocation } from "wouter";
import type { UserProfile } from "@shared/schema";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: [`/api/user-profiles/${user?.uid}`],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return await apiRequest("PUT", `/api/user-profiles/${user?.uid}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user-profiles/${user?.uid}`] });
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be signed in to delete your account");
      }

      try {
        await deleteUser(currentUser);
      } catch (firebaseError: any) {
        if (firebaseError?.code === 'auth/requires-recent-login') {
          toast({
            title: "Re-authentication required",
            description: "Please sign out and sign back in, then try deleting your account again.",
            variant: "destructive",
          });
          setIsDeleting(false);
          setShowDeleteDialog(false);
          return;
        }
        throw firebaseError;
      }

      await apiRequest("DELETE", `/api/user-profiles/${user.uid}`);
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      setLocation("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      
      try {
        await logOut();
      } catch (logoutError) {
        console.error("Error logging out after failed deletion:", logoutError);
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please sign in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6 md:w-8 md:h-8" />
          Settings
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="space-y-6">
        <ProfileSettings 
          profile={profile} 
          onSave={(updates) => updateProfileMutation.mutate(updates)} 
          isSaving={updateProfileMutation.isPending} 
        />
        
        <NotificationSettings 
          profile={profile} 
          onSave={(updates) => updateProfileMutation.mutate(updates)} 
          isSaving={updateProfileMutation.isPending} 
        />
        
        <PrivacySettings 
          profile={profile} 
          onSave={(updates) => updateProfileMutation.mutate(updates)} 
          isSaving={updateProfileMutation.isPending} 
        />
        
        <DangerZone onDeleteAccount={() => setShowDeleteDialog(true)} />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account,
              all your saved images, art styles, and custom models. All your data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProfileSettings({ 
  profile, 
  onSave, 
  isSaving 
}: { 
  profile?: UserProfile; 
  onSave: (updates: Partial<UserProfile>) => void; 
  isSaving: boolean 
}) {
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.displayName || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const newUsername = username.trim() || null;
      
      // Update Firebase displayName first
      const currentUser = auth.currentUser;
      if (currentUser && newUsername) {
        await updateProfile(currentUser, {
          displayName: newUsername,
        });
      }

      // Then update the database profile
      onSave({ displayName: newUsername });
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        title: "Error",
        description: "Failed to update username. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </CardTitle>
        <CardDescription>Update your username</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              data-testid="input-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>

          <Button type="submit" data-testid="button-save-profile" disabled={isSaving || isUpdating}>
            {(isSaving || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {(isSaving || isUpdating) ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationSettings({ 
  profile, 
  onSave, 
  isSaving 
}: { 
  profile?: UserProfile; 
  onSave: (updates: Partial<UserProfile>) => void; 
  isSaving: boolean 
}) {
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        emailNotifications: profile.emailNotifications ?? true,
        pushNotifications: profile.pushNotifications ?? true,
        marketingEmails: profile.marketingEmails ?? false,
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
        <CardDescription>Manage how you receive updates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about your account activity
              </p>
            </div>
            <Switch
              id="emailNotifications"
              data-testid="switch-emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </p>
            </div>
            <Switch
              id="pushNotifications"
              data-testid="switch-pushNotifications"
              checked={formData.pushNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive promotional emails and product updates
              </p>
            </div>
            <Switch
              id="marketingEmails"
              data-testid="switch-marketingEmails"
              checked={formData.marketingEmails}
              onCheckedChange={(checked) => setFormData({ ...formData, marketingEmails: checked })}
            />
          </div>

          <Button type="submit" data-testid="button-save-notifications" disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : "Save Notification Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PrivacySettings({ 
  profile, 
  onSave, 
  isSaving 
}: { 
  profile?: UserProfile; 
  onSave: (updates: Partial<UserProfile>) => void; 
  isSaving: boolean 
}) {
  const [profileVisibility, setProfileVisibility] = useState("public");

  useEffect(() => {
    if (profile) {
      setProfileVisibility(profile.profileVisibility || "public");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ profileVisibility });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Privacy
        </CardTitle>
        <CardDescription>Control who can see your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileVisibility">Profile Visibility</Label>
            <Select
              value={profileVisibility}
              onValueChange={setProfileVisibility}
            >
              <SelectTrigger id="profileVisibility" data-testid="select-profileVisibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
                <SelectItem value="private">Private - Only you can view your profile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" data-testid="button-save-privacy" disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DangerZone({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your data including saved images, 
              art styles, and custom models will be permanently deleted.
            </p>
            <Button
              data-testid="button-delete-account"
              variant="destructive"
              onClick={onDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
