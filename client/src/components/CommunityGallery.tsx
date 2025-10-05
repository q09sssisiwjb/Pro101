import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Image as StoredImage } from '@shared/schema';
import { 
  Palette, 
  Camera, 
  Sparkles, 
  Box, 
  Image, 
  Shapes, 
  Gamepad2, 
  Wand2, 
  Cpu, 
  Clock, 
  Circle, 
  Eye,
  Square,
  Smartphone,
  ChevronDown,
  Check 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Use the shared schema type for consistency
type GalleryImage = StoredImage & {
  createdAt: string; // Convert Date to string for API response
}

// Fallback images for when there are no user-generated images yet
const fallbackGalleryItems = [
  {
    id: "fallback-1",
    title: "Create Your First Image!",
    author: "Get Started",
    category: "Tutorial",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600",
    alt: "Generate your first AI artwork",
    isFallback: true
  },
  {
    id: "fallback-2", 
    title: "Share with Community",
    author: "Join Us",
    category: "Community",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600",
    alt: "Share your creations",
    isFallback: true
  }
];

const CommunityGallery = () => {
  const limit = 500; // Maximum 500 images
  const [selectedArtStyle, setSelectedArtStyle] = useState<string>('all');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');

  // Art style filters
  const artStyleFilters = [
    { id: 'all', label: 'All', icon: Palette },
    { id: 'photograph', label: 'Photography', icon: Camera },
    { id: 'anime', label: 'Anime', icon: Sparkles },
    { id: '3d', label: '3D Render', icon: Box },
    { id: 'realistic', label: 'Realistic', icon: Image },
    { id: 'abstract', label: 'Abstract', icon: Shapes },
    { id: 'cartoon', label: 'Cartoon', icon: Gamepad2 },
    { id: 'fantasy', label: 'Fantasy', icon: Wand2 },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: Cpu },
    { id: 'vintage', label: 'Vintage', icon: Clock },
    { id: 'minimalist', label: 'Minimalist', icon: Circle },
    { id: 'surreal', label: 'Surreal', icon: Eye }
  ];

  // Aspect ratio filters
  const aspectRatioFilters = [
    { id: '1:1', label: 'Square (1:1)', icon: Square },
    { id: '9:16', label: 'Portrait (9:16)', icon: Smartphone }
  ];

  // Fetch community images using React Query
  const { data: images = [], isLoading, error, refetch } = useQuery({
    queryKey: ['community-images'],
    queryFn: async (): Promise<GalleryImage[]> => {
      const response = await fetch(`/api/images?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Map stored art styles to filter categories
  const mapArtStyleToFilter = (artStyle: string): string => {
    const style = artStyle.toLowerCase();
    
    // Map specific art styles to filter categories
    if (style.includes('anime') || style.includes('manga') || style.includes('kawaii') || style.includes('ghibli')) {
      return 'anime';
    }
    
    if (style.includes('3d') || style.includes('render') || style.includes('blender') || style.includes('octane')) {
      return '3d';
    }
    
    if (style.includes('cyberpunk') || style.includes('futuristic') || style.includes('sci-fi')) {
      return 'cyberpunk';
    }
    
    if (style.includes('cartoon') || style.includes('animated') || style.includes('disney') || style.includes('comic')) {
      return 'cartoon';
    }
    
    if (style.includes('surreal') || style.includes('psychedelic') || style.includes('dreamlike')) {
      return 'surreal';
    }
    
    if (style.includes('fantasy') || style.includes('magical') || style.includes('mystical') || style.includes('medieval')) {
      return 'fantasy';
    }
    
    if (style.includes('vintage') || style.includes('retro') || style.includes('classic') || style.includes('sepia')) {
      return 'vintage';
    }
    
    if (style.includes('minimalist') || style.includes('minimal') || style.includes('simple') || style.includes('geometric')) {
      return 'minimalist';
    }
    
    if (style.includes('abstract') || style.includes('modern art') || style.includes('contemporary')) {
      return 'abstract';
    }
    
    if (style.includes('photograph') || style.includes('photography') || style.includes('photo') || style.includes('portrait') || style.includes('hdr')) {
      return 'photograph';
    }
    
    // Default to realistic for most common styles
    return 'realistic';
  };

  // Determine aspect ratio from width and height
  const getAspectRatio = (width: number, height: number): string => {
    const ratio = width / height;
    
    // Check for 1:1 (square) - allow small tolerance
    if (Math.abs(ratio - 1) < 0.1) {
      return '1:1';
    }
    
    // Check for 9:16 (portrait) - allow small tolerance
    if (Math.abs(ratio - (9/16)) < 0.1) {
      return '9:16';
    }
    
    // Default to 'other' for any other ratios
    return 'other';
  };

  // Filter and transform API images to gallery format
  const transformApiImages = (apiImages: GalleryImage[]) => {
    const filteredImages = apiImages.filter(img => {
      // Filter by art style
      const styleMatch = selectedArtStyle === 'all' || mapArtStyleToFilter(img.artStyle) === selectedArtStyle;
      
      // Filter by aspect ratio
      const aspectRatio = getAspectRatio(img.width, img.height);
      const ratioMatch = aspectRatio === selectedAspectRatio;
      
      return styleMatch && ratioMatch;
    });
    
    return filteredImages.map(img => ({
      id: img.id,
      title: img.prompt.length > 50 ? img.prompt.substring(0, 50) + '...' : img.prompt,
      author: img.userDisplayName || 'Anonymous',
      category: img.model,
      artStyle: img.artStyle, // Include the stored art style
      image: img.imageData, // This is the base64 data URL
      alt: `AI-generated: ${img.prompt}`,
      createdAt: img.createdAt,
      width: img.width,
      height: img.height
    }));
  };

  // Combine real images with fallbacks if needed
  const transformedImages = images.length > 0 ? transformApiImages(images) : [];
  const galleryItems = transformedImages.length > 0 ? transformedImages : fallbackGalleryItems;
  
  // Check if we have no results for current filter
  const hasNoFilterResults = images.length > 0 && transformedImages.length === 0 && (selectedArtStyle !== 'all' || true);


  const getCategoryColor = (category: string) => {
    const colors = {
      'flux': 'bg-primary/20 text-primary',
      'flux-schnell': 'bg-blue-500/20 text-blue-400',
      'flux-real': 'bg-green-500/20 text-green-400',
      'turbo': 'bg-orange-500/20 text-orange-400',
      'image-4': 'bg-pink-500/20 text-pink-400',
      'image-4-ultra': 'bg-red-500/20 text-red-400',
      'Tutorial': 'bg-gray-500/20 text-gray-400',
      'Community': 'bg-cyan-500/20 text-cyan-400'
    };
    return colors[category as keyof typeof colors] || 'bg-primary/20 text-primary';
  };

  return (
    <section id="gallery" className="pt-0 pb-16 bg-muted/20" data-testid="gallery-section">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground" data-testid="gallery-title">
              Community Creations
            </h2>
            
            {/* Ratio Filter Dropdown - Right Side */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="ratio-filter-dropdown"
                >
                  <Image className="w-4 h-4" />
                  {aspectRatioFilters.find(f => f.id === selectedAspectRatio)?.label || 'Square (1:1)'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {aspectRatioFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => setSelectedAspectRatio(filter.id)}
                    className="flex items-center justify-between"
                    data-testid={`ratio-dropdown-${filter.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <filter.icon className="w-4 h-4" />
                      <span>{filter.label}</span>
                    </div>
                    {selectedAspectRatio === filter.id && <Check className="w-4 h-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Art Style Filters - Horizontal Slider */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Art Style</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {artStyleFilters.map((filter) => {
                const isSelected = selectedArtStyle === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedArtStyle(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-card text-white border border-border hover:bg-muted hover:scale-102'
                    }`}
                    data-testid={`art-style-filter-${filter.id}`}
                  >
                    <filter.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          
        </div>

        {/* Loading state */}
        {isLoading && images.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading community creations...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && images.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Unable to load community images</p>
              <button onClick={() => refetch()} className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No results state for active filter */}
        {hasNoFilterResults && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No images found with current filters
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedArtStyle !== 'all'
                  ? `No ${artStyleFilters.find(f => f.id === selectedArtStyle)?.label} images in ${aspectRatioFilters.find(f => f.id === selectedAspectRatio)?.label} format found`
                  : `No images in ${aspectRatioFilters.find(f => f.id === selectedAspectRatio)?.label} format found`
                }
              </p>
              <div className="flex gap-2 justify-center">
                {selectedArtStyle !== 'all' && (
                  <button
                    onClick={() => setSelectedArtStyle('all')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    data-testid="reset-art-style-filter-button"
                  >
                    All Styles
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gallery grid */}
        {galleryItems.length > 0 && !hasNoFilterResults && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12 animate-slide-in">
            {galleryItems.map((item) => {
              // Determine if this is a 9:16 portrait image using exact width/height check
              const is9to16 = 'width' in item && 'height' in item && Math.abs(item.width * 16 - item.height * 9) <= 1;
              const containerClass = is9to16 
                ? "group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer" 
                : "group relative aspect-square bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer";
              
              return (
                <div 
                  key={item.id}
                  className={containerClass}
                  style={is9to16 && 'width' in item && 'height' in item ? { aspectRatio: `${item.width} / ${item.height}` } : {}}
                  data-testid={`gallery-item-${item.id}`}
                >
                  <img 
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    data-testid={`gallery-image-${item.id}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span 
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}
                          data-testid={`gallery-category-${item.id}`}
                        >
                          {item.category}
                        </span>
                        {'artStyle' in item && (
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30"
                            data-testid={`gallery-art-style-${item.id}`}
                          >
                            {item.artStyle}
                          </span>
                        )}
                      </div>
                      <h3 
                        className="text-white font-semibold mb-1 text-sm leading-tight"
                        data-testid={`gallery-title-${item.id}`}
                      >
                        {item.title}
                      </h3>
                      <p 
                        className="text-gray-200 text-xs"
                        data-testid={`gallery-author-${item.id}`}
                      >
                        by {item.author}
                      </p>
                      {'createdAt' in item && (
                        <p className="text-gray-300 text-xs mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default CommunityGallery;
