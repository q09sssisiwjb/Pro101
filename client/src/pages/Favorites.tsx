import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Download, Trash2, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SavedImage } from "@shared/schema";

const Favorites = () => {
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSavedImages();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSavedImages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/saved-images?userId=${user.uid}&limit=50`);
      const data = await response.json();
      setSavedImages(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch saved images:', error);
      setError('Failed to load your saved images');
      toast({
        title: "Error loading favorites",
        description: "Could not load your saved images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageData: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `favorite-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your image is being downloaded.",
    });
  };

  const removeFavorite = async (imageId: string) => {
    try {
      await apiRequest('DELETE', `/api/saved-images/${imageId}`);
      setSavedImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: "Removed from favorites",
        description: "Image has been removed from your favorites.",
      });
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      toast({
        title: "Remove failed",
        description: "Could not remove image from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Your Favorites</h1>
            <p className="text-muted-foreground mb-4">
              Please log in to view your saved images.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Error Loading Favorites</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchSavedImages} data-testid="button-retry">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">Your Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            {savedImages.length} saved image{savedImages.length !== 1 ? 's' : ''}
          </p>
        </div>

        {savedImages.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-4">
              Start generating images and save your favorites to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedImages.map((image) => (
              <Card key={image.id} className="group relative overflow-hidden" data-testid={`card-favorite-${image.id}`}>
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.imageData}
                      alt={`Generated image: ${image.prompt}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      data-testid={`img-favorite-${image.id}`}
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(image.imageData, image.prompt)}
                          data-testid={`button-download-${image.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFavorite(image.id)}
                          data-testid={`button-remove-${image.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image details */}
                  <div className="p-4">
                    <p className="text-sm font-medium line-clamp-2 mb-2" data-testid={`text-prompt-${image.id}`}>
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span data-testid={`text-model-${image.id}`}>{image.model}</span>
                      <span data-testid={`text-dimensions-${image.id}`}>{image.width}×{image.height}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span data-testid={`text-style-${image.id}`}>{image.artStyle}</span>
                      <span data-testid={`text-date-${image.id}`}>
                        {new Date(image.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;