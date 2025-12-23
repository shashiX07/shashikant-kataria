import { Link } from "react-router-dom";
import { getAllBlogs } from "@/utils/blogLoader";
import { Calendar, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useRef } from "react";
import BlogPreviewModal from "@/components/BlogPreviewModal";

import { Input } from "@/components/ui/input";

const Blog = () => {
  // Modal state for blog cards
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const [modalPos, setModalPos] = useState<{top: number, left: number} | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Blog card hover handlers
  const handleCardMouseEnter = (url: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    const card = e.currentTarget as HTMLElement;
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
    closeTimeout.current = setTimeout(() => {
      setModalOpen(false);
      setModalUrl("");
      setModalPos(null);
    }, 200);
  };
  const handleModalEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };
  const handleModalLeave = () => {
    setModalOpen(false);
    setModalUrl("");
    setModalPos(null);
  };

  const blogs = getAllBlogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    blogs.forEach(blog => {
      blog.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [blogs]);

  // Filter blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch = 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = !selectedTag || blog.tags?.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [blogs, searchTerm, selectedTag]);

  return (
    <div className="min-h-screen mt-5 bg-background">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="animate-fade-slide-up">
            <h1 className="text-4xl md:text-7xl font-bold mb-3 text-foreground tracking-tight leading-tight">
              Blog
            </h1>
          </div>
          <style>{`
            @keyframes fade-slide-up {
              from { opacity: 0; transform: translateY(32px); }
              to { opacity: 1; transform: none; }
            }
            .animate-fade-slide-up {
              animation: fade-slide-up 1.1s cubic-bezier(.4,0,.2,1) both;
            }
          `}</style>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <Input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No blogs found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.slug}
                onMouseEnter={e => handleCardMouseEnter(`/blog/${blog.slug}`, e)}
                onMouseLeave={handleCardMouseLeave}
                style={{ position: 'relative' }}
              >
                <Link
                  to={`/blog/${blog.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                    {blog.coverImage && (
                      <div className="w-full h-48 overflow-hidden bg-muted">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {blog.tags?.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(blog.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        {blog.readingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{blog.readingTime}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
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
          </div>
        )}

        {/* Blog Count */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>
            Showing {filteredBlogs.length} of {blogs.length} blog{blogs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog;
