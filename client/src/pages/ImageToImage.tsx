import { useState, useRef, useEffect } from 'react';
import { Send, Download, Share2, Loader2, Paperclip, X, Plus, Edit, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: Date;
  isGenerating?: boolean;
  generatedImage?: string;
  isTextToImage?: boolean;
}

interface GenerationResult {
  success: boolean;
  generatedImage: string;
  description?: string;
  error?: string;
  details?: string;
}

export default function ImageToImage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI image assistant. You can either:\n\n• Type a description to generate a new image from text\n• Upload images and describe how you'd like me to transform or combine them\n\nI can create new images, merge different images, change styles, blend elements, and much more!",
      timestamp: new Date(),
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for image to edit from text-to-image page on component mount
  useEffect(() => {
    const imageToEdit = localStorage.getItem('imageToEdit');
    if (imageToEdit) {
      try {
        const imageData = JSON.parse(imageToEdit);
        
        // Create a File object from the stored data
        const byteCharacters = atob(imageData.file.data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: imageData.file.type });
        const file = new File([blob], imageData.file.name, { type: imageData.file.type });
        
        // Set the file and image preview
        setSelectedFiles([file]);
        setSelectedImages([imageData.file.data]);
        
        // Set a helpful prompt suggesting what the user can do
        setInputPrompt(`Edit this image from "${imageData.originalPrompt}". Describe your changes...`);
        
        // Clear the stored data
        localStorage.removeItem('imageToEdit');
        
        // Show a helpful message
        toast({
          title: "Image loaded for editing",
          description: "Your generated image is ready to be transformed. Describe your changes below.",
        });
        
        // Focus the input area
        setTimeout(() => {
          textareaRef.current?.focus();
          // Move cursor to the end and clear the suggested text for easy editing
          textareaRef.current?.setSelectionRange(0, 0);
        }, 100);
        
      } catch (error) {
        console.error('Failed to load image for editing:', error);
        toast({
          title: "Failed to load image",
          description: "Could not load the image for editing. Please try uploading it manually.",
          variant: "destructive",
        });
        localStorage.removeItem('imageToEdit');
      }
    }
  }, [toast]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputPrompt]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit of 5 images
    if (selectedFiles.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images to combine",
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    const validImages: string[] = [];
    let hasErrors = false;

    const processFiles = async () => {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB`,
            variant: "destructive",
          });
          hasErrors = true;
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a valid image file`,
            variant: "destructive",
          });
          hasErrors = true;
          continue;
        }

        validFiles.push(file);
        
        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          validImages.push(e.target?.result as string);
          if (validImages.length === validFiles.length) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
            setSelectedImages(prev => [...prev, ...validImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    processFiles();
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim()) return;

    if (selectedImages.length > 0 && !inputPrompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please describe how you want to transform or combine the images",
        variant: "destructive",
      });
      return;
    }

    // Capture values before clearing state
    const prompt = inputPrompt.trim();
    const files = [...selectedFiles];
    const images = [...selectedImages];
    const isTextToImage = images.length === 0;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      images: images,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Add loading assistant message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: isTextToImage 
        ? 'Generating your image from text...' 
        : files.length === 1 
          ? 'Transforming your image...' 
          : 'Combining and transforming your images...',
      timestamp: new Date(),
      isGenerating: true,
    };

    setMessages(prev => [...prev, loadingMessage]);
    setIsGenerating(true);
    
    // Clear input state after capturing values
    setInputPrompt('');
    setSelectedImages([]);
    setSelectedFiles([]);

    try {
      let response;
      
      if (isTextToImage) {
        // Text-to-image generation
        response = await fetch('/api/text-to-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
          }),
        });
      } else {
        // Image-to-image transformation
        const imageDataArray: { data: string; type: string }[] = [];
        
        for (const file of files) {
          const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          imageDataArray.push({
            data: base64Data,
            type: file.type
          });
        }

        response = await fetch('/api/image-to-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            images: imageDataArray,
            transformPrompt: prompt,
          }),
        });
      }

      const result: GenerationResult = await response.json();

      // Remove loading message and add result
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        const resultMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: response.ok && result.success 
            ? result.description || (isTextToImage ? 'Here\'s your generated image!' : 'Here\'s your transformed image!') 
            : result.error || 'Sorry, I couldn\'t generate the image. Please try again.',
          timestamp: new Date(),
          generatedImage: response.ok && result.success ? result.generatedImage : undefined,
          isTextToImage,
        };
        return [...filtered, resultMessage];
      });

      if (response.ok && result.success) {
        toast({
          title: "Image generated successfully!",
          description: isTextToImage ? "Your image has been generated from text" : "Your transformed image is ready",
        });
      } else {
        toast({
          title: "Generation failed",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
          timestamp: new Date(),
        };
        return [...filtered, errorMessage];
      });
      toast({
        title: "Upload failed",
        description: "Failed to process the uploaded images",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your generated image is being downloaded",
    });
  };

  const handleShare = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'generated-image.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'AI Generated Image',
          text: 'Check out this image I transformed with AI!',
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Page link copied to clipboard for sharing",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share failed",
        description: "Could not share the image",
        variant: "destructive",
      });
    }
  };

  const handleEditImage = async (imageUrl: string) => {
    try {
      // Convert the generated image back to a File object for editing
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'generated-image.png', { type: 'image/png' });
      
      // Add the image to selected files for editing
      setSelectedFiles([file]);
      setSelectedImages([imageUrl]);
      
      // Set placeholder text for editing
      setInputPrompt('');
      
      // Scroll to input area
      textareaRef.current?.focus();
      
      toast({
        title: "Image ready for editing",
        description: "The generated image has been added for further editing. Describe your changes below.",
      });
    } catch (error) {
      console.error('Edit image error:', error);
      toast({
        title: "Edit failed",
        description: "Could not prepare the image for editing",
        variant: "destructive",
      });
    }
  };

  const handleImageZoom = (imageUrl: string) => {
    setZoomedImage(imageUrl);
    setZoomLevel(1);
  };

  const handleCloseZoom = () => {
    setZoomedImage(null);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-12rem)] bg-background" data-testid="image-to-image-chat">
      {/* Header */}
      <div className="border-b border-border/40 px-4 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-foreground" data-testid="chat-title">
            Image-to-Image Generator
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="chat-description">
            Transform your images with AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-[400px] overflow-y-auto" data-testid="messages-container">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.type}-${message.id}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted text-muted-foreground mr-12'
                  }`}
                >
                  {message.images && message.images.length > 0 && (
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {message.images.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`Uploaded ${i + 1}`}
                          className="rounded-2xl max-w-full h-auto max-h-64 object-cover"
                          data-testid={`message-image-${message.id}-${i}`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap text-sm" data-testid={`message-content-${message.id}`}>
                    {message.content}
                  </div>

                  {message.isGenerating && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  )}

                  {message.generatedImage && (
                    <div className="mt-3 space-y-3">
                      <img
                        src={message.generatedImage}
                        alt="Generated result"
                        className="rounded-2xl max-w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageZoom(message.generatedImage!)}
                        data-testid={`generated-image-${message.id}`}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(message.generatedImage!)}
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          data-testid={`button-download-${message.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={() => handleEditImage(message.generatedImage!)}
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          data-testid={`button-edit-${message.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleShare(message.generatedImage!)}
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          data-testid={`button-share-${message.id}`}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {selectedImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedImages.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Selected ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg border border-border"
                    data-testid={`selected-image-preview-${index}`}
                  />
                  <Button
                    onClick={() => removeImage(index)}
                    size="sm"
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    data-testid={`button-remove-image-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={selectedImages.length > 0 ? "Describe how you want to transform or combine these images..." : "Describe an image to generate, or upload images to transform them..."}
                className="resize-none pr-20 border-0 shadow-none focus-visible:ring-1 bg-muted/50"
                rows={1}
                disabled={isGenerating}
                data-testid="input-prompt"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={isGenerating || selectedImages.length >= 5}
                  title={selectedImages.length >= 5 ? "Maximum 5 images allowed" : "Upload images"}
                  data-testid="button-upload-image"
                >
                  {selectedImages.length === 0 ? <Paperclip className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={(!inputPrompt.trim() && selectedImages.length === 0) || isGenerating}
                  className="h-8 w-8 p-0"
                  data-testid="button-send"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            data-testid="input-file"
          />
        </div>
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={!!zoomedImage} onOpenChange={handleCloseZoom}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur rounded-lg p-2">
            <DialogTitle className="text-sm">Generated Image</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Click and drag to pan, use controls to zoom
            </DialogDescription>
          </DialogHeader>
          
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              onClick={handleZoomOut}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleResetZoom}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleZoomIn}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCloseZoom}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full h-full flex items-center justify-center overflow-auto bg-black/5">
            {zoomedImage && (
              <img
                src={zoomedImage}
                alt="Zoomed generated image"
                className="max-w-none object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel})`,
                  maxHeight: zoomLevel === 1 ? '100%' : 'none',
                  maxWidth: zoomLevel === 1 ? '100%' : 'none',
                }}
              />
            )}
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/80 backdrop-blur rounded-lg px-3 py-1">
            <span className="text-sm text-muted-foreground">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}