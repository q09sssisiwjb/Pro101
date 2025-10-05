const guides = [
  {
    id: 1,
    title: "Join Our Community",
    description: "Connect with creators and share your AI-generated masterpieces",
    category: "Join",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=640&h=360",
    alt: "Community collaboration and networking"
  },
  {
    id: 2,
    title: "How to Enhance Images",
    description: "Master the art of AI-powered image enhancement and restoration",
    category: "Enhancement",
    image: "https://pixabay.com/get/gabc493aab5f4bdefc3dd20d9ec491b672d2f3c51926352d46297a393eb214c5ea03c243b8eaefc5369ce0ef14dde28c49df732c1649f4427b89faab6c634bc5c_1280.jpg",
    alt: "Professional image enhancement techniques"
  },
  {
    id: 3,
    title: "Advanced Sketch Techniques",
    description: "Explore professional methods for creating stunning artistic sketches",
    category: "Advanced",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=640&h=360",
    alt: "Advanced digital art and sketch techniques"
  },
  {
    id: 4,
    title: "Prompt Crafting Mastery",
    description: "Learn to write effective prompts for better AI-generated results",
    category: "Writing",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=640&h=360",
    alt: "Creative writing and prompt development"
  }
];

const FeaturedGuides = () => {
  return (
    <section id="guides" className="pt-0 pb-0" data-testid="guides-section">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground" data-testid="guides-title">
              Featured Guides
            </h2>
          </div>
          <a 
            href="#all-guides" 
            className="hidden md:inline-flex items-center text-primary hover:text-secondary transition-colors font-semibold"
            data-testid="link-view-all-guides"
          >
            View All
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth slider-container animate-slide-in">
          {guides.map((guide) => (
            <div 
              key={guide.id}
              className="flex-none w-80 group cursor-pointer relative transition-all duration-300"
              style={{
                borderRadius: '12px',
                padding: '1px',
                background: 'linear-gradient(135deg, hsla(253, 100%, 72%, 0.3), hsla(315, 100%, 70%, 0.3), hsla(253, 100%, 72%, 0.2))',
                boxShadow: '0 0 15px hsla(253, 100%, 72%, 0.2), 0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="bg-card rounded-[11px] overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 relative"
                data-testid={`guide-card-${guide.id}`}
              >
              {/* Card glow effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[hsla(253,100%,72%,0.05)] to-[hsla(315,100%,70%,0.05)] opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                style={{ 
                  boxShadow: '0 0 25px hsla(253, 100%, 72%, 0.3), 0 0 40px hsla(315, 100%, 70%, 0.2)',
                  filter: 'blur(1px)'
                }}
              ></div>
              <div className="aspect-[16/9] relative">
                <div className="relative w-full h-full overflow-hidden">
                  <img 
                    src={guide.image}
                    alt={guide.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                    data-testid={`guide-image-${guide.id}`}
                    style={{
                      filter: 'drop-shadow(0 0 10px hsla(253, 100%, 72%, 0.2))'
                    }}
                  />
                  {/* Image glow effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-all duration-300"
                    style={{ 
                      background: 'radial-gradient(circle at center, hsla(253, 100%, 72%, 0.1), hsla(315, 100%, 70%, 0.05))',
                      filter: 'blur(2px)'
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 bg-guide-overlay"></div>
                <div className="absolute top-4 left-4">
                  <span 
                    className="bg-gradient-purple-blue text-white px-3 py-1 rounded-full text-sm font-semibold"
                    data-testid={`guide-category-${guide.id}`}
                  >
                    {guide.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 
                    className="text-xl font-bold font-headline text-white mb-2"
                    data-testid={`guide-title-${guide.id}`}
                  >
                    {guide.title}
                  </h3>
                  <p 
                    className="text-gray-200 text-sm"
                    data-testid={`guide-description-${guide.id}`}
                  >
                    {guide.description}
                  </p>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGuides;
