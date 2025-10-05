import { useState, useRef, useEffect } from 'react';
import { Plus, Image, Zap, Eraser, RefreshCw, PenTool } from 'lucide-react';
import { useLocation } from 'wouter';

const ChatButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [, setLocation] = useLocation();

  const menuItems = [
    { icon: Image, label: 'Generate Image', action: () => setLocation('/text-to-image') },
    { icon: Zap, label: 'Upscale', action: () => setLocation('/upscale') },
    { icon: Eraser, label: 'Remove BG', action: () => setLocation('/bg-remover') },
    { icon: RefreshCw, label: 'Image to Image', action: () => setLocation('/image-to-image') },
    { icon: PenTool, label: 'Sketch', action: () => setLocation('/image-to-sketch') },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Dropup Menu */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute bottom-16 right-0 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden transform origin-bottom-right transition-all duration-200 ease-out"
          data-testid="plus-menu-dropdown"
        >
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item.action)}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                data-testid={`menu-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <IconComponent className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Plus Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`w-14 h-14 bg-gradient-purple-pink hover:opacity-90 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 ${isMenuOpen ? 'rotate-45' : 'rotate-0'}`}
        data-testid="plus-button"
        aria-label="Open tools menu"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>
    </div>
  );
};

export default ChatButton;
