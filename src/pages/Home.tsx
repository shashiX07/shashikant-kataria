import { motion } from "framer-motion";
import React, { useRef, useState } from "react";
import BlogPreviewModal from "@/components/BlogPreviewModal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Mail, ArrowRight } from "lucide-react";

const Home = () => {
  // Modal state

  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const [modalPos, setModalPos] = useState<{top: number, left: number} | null>(null);
  const [hoveredCard, setHoveredCard] = useState<HTMLElement | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Blog card hover handlers
  const handleCardMouseEnter = (url: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    const card = e.currentTarget as HTMLElement;
    setHoveredCard(card);
    const rect = card.getBoundingClientRect();
    const modalWidth = 420;
    const modalHeight = 340;
    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let top = 0, left = 0;
    // Prefer below if enough space
    if (rect.bottom + modalHeight + padding < viewportHeight) {
      top = rect.bottom + window.scrollY + 12;
      left = rect.left + window.scrollX + rect.width / 2 - modalWidth / 2;
    } else {
      // Try right if enough space
      if (rect.right + modalWidth + padding < viewportWidth) {
        top = rect.top + window.scrollY + rect.height / 2 - modalHeight / 2;
        left = rect.right + window.scrollX + 12;
      } else if (rect.left - modalWidth - padding > 0) {
        // Otherwise, try left
        top = rect.top + window.scrollY + rect.height / 2 - modalHeight / 2;
        left = rect.left + window.scrollX - modalWidth - 12;
      } else {
        // Fallback: below, but clamp to viewport
        top = Math.min(rect.bottom + window.scrollY + 12, window.scrollY + viewportHeight - modalHeight - padding);
        left = Math.max(
          Math.min(rect.left + window.scrollX + rect.width / 2 - modalWidth / 2, window.scrollX + viewportWidth - modalWidth - padding),
          window.scrollX + padding
        );
      }
    }
    setModalUrl(url);
    setModalOpen(true);
    setModalPos({ top, left });
  };
  const handleCardMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    // Delay closing to allow mouse to enter modal
    closeTimeout.current = setTimeout(() => {
      setModalOpen(false);
      setModalUrl("");
      setModalPos(null);
      setHoveredCard(null);
    }, 200);
  };
  const handleModalEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };
  const handleModalLeave = () => {
    setModalOpen(false);
    setModalUrl("");
    setModalPos(null);
    setHoveredCard(null);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-28">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-lg md:text-xl text-muted-foreground mb-4">
                Hi, I'm
              </h2>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 glow-text">
                Shashikant Kataria
              </h1>
              <div className="text-2xl md:text-3xl gradient-text font-semibold mb-8">
                Blockchain Developer • Full Stack Engineer • Mobile Developer
              </div>
              <p className="text-xl text-muted-foreground mb-12">
                IIT Kharagpur, India
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-border"
                >
                  <Link to="/projects">
                    View My Projects <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Link to="/resume">
                    <Download className="mr-2 h-5 w-5" /> Download Resume
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  <Link to="/contact">
                    <Mail className="mr-2 h-5 w-5" /> Contact Me
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Floating tech icons */}
            <motion.div
              className="mt-20 flex flex-wrap gap-6 justify-center items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {["Solidity", "React", "FastAPI", "Flutter", "TypeScript", "Web3"].map(
                (tech, index) => (
                  <motion.div
                    key={tech}
                    className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:border-primary transition-colors cursor-default"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tech}
                  </motion.div>
                )
              )}
            </motion.div>
          </div>

        </div>
      </div>
      <div className="container mx-auto px-6 mt-32 mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Latest Blog Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Blog Card 1 */}
          <motion.div
            initial={{ opacity: 0, rotateY: 90, scale: 0.7 }}
            whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.7, duration: 0.8 }}
            onMouseEnter={e => handleCardMouseEnter("/blog/machine-learning-basics", e)}
            onMouseLeave={handleCardMouseLeave}
            style={{ position: 'relative' }}
          >
            <Link to="/blog/machine-learning-basic-python" className="group">
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:border-gradient-to-r hover:from-primary hover:to-pink-500 hover:shadow-pink-200/30 hover:scale-[1.03]">
                <img src="/blog-images/machine-learning-basics.png" alt="Python Basics for Machine Learning" className="h-56 w-full object-cover" />
                {/* Date badge */}
                <span className="absolute top-4 left-4 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 backdrop-blur-sm">Dec 10, 2024</span>
                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end">
                  {/* Overlay appears only on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 pointer-events-none" />
                  <div className="relative z-10 p-6 flex flex-col gap-2 items-start">
                    <h3
                      className="text-2xl font-bold text-white mb-0 drop-shadow-lg opacity-0 translate-y-10 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                      style={{ willChange: 'opacity, transform' }}
                    >
                      Python Basics for Machine Learning
                    </h3>
                    <p
                      className="text-white/80 text-base mb-0 drop-shadow opacity-0 translate-y-14 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-2"
                      style={{ willChange: 'opacity, transform' }}
                    >
                      A beginner-friendly guide to Python fundamentals for aspiring machine learning practitioners.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
          {/* Blog Card 2 */}
          <motion.div
            initial={{ opacity: 0, rotateY: 90, scale: 0.7 }}
            whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.7, duration: 0.8 }}
            onMouseEnter={e => handleCardMouseEnter("/blog/react-fastapi-fullstack", e)}
            onMouseLeave={handleCardMouseLeave}
            style={{ position: 'relative' }}
          >
            <Link to="/blog/react-fastapi-fullstack" className="group">
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:border-gradient-to-r hover:from-primary hover:to-pink-500 hover:shadow-pink-200/30 hover:scale-[1.03]">
                <img src="/blog-images/react-fastapi.jpg" alt="Building a Full Stack App with React and FastAPI" className="h-56 w-full object-cover" />
                <span className="absolute top-4 left-4 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 backdrop-blur-sm">Dec 8, 2024</span>
                <div className="absolute inset-0 flex flex-col justify-end">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 pointer-events-none" />
                  <div className="relative z-10 p-6 flex flex-col gap-2 items-start">
                    <h3
                      className="text-2xl font-bold text-white mb-0 drop-shadow-lg opacity-0 translate-y-10 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                      style={{ willChange: 'opacity, transform' }}
                    >
                      Building a Full Stack App with React and FastAPI
                    </h3>
                    <p
                      className="text-white/80 text-base mb-0 drop-shadow opacity-0 translate-y-14 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-2"
                      style={{ willChange: 'opacity, transform' }}
                    >
                      Learn how to build a modern full-stack application using React for the frontend and FastAPI for the backend.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
          {/* Blog Card 3 */}
          <motion.div
            initial={{ opacity: 0, rotateY: 90, scale: 0.7 }}
            whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.7, duration: 0.8 }}
            onMouseEnter={e => handleCardMouseEnter("/blog/iit-kharagpur-journey", e)}
            onMouseLeave={handleCardMouseLeave}
            style={{ position: 'relative' }}
          >
            <Link to="/blog/iit-kharagpur-journey" className="group">
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:border-gradient-to-r hover:from-primary hover:to-pink-500 hover:shadow-pink-200/30 hover:scale-[1.03]">
                <img src="/blog-images/iitkgp.jpeg" alt="My Journey at IIT Kharagpur" className="h-56 w-full object-cover" />
                <span className="absolute top-4 left-4 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 backdrop-blur-sm">Nov 25, 2024</span>
                <div className="absolute inset-0 flex flex-col justify-end">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 pointer-events-none" />
                  <div className="relative z-10 p-6 flex flex-col gap-2 items-start">
                    <h3
                      className="text-2xl font-bold text-white mb-0 drop-shadow-lg opacity-0 translate-y-10 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                      style={{ willChange: 'opacity, transform' }}
                    >
                      My Journey at IIT Kharagpur: Lessons from Campus Life
                    </h3>
                    <p
                      className="text-white/80 text-base mb-0 drop-shadow opacity-0 translate-y-14 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-2"
                      style={{ willChange: 'opacity, transform' }}
                    >
                      Reflections on my time at IIT Kharagpur - the challenges, growth, and invaluable lessons that shaped my career in technology and leadership.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
        <div className="flex justify-center">
          <Link to="/blog">
            <Button size="lg" className="px-8 text-lg font-semibold flex items-center gap-2">
              See All Blogs <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      {/* Blog Preview Modal (relative, no overlay) */}
      {modalOpen && modalPos && (
        <BlogPreviewModal
          open={modalOpen}
          onClose={handleModalLeave}
          url={modalUrl}
          style={{
            top: modalPos.top,
            left: modalPos.left,
            zIndex: 1000,
          }}
          onMouseEnter={handleModalEnter}
          onMouseLeave={handleModalLeave}
        />
      )}
    </>
)};

export default Home;
