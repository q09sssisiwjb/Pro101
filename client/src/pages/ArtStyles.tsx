import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Palette, Calendar, User, Brush, Wand2, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { UserArtStyle } from '@shared/schema';
import { useLocation } from 'wouter';

interface ArtStyleWithUser extends UserArtStyle {
  userDisplayName?: string;
}

const ArtStyles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all art styles globally (public endpoint, no auth required)
  const { data: artStyles = [], isLoading, error } = useQuery<ArtStyleWithUser[]>({
    queryKey: ['/api/art-styles'],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch('/api/art-styles');
      if (!response.ok) {
        throw new Error('Failed to fetch art styles');
      }
      return response.json();
    },
  });

  // Filter art styles based on search term
  const filteredArtStyles = artStyles.filter(style =>
    style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (style.description && style.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (style.keywords && style.keywords.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (style.inspiration && style.inspiration.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUseStyle = (style: UserArtStyle) => {
    // Store the style data in localStorage so it can be picked up by the Text-to-Image page
    localStorage.setItem('selectedArtStyle', JSON.stringify({
      name: style.name,
      description: style.description,
      keywords: style.keywords,
      inspiration: style.inspiration,
      characteristics: style.characteristics,
      source: 'community'
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" />
            Art Styles Gallery
          </h1>
          <p className="text-muted-foreground">
            Discover and use art styles created by the Visionary AI community
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search art styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-styles"
          />
        </div>
      </div>

      <Separator className="mb-6" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                  <div className="h-8 bg-muted rounded mt-4"></div>
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
              There was an error loading the art styles. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : filteredArtStyles.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>
              {searchTerm ? 'No Art Styles Found' : 'No Art Styles Yet'}
            </CardTitle>
            <CardDescription>
              {searchTerm 
                ? `No art styles match "${searchTerm}". Try different keywords.`
                : 'Be the first to create an art style for the community!'
              }
            </CardDescription>
          </CardHeader>
          {searchTerm && (
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                data-testid="button-clear-search"
              >
                Clear Search
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredArtStyles.length} of {artStyles.length} art styles
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtStyles.map((style: ArtStyleWithUser) => (
              <Card key={style.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-style-name-${style.id}`}>
                        {style.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(style.createdAt)}
                        </div>
                        {style.userDisplayName && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {style.userDisplayName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {style.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{style.description}</p>
                    </div>
                  )}
                  
                  {style.keywords && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {style.keywords.split(',').slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword.trim()}
                          </Badge>
                        ))}
                        {style.keywords.split(',').length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{style.keywords.split(',').length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {style.inspiration && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Inspiration</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{style.inspiration}</p>
                    </div>
                  )}
                  
                  {style.characteristics && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Characteristics</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{style.characteristics}</p>
                    </div>
                  )}
                  
                  <div className="pt-2 space-y-2">
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
        </>
      )}
    </div>
  );
};

export default ArtStyles;