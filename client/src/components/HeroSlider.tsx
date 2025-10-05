
const tools = [
  {
    id: 1,
    name: "BG Remover",
    description: "Remove backgrounds instantly",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    )
  },
  {
    id: 2,
    name: "Text-to-Image",
    description: "Generate images from text",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
      </svg>
    )
  },
  {
    id: 3,
    name: "Sketch",
    description: "Transform photos to sketches",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      </svg>
    )
  },
  {
    id: 4,
    name: "Upscaler",
    description: "Enhance image resolution",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.37 3.63a2.12 2.12 0 0 1 3 3L12 16l-4 1 1-4Z"/>
      </svg>
    )
  },
  {
    id: 5,
    name: "Image-to-Image",
    description: "Transform existing images",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="m3 11 4-4 4 4"/>
        <path d="m21 13-4 4-4-4"/>
        <path d="M7 11V7a2 2 0 0 1 2-2h2"/>
        <path d="M17 13v4a2 2 0 0 1-2 2h-2"/>
      </svg>
    )
  },
  {
    id: 6,
    name: "More Tools",
    description: "Discover additional features",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12h8"/>
        <path d="M12 8v8"/>
      </svg>
    )
  }
];

const slides = [
  {
    id: 1,
    title: "AI Text-to-Image Generator",
    description: "Transform your ideas into stunning visuals. Describe what you want to see, and let our AI bring it to life in seconds.",
    buttonText: "Start Creating",
    image: "https://images.unsplash.com/photo-1547954575-855750c57bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080",
    alt: "AI Text-to-Image Generator Interface"
  },
  {
    id: 2,
    title: "Background Remover",
    description: "Remove backgrounds from any image instantly with AI precision. Perfect for product photos, portraits, and more.",
    buttonText: "Remove Background",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080",
    alt: "Background Remover Tool Interface"
  },
  {
    id: 3,
    title: "AI Image Upscaler",
    description: "Enhance image quality and resolution up to 4x with advanced AI algorithms. Restore details and clarity effortlessly.",
    buttonText: "Upscale Image",
    image: "https://pixabay.com/get/g5955406de0568825945ced8402e8a29a3b8524b6df980719501961c76e09f8dfe97c9dbf1c9448244461750bc2b1ca71bbaf1098c60f68fac8e90f140de9b5d9_1280.jpg",
    alt: "AI Image Upscaler Technology"
  },
  {
    id: 4,
    title: "Image-to-Sketch Converter",
    description: "Transform photos into beautiful pencil sketches and artistic drawings. Create stunning artwork from any image.",
    buttonText: "Create Sketch",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080",
    alt: "Image to Sketch Conversion Art"
  }
];

const HeroSlider = () => {

  // Show only the first slide
  const slide = slides[0];

  return (
    <section className="relative w-full overflow-hidden" data-testid="hero-slider">
      <div className="w-full bg-background rounded-[10px] overflow-hidden">
        <div className="aspect-[3/1] md:aspect-[5/1] w-full relative">
          <img 
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
            data-testid="slide-image-0"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
