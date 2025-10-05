import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { 
  Download, 
  Sparkles,
  Scissors,
  FilePlus2,
  Wand2
} from "lucide-react";

const MoreTools = () => {
  const { toast } = useToast();
  const [imageQuality, setImageQuality] = useState([80]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [promptImage, setPromptImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPromptImage(event.target?.result as string);
        setGeneratedPrompt("");
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePromptFromImage = async () => {
    if (!promptImage) {
      toast({
        title: "No image",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: promptImage }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
      toast({
        title: "Prompt Generated",
        description: "AI has analyzed your image and created a prompt",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please make sure your Gemini API key is configured.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = () => {
    if (!uploadedImage) {
      toast({
        title: "No image",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `compressed-image-${imageQuality[0]}.jpg`;
          link.click();
          toast({
            title: "Image Compressed",
            description: `Image compressed at ${imageQuality[0]}% quality`,
          });
        }
      }, 'image/jpeg', imageQuality[0] / 100);
    };
    img.src = uploadedImage;
  };

  const handlePdfImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Please upload images smaller than 10MB`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push(event.target?.result as string);
        processedCount++;

        if (processedCount === files.length) {
          setPdfImages([...pdfImages, ...newImages]);
          toast({
            title: "Images Added",
            description: `${newImages.length} image(s) added to PDF`,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const createPDF = async () => {
    if (pdfImages.length === 0) {
      toast({
        title: "No images",
        description: "Please add at least one image to create a PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const imgData of pdfImages) {
        if (!isFirstPage) {
          pdf.addPage();
        }

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imgData;
        });

        const imgWidth = img.width;
        const imgHeight = img.height;
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        let finalWidth = pdfWidth;
        let finalHeight = (imgHeight * pdfWidth) / imgWidth;

        if (finalHeight > pdfHeight) {
          finalHeight = pdfHeight;
          finalWidth = (imgWidth * pdfHeight) / imgHeight;
        }

        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
        isFirstPage = false;
      }

      pdf.save('images-to-pdf.pdf');
      toast({
        title: "PDF Created",
        description: `PDF with ${pdfImages.length} image(s) has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removePdfImage = (index: number) => {
    setPdfImages(pdfImages.filter((_, i) => i !== index));
    toast({
      title: "Image Removed",
      description: "Image has been removed from the PDF",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:p-8 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 dark:text-white" data-testid="heading-more-tools">
          More Tools
        </h1>
        <p className="text-sm md:text-base text-muted-foreground" data-testid="text-description">
          Explore additional creative and productivity tools
        </p>
      </div>

      <Tabs defaultValue="image-to-prompt" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6 h-auto">
          <TabsTrigger value="image-to-prompt" data-testid="tab-image-to-prompt" className="text-xs md:text-sm py-2 md:py-3">
            <Wand2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Image to </span>Prompt
          </TabsTrigger>
          <TabsTrigger value="image-to-pdf" data-testid="tab-image-to-pdf" className="text-xs md:text-sm py-2 md:py-3">
            <FilePlus2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Image to </span>PDF
          </TabsTrigger>
          <TabsTrigger value="image-compress" data-testid="tab-image-compress" className="text-xs md:text-sm py-2 md:py-3">
            <Scissors className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Compress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image-to-prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="heading-image-to-prompt">
                <Wand2 className="w-5 h-5" />
                Image to Prompt Generator
              </CardTitle>
              <CardDescription data-testid="text-prompt-description">
                Upload an image and let AI generate a detailed prompt description using Gemini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-image">Upload Image</Label>
                <Input
                  id="prompt-image"
                  type="file"
                  accept="image/*"
                  onChange={handlePromptImageUpload}
                  data-testid="input-upload-prompt-image"
                />
              </div>
              
              {promptImage && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img
                      src={promptImage}
                      alt="Preview"
                      className="max-w-full max-h-64 mx-auto rounded"
                      data-testid="img-prompt-preview"
                    />
                  </div>
                  
                  <Button 
                    onClick={generatePromptFromImage} 
                    className="w-full md:w-auto" 
                    disabled={isGenerating}
                    data-testid="button-generate-prompt"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Prompt
                      </>
                    )}
                  </Button>
                  
                  {generatedPrompt && (
                    <div className="space-y-2">
                      <Label>Generated Prompt</Label>
                      <Textarea
                        value={generatedPrompt}
                        readOnly
                        className="min-h-32 resize-none"
                        data-testid="textarea-generated-prompt"
                      />
                      <Button 
                        onClick={copyPrompt} 
                        variant="outline" 
                        className="w-full md:w-auto"
                        data-testid="button-copy-prompt"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Copy Prompt
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image-to-pdf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="heading-image-to-pdf">
                <FilePlus2 className="w-5 h-5" />
                Image to PDF Converter
              </CardTitle>
              <CardDescription data-testid="text-pdf-description">
                Convert multiple images into a single PDF document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-images">Upload Images</Label>
                <Input
                  id="pdf-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePdfImageUpload}
                  data-testid="input-upload-pdf-images"
                />
                <p className="text-xs text-muted-foreground">
                  You can select multiple images at once
                </p>
              </div>
              
              {pdfImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" data-testid="text-image-count">
                      {pdfImages.length} image(s) added
                    </p>
                    <Button 
                      onClick={createPDF} 
                      className="w-auto" 
                      data-testid="button-create-pdf"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Create PDF
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {pdfImages.map((imgData, index) => (
                      <div 
                        key={index} 
                        className="relative group border rounded-lg overflow-hidden"
                        data-testid={`pdf-image-${index}`}
                      >
                        <img
                          src={imgData}
                          alt={`PDF Image ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePdfImage(index)}
                          data-testid={`button-remove-pdf-image-${index}`}
                        >
                          <Scissors className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image-compress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="heading-image-compress">
                <Scissors className="w-5 h-5" />
                Image Compressor
              </CardTitle>
              <CardDescription data-testid="text-compress-description">
                Reduce image file size while maintaining quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  data-testid="input-upload-image"
                />
              </div>
              {uploadedImage && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="max-w-full max-h-64 mx-auto"
                      data-testid="img-preview"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quality: {imageQuality[0]}%</Label>
                    <Slider
                      value={imageQuality}
                      onValueChange={setImageQuality}
                      min={10}
                      max={100}
                      step={5}
                      data-testid="slider-quality"
                    />
                  </div>
                  <Button onClick={compressImage} className="w-full md:w-auto" data-testid="button-compress">
                    <Download className="w-4 h-4 mr-2" />
                    Compress & Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MoreTools;
