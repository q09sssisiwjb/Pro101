import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, 
  Image as ImageIcon, 
  Palette, 
  Eraser, 
  Maximize, 
  Brush, 
  Sparkles,
  Settings,
  Lightbulb,
  BookOpen,
  Zap,
  Layers
} from "lucide-react";

export default function Guides() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="guides-page-title">
          Guides & Tutorials
        </h1>
        <p className="text-muted-foreground text-lg" data-testid="guides-page-description">
          Learn how to use all the powerful AI tools available in Visionary AI
        </p>
      </div>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8" data-testid="guides-tabs">
          <TabsTrigger value="tools" data-testid="tab-tools">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="tips" data-testid="tab-tips">
            <Lightbulb className="w-4 h-4 mr-2" />
            Tips & Tricks
          </TabsTrigger>
          <TabsTrigger value="getting-started" data-testid="tab-getting-started">
            <BookOpen className="w-4 h-4 mr-2" />
            Getting Started
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          <Card data-testid="guide-text-to-image">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Text-to-Image Generator</CardTitle>
                  <CardDescription>Create stunning images from text descriptions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What it does:</h4>
                <p className="text-muted-foreground">
                  Transform your ideas into beautiful images using AI. Simply describe what you want to see, 
                  and the AI will generate unique artwork based on your prompt.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to use:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Enter a detailed description of the image you want to create</li>
                  <li>Choose your preferred art style (realistic, anime, 3D render, etc.)</li>
                  <li>Select image dimensions and quality settings</li>
                  <li>Click "Generate" and wait for your image to be created</li>
                  <li>Download or save your generated image to favorites</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pro Tips:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Be specific with details like lighting, colors, and mood</li>
                  <li>Use descriptive adjectives to guide the AI</li>
                  <li>Experiment with different art styles for varied results</li>
                  <li>Add negative prompts to exclude unwanted elements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-image-to-image">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Image-to-Image Transformation</CardTitle>
                  <CardDescription>Transform existing images with AI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What it does:</h4>
                <p className="text-muted-foreground">
                  Upload an image and let AI transform it based on your prompt. Perfect for style transfers, 
                  variations, or reimagining existing artwork.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to use:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Upload your source image (JPG, PNG supported)</li>
                  <li>Write a prompt describing how you want to transform the image</li>
                  <li>Adjust the influence strength (how much to keep from original)</li>
                  <li>Select your desired art style</li>
                  <li>Generate and compare results</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Best for:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Style transfers (turn photos into paintings, cartoons, etc.)</li>
                  <li>Creating variations of existing artwork</li>
                  <li>Enhancing or modifying specific elements</li>
                  <li>Exploring different artistic interpretations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-bg-remover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eraser className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Background Remover</CardTitle>
                  <CardDescription>Remove backgrounds with precision</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What it does:</h4>
                <p className="text-muted-foreground">
                  Automatically detect and remove backgrounds from images using AI. Get clean cutouts 
                  perfect for presentations, product photos, or graphic design.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to use:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Upload your image with the background you want to remove</li>
                  <li>The AI automatically detects the main subject</li>
                  <li>Review the result and fine-tune if needed</li>
                  <li>Download with transparent background (PNG format)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Works best with:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Clear subjects with defined edges</li>
                  <li>Good contrast between subject and background</li>
                  <li>Well-lit photos with minimal blur</li>
                  <li>Product photography and portraits</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-upscale">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Maximize className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Image Upscaler</CardTitle>
                  <CardDescription>Enhance and enlarge images</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What it does:</h4>
                <p className="text-muted-foreground">
                  Increase image resolution and enhance quality using AI. Turn low-resolution images into 
                  high-quality versions without losing detail.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to use:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Upload the image you want to upscale</li>
                  <li>Choose your desired upscaling factor (2x, 4x, etc.)</li>
                  <li>Select enhancement options (noise reduction, sharpening)</li>
                  <li>Process and download the enhanced image</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Perfect for:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Preparing images for print</li>
                  <li>Restoring old or low-quality photos</li>
                  <li>Creating high-res versions for displays</li>
                  <li>Improving detail in AI-generated images</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-sketch">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brush className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Image-to-Sketch</CardTitle>
                  <CardDescription>Convert photos to artistic sketches</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What it does:</h4>
                <p className="text-muted-foreground">
                  Transform photographs into pencil sketches, pen drawings, or artistic line art. 
                  Create beautiful sketch-style artwork from any image.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to use:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Upload your photo</li>
                  <li>Choose sketch style (pencil, pen, charcoal, etc.)</li>
                  <li>Adjust detail level and line intensity</li>
                  <li>Generate your sketch and download</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Great for:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Creating artistic portraits</li>
                  <li>Design references and concept art</li>
                  <li>Unique social media content</li>
                  <li>Converting photos to coloring pages</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-art-styles">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Art Styles</CardTitle>
                  <CardDescription>Explore and apply different artistic styles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Available Styles:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Realistic</p>
                    <p className="text-xs text-muted-foreground">Photo-like images</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Anime</p>
                    <p className="text-xs text-muted-foreground">Japanese animation style</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">3D Render</p>
                    <p className="text-xs text-muted-foreground">Computer-generated look</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Abstract</p>
                    <p className="text-xs text-muted-foreground">Non-representational art</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Fantasy</p>
                    <p className="text-xs text-muted-foreground">Magical and surreal</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Cartoon</p>
                    <p className="text-xs text-muted-foreground">Illustrated style</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Browse Community Art Styles:</h4>
                <p className="text-muted-foreground mb-2">
                  Explore art styles created by other users in the community. Visit the Art Styles page to discover 
                  unique styles and get inspiration for your own creations.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-custom-art-style">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Creating Custom Art Styles</CardTitle>
                  <CardDescription>Design your own unique art style presets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What are Custom Art Styles?</h4>
                <p className="text-muted-foreground">
                  Custom art styles allow you to save specific visual characteristics, keywords, and preferences 
                  as reusable presets. This ensures consistency across multiple image generations and saves time 
                  by not having to re-enter the same style details every time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to Create a Custom Art Style:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Navigate to "My Art Style" from the sidebar menu</li>
                  <li>Click the "Create New Style" or "+" button</li>
                  <li>Give your art style a descriptive name (e.g., "Vintage Film Look", "Cyberpunk Neon")</li>
                  <li>Add a description explaining the style's visual characteristics</li>
                  <li>Enter keywords that define the style (e.g., "warm tones, grainy, nostalgic")</li>
                  <li>Specify inspiration sources if any (artists, movements, references)</li>
                  <li>List key characteristics (color palette, lighting, texture, mood)</li>
                  <li>Save your custom art style</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Effective Art Styles:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Be specific with visual elements: colors, lighting, texture, composition</li>
                  <li>Include mood descriptors: dramatic, peaceful, energetic, mysterious</li>
                  <li>Reference real art movements: impressionism, art deco, minimalism</li>
                  <li>Add technical terms: bokeh, chromatic aberration, depth of field</li>
                  <li>Specify medium: oil painting, watercolor, digital art, photography</li>
                  <li>Test your style with different prompts to refine it</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Using Your Custom Styles:</h4>
                <p className="text-muted-foreground mb-2">
                  Once created, your custom art styles appear in the style selector when generating images. 
                  Simply select your saved style and it will automatically apply all the characteristics you defined. 
                  You can edit, update, or delete your custom styles anytime from the "My Art Style" page.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Example Custom Art Style:</h4>
                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <p><strong>Name:</strong> "Cinematic Noir"</p>
                  <p><strong>Description:</strong> Dark, moody aesthetic inspired by 1940s film noir</p>
                  <p><strong>Keywords:</strong> high contrast, dramatic shadows, black and white, chiaroscuro lighting, venetian blinds, rain-slicked streets, fedora hats, mystery</p>
                  <p><strong>Inspiration:</strong> Classic film noir movies, detective stories, Humphrey Bogart films</p>
                  <p><strong>Characteristics:</strong> Deep blacks, stark whites, minimal gray tones, strong directional lighting, urban night scenes, atmospheric fog or smoke</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-custom-effects">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>How to Create Custom Effects</CardTitle>
                  <CardDescription>Design and apply your own visual effects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What are Custom Effects?</h4>
                <p className="text-muted-foreground">
                  Custom effects allow you to create and save specific visual enhancements, filters, or transformations 
                  that you can reuse across different images. These can include color grading, lighting adjustments, 
                  texture overlays, or specialized artistic treatments.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to Create Custom Effects:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Navigate to the Effects or Image Enhancement tool from the sidebar</li>
                  <li>Upload a test image to preview your effect</li>
                  <li>Click "Create Custom Effect" or the "+" button</li>
                  <li>Give your effect a descriptive name (e.g., "Vintage Glow", "Dramatic Shadows")</li>
                  <li>Adjust the effect parameters:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Color adjustments (saturation, hue, temperature)</li>
                      <li>Lighting effects (brightness, contrast, exposure)</li>
                      <li>Filters and overlays (grain, vignette, blur)</li>
                      <li>Artistic treatments (sharpen, smooth, enhance details)</li>
                    </ul>
                  </li>
                  <li>Preview the effect in real-time on your test image</li>
                  <li>Fine-tune parameters until you achieve the desired look</li>
                  <li>Save your custom effect with tags for easy finding later</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Effect Parameters Explained:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Intensity:</strong> Controls how strong the effect is applied (0-100%)</li>
                  <li><strong>Blend Mode:</strong> How the effect mixes with the original image (overlay, multiply, screen)</li>
                  <li><strong>Color Grading:</strong> Adjust highlights, midtones, and shadows separately</li>
                  <li><strong>Texture:</strong> Add grain, noise, or pattern overlays</li>
                  <li><strong>Focus:</strong> Control sharpness, blur, or depth of field</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Creating Great Effects:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Test your effect on different types of images (portraits, landscapes, objects)</li>
                  <li>Keep effects subtle for professional results - less is often more</li>
                  <li>Create variations of the same effect with different intensity levels</li>
                  <li>Combine multiple simple effects to create complex looks</li>
                  <li>Name effects descriptively so you can find them easily later</li>
                  <li>Save the effect parameters for future reference or sharing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Using Your Custom Effects:</h4>
                <p className="text-muted-foreground mb-2">
                  Once saved, your custom effects appear in the effects library. Simply select any image, 
                  choose your custom effect from the list, and it will be applied instantly. You can adjust 
                  the intensity after applying, edit the effect parameters, or combine it with other effects 
                  for unique results.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Example Custom Effect:</h4>
                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <p><strong>Name:</strong> "Golden Hour Portrait"</p>
                  <p><strong>Description:</strong> Warm, dreamy portrait effect with soft glow</p>
                  <p><strong>Parameters:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• Temperature: +15 (warm)</li>
                    <li>• Contrast: -5 (softer)</li>
                    <li>• Highlights: +10 (glowing)</li>
                    <li>• Saturation: +8 (rich colors)</li>
                    <li>• Vignette: 20% (soft darkening at edges)</li>
                    <li>• Glow: 15% (soft light diffusion)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="guide-custom-background">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>How to Create Custom Background</CardTitle>
                  <CardDescription>Design and apply custom backgrounds to your images</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What are Custom Backgrounds?</h4>
                <p className="text-muted-foreground">
                  Custom backgrounds allow you to create, save, and reuse background designs for images where 
                  you've removed the original background. You can create solid colors, gradients, patterns, 
                  or even AI-generated scene backgrounds that match your creative vision.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to Create Custom Backgrounds:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Start by removing the background from your image using the Background Remover tool</li>
                  <li>Navigate to the "Add Background" or "Custom Background" section</li>
                  <li>Click "Create Custom Background" or the "+" button</li>
                  <li>Choose your background type:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li><strong>Solid Color:</strong> Pick any color using the color picker</li>
                      <li><strong>Gradient:</strong> Select multiple colors and direction</li>
                      <li><strong>Pattern:</strong> Choose from geometric or artistic patterns</li>
                      <li><strong>AI-Generated:</strong> Describe a scene to generate with AI</li>
                      <li><strong>Upload:</strong> Use your own image as background</li>
                    </ul>
                  </li>
                  <li>Customize the background settings:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Adjust blur amount for depth effect</li>
                      <li>Control brightness and contrast</li>
                      <li>Set opacity for transparency effects</li>
                      <li>Choose scaling and positioning</li>
                    </ul>
                  </li>
                  <li>Preview the background with your subject</li>
                  <li>Save the background with a descriptive name and tags</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Background Types Explained:</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Solid Color Background</p>
                    <p className="text-muted-foreground">Simple, clean backgrounds perfect for product photos or professional portraits</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Gradient Background</p>
                    <p className="text-muted-foreground">Smooth color transitions that add depth and visual interest</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">AI-Generated Scene</p>
                    <p className="text-muted-foreground">Describe a setting (beach, office, studio) and AI creates a matching background</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Pattern Background</p>
                    <p className="text-muted-foreground">Geometric or artistic patterns for creative and unique compositions</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Great Custom Backgrounds:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Match the lighting direction of your subject and background</li>
                  <li>Use complementary colors to make your subject stand out</li>
                  <li>Add a slight blur to backgrounds for professional depth of field</li>
                  <li>Consider the mood and context of your subject when choosing backgrounds</li>
                  <li>Create background sets for different purposes (social media, print, presentations)</li>
                  <li>Save frequently used backgrounds as presets for quick access</li>
                  <li>For AI backgrounds, be specific about lighting, time of day, and atmosphere</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Advanced Techniques:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Shadow Integration:</strong> Add realistic shadows to blend subject with background</li>
                  <li><strong>Color Matching:</strong> Use color picker to match background tones with subject</li>
                  <li><strong>Perspective Matching:</strong> Align background perspective with subject angle</li>
                  <li><strong>Atmospheric Effects:</strong> Add fog, haze, or lighting effects for realism</li>
                  <li><strong>Layering:</strong> Combine multiple backgrounds for complex scenes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Using Your Custom Backgrounds:</h4>
                <p className="text-muted-foreground mb-2">
                  Your saved custom backgrounds appear in your background library. After removing a background 
                  from any image, simply select your custom background from the library to apply it instantly. 
                  You can adjust the fit, scale, and position before finalizing. Edit or update your backgrounds 
                  anytime from the "My Backgrounds" section.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Example Custom Background:</h4>
                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <p><strong>Name:</strong> "Professional Studio Setup"</p>
                  <p><strong>Type:</strong> AI-Generated Scene</p>
                  <p><strong>Description:</strong> Clean, modern photography studio with soft lighting</p>
                  <p><strong>Prompt:</strong> "Professional photography studio, white cyclorama wall, soft box lighting from left, gentle shadows, clean and minimal, slightly blurred background"</p>
                  <p><strong>Settings:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• Blur: 30% (for depth)</li>
                    <li>• Brightness: +5</li>
                    <li>• Shadow: 20% (under subject)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <Card data-testid="tips-prompts">
            <CardHeader>
              <CardTitle>Crafting Effective Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Structure your prompts:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Subject:</strong> What is the main focus? (e.g., "a cat", "mountain landscape")</li>
                  <li><strong>Description:</strong> Add details (colors, size, mood, actions)</li>
                  <li><strong>Style:</strong> Specify artistic style (realistic, watercolor, digital art)</li>
                  <li><strong>Lighting:</strong> Describe the lighting (dramatic, soft, golden hour)</li>
                  <li><strong>Composition:</strong> Camera angle and framing (close-up, wide shot, aerial view)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Examples of good prompts:</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono">
                      "A majestic lion with a flowing mane, standing on a cliff at sunset, 
                      dramatic lighting, photorealistic style, golden hour, cinematic composition"
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono">
                      "Cozy coffee shop interior, warm lighting, plants on shelves, 
                      people reading books, watercolor painting style, soft colors"
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono">
                      "Futuristic city skyline at night, neon lights, flying cars, 
                      cyberpunk aesthetic, rain-wet streets, vibrant colors, digital art"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="tips-quality">
            <CardHeader>
              <CardTitle>Getting the Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Use high-quality source images:</strong> For image-to-image and background removal, 
                    start with clear, well-lit photos for best results.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Experiment with settings:</strong> Try different art styles, dimensions, 
                    and parameters to find what works best for your vision.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Use negative prompts:</strong> Specify what you don't want in the image 
                    to avoid unwanted elements.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Be patient:</strong> Complex images may take longer to generate. 
                    Wait for the process to complete for best quality.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <div>
                    <strong>Save your favorites:</strong> Keep track of successful prompts and settings 
                    by saving images to your favorites collection.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="tips-common-issues">
            <CardHeader>
              <CardTitle>Troubleshooting Common Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Image doesn't match prompt:</h4>
                  <p className="text-muted-foreground">
                    Try being more specific with details, use negative prompts to exclude unwanted elements, 
                    or try a different art style that better suits your vision.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Background removal not perfect:</h4>
                  <p className="text-muted-foreground">
                    Ensure good contrast between subject and background. Use well-lit images with clear edges. 
                    Complex backgrounds may require manual touch-ups.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Upscaled image looks blurry:</h4>
                  <p className="text-muted-foreground">
                    Some images have limits to how much detail can be recovered. Try smaller upscale factors 
                    or use enhancement options to improve sharpness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="getting-started" className="space-y-6">
          <Card data-testid="getting-started-welcome">
            <CardHeader>
              <CardTitle>Welcome to Visionary AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Visionary AI provides a comprehensive suite of AI-powered image generation and manipulation tools. 
                Whether you're creating art from scratch, transforming existing images, or enhancing your photos, 
                we've got you covered.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Quick Start Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Create an account or sign in to get started</li>
                  <li>Choose a tool from the sidebar or homepage</li>
                  <li>Follow the on-screen instructions for each tool</li>
                  <li>Generate, download, or save your creations</li>
                  <li>Explore the community gallery for inspiration</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="getting-started-features">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Customizable Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust quality, dimensions, styles, and more to get exactly what you want
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Multiple AI Models</h4>
                    <p className="text-sm text-muted-foreground">
                      Access different AI models optimized for various tasks and styles
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Save & Organize</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep your favorite creations organized in your personal gallery
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Custom Art Styles</h4>
                    <p className="text-sm text-muted-foreground">
                      Create and save your own art style presets for consistent results
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="getting-started-favorites">
            <CardHeader>
              <CardTitle>Managing Your Favorites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What are Favorites?</h4>
                <p className="text-muted-foreground">
                  Favorites is your personal gallery where you can save and organize all your best image creations. 
                  Keep track of successful prompts, styles, and images you want to reference or reuse later.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to use Favorites:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Click the heart icon on any generated image to add it to your favorites</li>
                  <li>Access your saved images anytime from the "Favorites" page in the sidebar</li>
                  <li>View the original prompt and settings used for each saved image</li>
                  <li>Download saved images or generate variations based on them</li>
                  <li>Remove images from favorites when you no longer need them</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pro Tips:</h4>
                <p className="text-muted-foreground">
                  Use favorites to build a collection of reference images, successful prompts, and style examples. 
                  This helps you maintain consistency across projects and quickly recreate successful results.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="getting-started-profile">
            <CardHeader>
              <CardTitle>Profile & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Your Profile:</h4>
                <p className="text-muted-foreground mb-2">
                  Customize your profile with personal information, display name, bio, location, and social media links. 
                  Access your profile from the sidebar or by clicking your avatar in the top navigation bar.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Profile Sections:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li><strong>Personal Information:</strong> Display name, bio, location, website, contact details</li>
                  <li><strong>Professional Details:</strong> Company, job title, professional links</li>
                  <li><strong>Social Links:</strong> Twitter, Instagram, LinkedIn, GitHub profiles</li>
                  <li><strong>Preferences:</strong> Language, timezone, date/time formats</li>
                  <li><strong>Privacy Settings:</strong> Profile visibility, email display, data sharing preferences</li>
                  <li><strong>Notification Settings:</strong> Email notifications, push notifications, marketing emails</li>
                  <li><strong>Generation Settings:</strong> Default image model, quality, size preferences</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Customizing Settings:</h4>
                <p className="text-muted-foreground">
                  Set your default preferences for image generation including model selection, image quality, 
                  dimensions, and whether to auto-save generations to favorites. These defaults will be 
                  pre-selected whenever you use the image generation tools.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="getting-started-messages">
            <CardHeader>
              <CardTitle>Messages & Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Stay Connected:</h4>
                <p className="text-muted-foreground">
                  The Messages feature allows you to receive important notifications, updates about your generations, 
                  and communications from the platform. Access messages from the sidebar menu.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Message Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Unread message indicator in the sidebar (red badge with count)</li>
                  <li>View all your messages in chronological order</li>
                  <li>Mark messages as read to keep your inbox organized</li>
                  <li>Receive notifications about generation completion and important updates</li>
                  <li>Get alerts about new features and platform improvements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="getting-started-custom-models">
            <CardHeader>
              <CardTitle>Custom Models & API Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What are Custom Models?</h4>
                <p className="text-muted-foreground">
                  Advanced users can integrate their own AI image generation models or connect to external APIs 
                  like Hugging Face. This allows you to use specialized models tailored to specific styles or use cases.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to Add Custom Models:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Navigate to your Profile settings</li>
                  <li>Find the "Custom Models" section</li>
                  <li>Click "Add New Model" or "+" button</li>
                  <li>Choose model type: Custom API or Hugging Face</li>
                  <li>Enter model name and API endpoint or Hugging Face model ID</li>
                  <li>Add API key if required (optional for public models)</li>
                  <li>Select request format (standard, OpenAI, or custom)</li>
                  <li>Save and activate your custom model</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Supported Integrations:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Hugging Face:</strong> Connect to any text-to-image model on Hugging Face</li>
                  <li><strong>Custom APIs:</strong> Integrate your own model endpoints</li>
                  <li><strong>Standard Format:</strong> Works with most image generation APIs</li>
                  <li><strong>OpenAI Format:</strong> Compatible with OpenAI API structure</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Using Custom Models:</h4>
                <p className="text-muted-foreground">
                  Once added, your custom models appear in the model selector alongside built-in models. 
                  You can activate/deactivate, edit, or delete custom models anytime from your profile settings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="getting-started-community">
            <CardHeader>
              <CardTitle>Community Gallery & Inspiration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Explore the Community:</h4>
                <p className="text-muted-foreground">
                  Browse the community gallery on the homepage to see what other creators are making. 
                  Filter by art style (Photography, Anime, 3D Render, Realistic, Abstract, Cartoon, Fantasy) 
                  to find images that match your interests.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Community Features:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Browse thousands of AI-generated images from the community</li>
                  <li>Filter by art style to find specific types of artwork</li>
                  <li>View prompts and settings used to create images (learn from others)</li>
                  <li>Get inspired by creative prompts and style combinations</li>
                  <li>Save community images to your favorites for reference</li>
                  <li>Share your best creations with the community</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Connect & Learn:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Join our social communities on Telegram, Twitter, Instagram, and Discord
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Share techniques and tips with other creators
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Get feedback on your work and improve your skills
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Stay updated on new features and platform improvements
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="getting-started-support">
            <CardHeader>
              <CardTitle>Support & Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Getting Help:</h4>
                <p className="text-muted-foreground mb-3">
                  Need assistance? We offer multiple ways to get support and find answers to your questions.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Guides & Tutorials:</strong> Comprehensive documentation (you're here!)</li>
                  <li><strong>FAQ:</strong> Frequently asked questions and quick answers</li>
                  <li><strong>Customer Support:</strong> Contact our support team for assistance</li>
                  <li><strong>Terms & Policies:</strong> Review our terms of service and policies</li>
                  <li><strong>About Us:</strong> Learn more about Visionary AI and our mission</li>
                  <li><strong>Contact:</strong> Reach out directly with questions or feedback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Quick Tips:</h4>
                <p className="text-muted-foreground">
                  Most common issues can be resolved by checking this guide, trying different prompts or settings, 
                  ensuring good quality source images, or clearing your browser cache. If problems persist, 
                  contact customer support through the sidebar menu.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
