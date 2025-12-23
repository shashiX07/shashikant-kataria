import { marked } from 'marked';
import matter from 'gray-matter';

// Import markdown files as raw text
import web3Md from '../blogs/getting-started-with-web3.md?raw';
import reactFastapiMd from '../blogs/react-fastapi-fullstack.md?raw';
import iitJourneyMd from '../blogs/iit-kharagpur-journey.md?raw';
import mlBasicPython from '../blogs/machine-learning-basics.md?raw';
import mlAdvancedPython from '../blogs/machine-learning-python-advance.md?raw';


// Map markdown files to slugs
const markdownFiles = {
  'getting-started-with-web3': web3Md,
  'react-fastapi-fullstack': reactFastapiMd,
  'iit-kharagpur-journey': iitJourneyMd,
  'machine-learning-basic-python': mlBasicPython,
  'machine-learning-advanced-python': mlAdvancedPython,
};

// Configure marked with custom renderer
const renderer = new marked.Renderer();

// Helper function to escape HTML
function escapeHtml(text) {
  if (typeof text !== 'string') {
    text = String(text);
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Helper to extract text from tokens
function getTextFromTokens(tokens) {
  if (typeof tokens === 'string') return tokens;
  if (!tokens) return '';
  if (Array.isArray(tokens)) {
    return tokens.map(token => {
      if (typeof token === 'string') return token;
      if (token.text) return token.text;
      if (token.raw) return token.raw;
      return '';
    }).join('');
  }
  if (tokens.text) return tokens.text;
  if (tokens.raw) return tokens.raw;
  return String(tokens);
}

// Custom code block renderer - marked v12+ uses object parameters
renderer.code = function(token) {
  const code = token.text || token.raw || '';
  const lang = token.lang || 'plaintext';
  // Wrap in a container for copy button and hover effect
  return `
    <div class="code-block-container group relative my-4">
      <pre class="language-${lang}"><code class="language-${lang}">${escapeHtml(code)}</code></pre>
    </div>
  `;
};

// Custom inline code renderer
renderer.codespan = function(token) {
  const code = token.text || token.raw || '';
  return `<code class="inline-code">${escapeHtml(code)}</code>`;
};

// Custom heading renderer with proper IDs for anchor links
renderer.heading = function(token) {
  const depth = token.depth;
  const text = getTextFromTokens(token.tokens);
  
  // Remove HTML tags and markdown formatting for clean ID
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/[*_`]/g, '');
  const id = cleanText.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `<h${depth} id="${id}" class="heading-anchor">${text}</h${depth}>`;
};

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  renderer: renderer,
});

/**
 * Parse all blog posts and return structured data
 * @returns {Array} Array of blog post objects with metadata and content
 */
export function getAllBlogs() {
  const blogs = [];
  

  for (const [slug, markdownContent] of Object.entries(markdownFiles)) {
    try {

      // Parse frontmatter from markdown
      const { data: frontmatter, content } = matter(markdownContent);
      
      // Convert markdown to HTML
      const html = marked.parse(content);
    
      // Generate table of contents
      const toc = generateTOC(content);
      
      // Calculate reading time
      const readingTime = getReadingTime(content);
      
      const blogPost = {
        slug,
        title: frontmatter.title || 'Untitled',
        description: frontmatter.description || '',
        author: frontmatter.author || 'Shashikant Kataria',
        tags: frontmatter.tags || [],
        coverImage: frontmatter.coverImage || '',
        html,
        toc,
        readingTime,
        // Ensure date is a Date object
        date: frontmatter.date ? new Date(frontmatter.date) : new Date(),
      };
      
      blogs.push(blogPost);
    } catch (error) {
      console.error('Error processing blog:', slug, error);
    }
  }

  
  // Sort by date (newest first)
  return blogs.sort((a, b) => b.date - a.date);
}

/**
 * Get a single blog post by slug
 * @param {string} slug - The blog post slug
 * @returns {Object|null} Blog post object or null if not found
 */
export function getBlogBySlug(slug) {
  const blogs = getAllBlogs();
  return blogs.find(blog => blog.slug === slug) || null;
}

/**
 * Get all unique tags from all blog posts
 * @returns {Array} Array of unique tags
 */
export function getAllTags() {
  const blogs = getAllBlogs();
  const tagsSet = new Set();
  
  blogs.forEach(blog => {
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach(tag => tagsSet.add(tag));
    }
  });
  
  return Array.from(tagsSet).sort();
}

/**
 * Get blogs filtered by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} Array of blog posts with the specified tag
 */
export function getBlogsByTag(tag) {
  const blogs = getAllBlogs();
  return blogs.filter(blog => 
    blog.tags && blog.tags.includes(tag)
  );
}

/**
 * Generate table of contents from markdown content
 * @param {string} markdown - Raw markdown content
 * @returns {Array} Array of heading objects with text, level, and id
 */
function generateTOC(markdown) {
  const headings = [];
  const lines = markdown.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/[*_`]/g, ''); // Remove markdown formatting
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      headings.push({ level, text, id });
    }
  });
  
  return headings;
}

/**
 * Get reading time estimate
 * @param {string} content - Blog content
 * @returns {number} Estimated reading time in minutes
 */
export function getReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get related blog posts based on shared tags
 * @param {string} currentSlug - The slug of the current blog post
 * @param {number} limit - Maximum number of related posts to return
 * @returns {Array} Array of related blog posts
 */
export function getRelatedBlogs(currentSlug, limit = 3) {
  const blogs = getAllBlogs();
  const currentBlog = blogs.find(blog => blog.slug === currentSlug);
  
  if (!currentBlog) return [];
  
  // Score blogs based on shared tags
  const scoredBlogs = blogs
    .filter(blog => blog.slug !== currentSlug)
    .map(blog => {
      const sharedTags = blog.tags.filter(tag => 
        currentBlog.tags.includes(tag)
      );
      return {
        ...blog,
        score: sharedTags.length
      };
    })
    .filter(blog => blog.score > 0)
    .sort((a, b) => {
      // Sort by score first, then by date
      if (b.score !== a.score) return b.score - a.score;
      return b.date - a.date;
    });
  
  return scoredBlogs.slice(0, limit);
}
