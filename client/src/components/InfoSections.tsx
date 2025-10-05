const infoSections = [
  {
    id: 1,
    title: "FAQ",
    description: "Common questions",
    href: "#faq",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
      </svg>
    )
  },
  {
    id: 2,
    title: "Terms",
    description: "Terms of service",
    href: "#terms",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    )
  },
  {
    id: 3,
    title: "About Us",
    description: "Our story & mission",
    href: "#about",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    )
  },
  {
    id: 4,
    title: "Contact Us",
    description: "Get in touch",
    href: "#contact",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    )
  }
];

const InfoSections = () => {
  return (
    <section className="py-16" data-testid="info-sections">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-in">
          {infoSections.map((section) => (
            <a 
              key={section.id}
              href={section.href}
              className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 text-center"
              data-testid={`info-card-${section.id}`}
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                {section.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors" data-testid={`info-title-${section.id}`}>
                {section.title}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`info-description-${section.id}`}>
                {section.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoSections;
