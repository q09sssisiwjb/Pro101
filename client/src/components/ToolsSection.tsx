import { Link } from "wouter";

const tools = [
  {
    id: 1,
    name: "BG Remover",
    description: "Remove backgrounds instantly",
    link: "/bg-remover",
    icon: (
      <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    link: "/text-to-image",
    icon: (
      <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        <path d="M14 8.5L18 4.5"/>
        <path d="M18 4.5L14 4.5L14 8.5"/>
      </svg>
    )
  },
  {
    id: 3,
    name: "Sketch",
    description: "Transform photos to sketches",
    link: "/image-to-sketch",
    icon: (
      <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      </svg>
    )
  },
  {
    id: 4,
    name: "Upscaler",
    description: "Enhance image resolution",
    link: "/upscale",
    icon: (
      <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.37 3.63a2.12 2.12 0 0 1 3 3L12 16l-4 1 1-4Z"/>
      </svg>
    )
  },
  {
    id: 5,
    name: "Image-to-Image",
    description: "Transform existing images",
    link: "/image-to-image",
    icon: (
      <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    link: "/more-tools",
    icon: (
      <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12h8"/>
        <path d="M12 8v8"/>
      </svg>
    )
  }
];

const ToolsSection = () => {
  return (
    <section id="tools" className="pt-0 pb-0 bg-primary/5" data-testid="tools-section">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap gap-3 overflow-x-auto">
          {tools.map((tool) => {
            const ToolContainer = ({ children }: { children: React.ReactNode }) => {
              if (tool.link.startsWith('/')) {
                return (
                  <Link href={tool.link} className="block">
                    {children}
                  </Link>
                );
              } else {
                return (
                  <a href={tool.link} className="block">
                    {children}
                  </a>
                );
              }
            };
            
            return (
              <div 
                key={tool.id}
                className="flex-shrink-0 basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-[12.5%]"
                data-testid={`tool-card-${tool.id}`}
              >
                <ToolContainer>
                  <div 
                    className="group relative cursor-pointer h-full transition-all duration-200 hover:scale-105"
                  >
                    {/* Simplified Container */}
                    <div 
                      className="bg-card/50 backdrop-blur border border-border/50 rounded-xl hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                    ></div>
                    
                    {/* Simplified Inner Container */}
                    <div className="relative p-3 text-center space-y-2 h-full flex flex-col items-center justify-center rounded-xl">
                      {/* Simple Icon */}
                      <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors duration-200">
                        <div className="h-5 w-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                          {tool.icon}
                        </div>
                      </div>
                      
                      <h3 
                        className="text-xs font-medium text-foreground whitespace-nowrap group-hover:text-primary transition-colors duration-200"
                        data-testid={`tool-name-${tool.id}`}
                      >
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                </ToolContainer>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;