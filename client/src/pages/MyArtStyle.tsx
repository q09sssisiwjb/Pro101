import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Palette, Calendar, User, Brush } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { UserArtStyle } from '@shared/schema';
import { useLocation } from 'wouter';

interface ArtStyleFormData {
  name: string;
  description: string;
  keywords: string;
  inspiration: string;
  characteristics: string;
}

const MyArtStyle = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<UserArtStyle | null>(null);
  const [formData, setFormData] = useState<ArtStyleFormData>({
    name: '',
    description: '',
    keywords: '',
    inspiration: '',
    characteristics: ''
  });

  // Fetch user art styles
  const { data: artStyles = [], isLoading, error } = useQuery<UserArtStyle[]>({
    queryKey: ['/api/user-art-styles', user?.uid],
    enabled: !!user?.uid,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch(`/api/user-art-styles?userId=${user?.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch art styles');
      }
      return response.json();
    },
  });

  // Create art style mutation
  const createMutation = useMutation({
    mutationFn: async (data: ArtStyleFormData) => {
      const response = await fetch('/api/user-art-styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          ...data
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create art style');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-art-styles', user?.uid] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Art style created!",
        description: "Your custom art style has been saved to your account.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create art style. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update art style mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ArtStyleFormData> }) => {
      const response = await fetch(`/api/user-art-styles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update art style');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-art-styles', user?.uid] });
      setIsDialogOpen(false);
      setEditingStyle(null);
      resetForm();
      toast({
        title: "Art style updated!",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update art style. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete art style mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/user-art-styles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete art style');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-art-styles', user?.uid] });
      toast({
        title: "Art style deleted",
        description: "Your art style has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete art style. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      keywords: '',
      inspiration: '',
      characteristics: ''
    });
  };

  const handleCreate = () => {
    setEditingStyle(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (style: UserArtStyle) => {
    setEditingStyle(style);
    setFormData({
      name: style.name,
      description: style.description || '',
      keywords: style.keywords || '',
      inspiration: style.inspiration || '',
      characteristics: style.characteristics || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your art style.",
        variant: "destructive",
      });
      return;
    }

    if (editingStyle) {
      updateMutation.mutate({ id: editingStyle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleUseStyle = (style: UserArtStyle) => {
    // Store the style data in localStorage so it can be picked up by the Text-to-Image page
    localStorage.setItem('selectedArtStyle', JSON.stringify({
      name: style.name,
      description: style.description,
      keywords: style.keywords,
      inspiration: style.inspiration,
      characteristics: style.characteristics,
      source: 'database'
    }));
    
    // Navigate to text-to-image page
    setLocation('/text-to-image');
    
    toast({
      title: "Art style selected!",
      description: `"${style.name}" is now ready to use in Text-to-Image generation.`,
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to view and manage your custom art styles.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Art Styles</h1>
          <p className="text-muted-foreground">
            Create and manage your custom art styles for image generation
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} data-testid="button-create-art-style">
              <Plus className="h-4 w-4 mr-2" />
              Create Art Style
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStyle ? 'Edit Art Style' : 'Create New Art Style'}
              </DialogTitle>
              <DialogDescription>
                Define your custom art style with detailed information to improve image generation results.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cyberpunk Neon"
                  data-testid="input-style-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what makes this art style unique..."
                  className="min-h-[80px]"
                  data-testid="textarea-style-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="e.g., neon, futuristic, dark, glowing"
                  data-testid="input-style-keywords"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspiration">Inspiration</Label>
                <Input
                  id="inspiration"
                  value={formData.inspiration}
                  onChange={(e) => setFormData(prev => ({ ...prev, inspiration: e.target.value }))}
                  placeholder="What inspired this style? Artists, movements, concepts..."
                  data-testid="input-style-inspiration"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="characteristics">Key Characteristics</Label>
                <Textarea
                  id="characteristics"
                  value={formData.characteristics}
                  onChange={(e) => setFormData(prev => ({ ...prev, characteristics: e.target.value }))}
                  placeholder="Colors, techniques, mood, or specific elements..."
                  className="min-h-[80px]"
                  data-testid="textarea-style-characteristics"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-style"
                >
                  {editingStyle ? 'Update Style' : 'Create Style'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Art Styles</CardTitle>
            <CardDescription>
              There was an error loading your art styles. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : artStyles.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Art Styles Yet</CardTitle>
            <CardDescription>
              Create your first custom art style to get started with personalized image generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreate} data-testid="button-create-first-style">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Art Style
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artStyles.map((style: UserArtStyle) => (
            <Card key={style.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-style-name-${style.id}`}>
                      {style.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(style.createdAt)}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(style)}
                      data-testid={`button-edit-${style.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-delete-${style.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Art Style</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{style.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(style.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {style.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                )}
                
                {style.keywords && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {style.keywords.split(',').map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {style.inspiration && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Inspiration</h4>
                    <p className="text-sm text-muted-foreground">{style.inspiration}</p>
                  </div>
                )}
                
                {style.characteristics && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Characteristics</h4>
                    <p className="text-sm text-muted-foreground">{style.characteristics}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    onClick={() => handleUseStyle(style)}
                    className="w-full"
                    variant="default"
                    data-testid={`button-use-style-${style.id}`}
                  >
                    <Brush className="h-4 w-4 mr-2" />
                    Use This Style
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyArtStyle;