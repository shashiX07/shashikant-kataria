import { useParams, Link, Navigate } from "react-router-dom";
import { getBlogBySlug, getRelatedBlogs } from "@/utils/blogLoader";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const blog = getBlogBySlug(slug);

  // Update document title and meta tags
  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | Shashikant Kataria`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', blog.description);
      }

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', blog.title);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', blog.description);
      }

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && blog.coverImage) {
        ogImage.setAttribute('content', blog.coverImage);
      }

      // Update Twitter Card tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', blog.title);
      }

      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', blog.description);
      }
    }

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = "Shashikant Kataria | Full Stack Developer";
    };
  }, [blog]);

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    // Remove any existing copy buttons to avoid duplicates
    article.querySelectorAll(".copy-code-btn").forEach(btn => btn.remove());
    // Find all code block containers
    article.querySelectorAll(".code-block-container").forEach((container) => {
      const pre = container.querySelector("pre");
      if (!pre || container.querySelector(".copy-code-btn")) return;
      // Create the button
      const button = document.createElement("button");
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" fill="currentColor" fill-opacity="0.1"/><rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/></svg>Copy code`;
      button.className = "copy-code-btn absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md bg-black/80 text-xs text-white font-semibold border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 hover:bg-primary hover:text-white";
      button.type = "button";
      button.style.pointerEvents = "auto";
      button.onclick = () => {
        const code = pre.querySelector("code");
        if (code) {
          navigator.clipboard.writeText(code.innerText);
          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke="currentColor" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Copied!`;
          button.classList.add("bg-green-600");
          setTimeout(() => {
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" fill="currentColor" fill-opacity="0.1"/><rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/></svg>Copy code`;
            button.classList.remove("bg-green-600");
          }, 1200);
        }
      };
      // Ensure container is relative for absolute positioning
      container.classList.add("relative", "group");
      pre.classList.add("pr-16");
      container.appendChild(button);
    });
  }, [blog?.html]);

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Link to="/blog" className="inline-block mb-8">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8 bg-muted">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Blog Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {blog.title}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            {blog.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(blog.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            {blog.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blog.readingTime}</span>
              </div>
            )}
            {blog.author && (
              <div>
                <span>By {blog.author}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {blog.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </div>

        {/* Table of Contents */}
        {blog.toc && blog.toc.length > 0 && (
          <Card className="p-8 mb-10 bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-primary/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Table of Contents
            </h2>
            <ul className="space-y-3">
              {blog.toc.map((item: { level: number; text: string; id: string }) => (
                <li
                  key={item.id}
                  style={{ 
                    marginLeft: `${(item.level - 1) * 1.5}rem`,
                    fontSize: item.level === 1 ? '1rem' : item.level === 2 ? '0.95rem' : '0.9rem'
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-foreground hover:text-primary transition-all duration-200 font-medium hover:underline underline-offset-4 flex items-start gap-2 group"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        window.history.pushState(null, '', `#${item.id}`);
                      }
                    }}
                  >
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Blog Content */}
        <article
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
            prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-6
            prose-p:text-base prose-p:leading-relaxed prose-p:mb-6 prose-p:text-muted-foreground
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
            prose-code:text-pink-500 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:my-6
            prose-pre:shadow-xl
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-6
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
            prose-li:text-muted-foreground prose-li:leading-relaxed
            prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-8
            prose-hr:border-border prose-hr:my-12
            prose-table:w-full prose-table:my-6
            prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
            prose-td:p-3 prose-td:border-t prose-td:border-border"
          dangerouslySetInnerHTML={{ __html: blog.html }}
        />

        {/* Related Posts */}
        <Separator className="my-12" />
        
        {(() => {
          const relatedBlogs = getRelatedBlogs(slug);
          return relatedBlogs.length > 0 && (
            <div className="my-12">
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog: any) => (
                  <Link
                    key={relatedBlog.slug}
                    to={`/blog/${relatedBlog.slug}`}
                    className="group"
                  >
                    <Card className="h-full p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {relatedBlog.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(relatedBlog.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {relatedBlog.readingTime && (
                          <>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{relatedBlog.readingTime} min read</span>
                          </>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <Separator className="my-12" />
        
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Thanks for reading! If you found this helpful, feel free to share it.
          </p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View More Posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
