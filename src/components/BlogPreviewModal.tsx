import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


interface BlogPreviewModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}


const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({ open, onClose, url, style, onMouseEnter, onMouseLeave }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [modalStyle, setModalStyle] = React.useState<React.CSSProperties | undefined>(style);

  // Adjust modal position to always stay in viewport
  React.useEffect(() => {
    if (!open || !style) return;
    function adjustPosition() {
      const modalWidth = 420;
      const modalHeight = 340;
      const padding = 16;
      let { top, left } = style as { top: number; left: number };
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Clamp left
      left = Math.max(
        Math.min(left, window.scrollX + viewportWidth - modalWidth - padding),
        window.scrollX + padding
      );
      // Clamp top
      top = Math.max(
        Math.min(top, window.scrollY + viewportHeight - modalHeight - padding),
        window.scrollY + padding
      );
      setModalStyle({ ...style, top, left, zIndex: 1000 });
    }
    adjustPosition();
    window.addEventListener('scroll', adjustPosition, true);
    window.addEventListener('resize', adjustPosition);
    return () => {
      window.removeEventListener('scroll', adjustPosition, true);
      window.removeEventListener('resize', adjustPosition);
    };
  }, [open, style]);

  // Hide sidebar and start autoscroll when iframe loads
  React.useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;
    if (iframeLoaded && iframeRef.current) {
      const iframe = iframeRef.current;
      try {
        const inject = () => {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) return;
          // Hide sidebar (assume sidebar has class 'sidebar' or id 'sidebar')
          const style = doc.createElement('style');
          style.innerHTML = `
            #sidebar, .sidebar, nav[aria-label="Sidebar"], aside, .side-bar, .side_nav, .side, .left-sidebar, .leftNav, .sidebar-container, .sidebar-wrapper, .sidebarMenu, .sidebar-menu, .sidebar-nav, .sidebarNavigation, .sidebar__container, .sidebar__nav, .sidebar__menu {
              display: none !important;
              width: 0 !important;
              min-width: 0 !important;
              max-width: 0 !important;
              opacity: 0 !important;
              pointer-events: none !important;
              position: absolute !important;
              left: -9999px !important;
            }
            ::-webkit-scrollbar { display: none !important; width: 0 !important; }
            html { scrollbar-width: none !important; }
          `;
          doc.head.appendChild(style);
          // Auto-scroll using setInterval for reliability
          let scrollY = 0;
          const scrollStep = 1.2; // px per tick
          const scrollDelay = 16; // ms per tick (~60fps)
          function doScroll() {
            if (!iframe.contentWindow) return;
            const scrollable = doc.scrollingElement || doc.body;
            if (scrollY < scrollable.scrollHeight - iframe.clientHeight) {
              scrollY += scrollStep;
              iframe.contentWindow.scrollTo(0, scrollY);
            } else {
              clearInterval(scrollInterval!);
            }
          }
          setTimeout(() => {
            scrollY = iframe.contentWindow?.scrollY || 0;
            scrollInterval = setInterval(doScroll, scrollDelay);
          }, 600);
        };
        setTimeout(inject, 100);
      } catch (e) {
        // Cross-origin, do nothing
      }
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
      // Reset scroll if modal closes
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.scrollTo(0, 0);
        } catch {}
      }
    };
  }, [iframeLoaded]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="z-50"
          style={{
            position: 'absolute',
            ...modalStyle,
            pointerEvents: 'auto',
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={iframeLoaded ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, scale: 0.85, y: 40, filter: 'blur(8px)' }}
          exit={{ opacity: 0, scale: 0.85, y: 40, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, mass: 0.7, duration: 0.5 }}
        >
          <div className="relative w-[420px] h-[340px] bg-gradient-to-br from-primary/90 via-[#18181b] to-cyan-900/80 border-2 border-primary rounded-2xl flex flex-col items-center justify-center shadow-2xl shadow-primary/40 hover:shadow-3xl transition-shadow duration-300 overflow-hidden">
            <button
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-black rounded-full px-3 py-1 font-bold shadow"
              onClick={onClose}
              style={{ fontSize: 24, lineHeight: 1 }}
            >
              ×
            </button>
            <iframe
              ref={iframeRef}
              src={url}
              title="Blog Preview"
              className="w-full h-full border-0 rounded-2xl"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setIframeLoaded(true)}
              style={{ opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            />
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#18181b]">
                  {/* Shimmer Skeleton Loader */}
                  <div className="w-[90%] h-[80%] rounded-2xl bg-gradient-to-r from-[#23232b] via-[#23232b]/60 to-[#23232b] relative overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{backgroundSize: '200% 100%'}} />
                  </div>
                </div>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlogPreviewModal;
