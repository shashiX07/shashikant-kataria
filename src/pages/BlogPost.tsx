import { useParams, Link, Navigate } from "react-router-dom";
import { getBlogBySlug, getRelatedBlogs } from "@/utils/blogLoader";
import { Calendar, Clock, ArrowLeft, Tag, Eye, EyeOff, Type, Volume2, BookOpen, Highlighter, Plus, Minus, Bookmark, Copy, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";

// Helper: get the bounding rect of a selection
function getSelectionRect() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? rect : null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  // Reading Assist Tool state
  const [assistPos, setAssistPos] = useState<{ top: number; left: number } | null>(null);
  const [assistActive, setAssistActive] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryText, setGlossaryText] = useState('');
  const [displayedGlossary, setDisplayedGlossary] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [bookmarks, setBookmarks] = useState<Array<{id: string, text: string, position: number}>>([]);
  const [readingTime, setReadingTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const [wikipediaData, setWikipediaData] = useState<any>(null);
  const [isLoadingDef, setIsLoadingDef] = useState(false);
  const [toast, setToast] = useState<{message: string, visible: boolean}>({message: '', visible: false});
  const assistRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toast notification helper
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2000);
  };
  
  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const blog = getBlogBySlug(slug);

  // Hide nav/ads in focus mode and trigger fullscreen
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode');
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Fullscreen request failed:', err);
        });
      }
    } else {
      document.body.classList.remove('focus-mode');
      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.log('Exit fullscreen failed:', err);
        });
      }
    }
    return () => {
      document.body.classList.remove('focus-mode');
    };
  }, [focusMode]);

  // Click handler for blog text
  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;
    function handleTextClick(e: MouseEvent) {
      // Only trigger for text nodes
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.closest('.reading-assist-tooltip, .copy-code-btn, .glossary-modal')) return;
      // Get selection rect
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() || '';
        const rect = getSelectionRect();
        if (rect && text) {
          setSelectedText(text);
          setAssistPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX + rect.width / 2,
          });
          setAssistActive(true);
        } else {
          setAssistActive(false);
        }
      }, 0);
    }
    article.addEventListener('mouseup', handleTextClick);
    return () => article.removeEventListener('mouseup', handleTextClick);
  }, [blog?.html]);

  // Hide tooltip on scroll or click outside
  useEffect(() => {
    function hide(e: Event) {
      if (e.target instanceof HTMLElement && 
          (e.target.closest('.reading-assist-tooltip') || e.target.closest('.glossary-modal'))) {
        return;
      }
      setAssistActive(false);
      setGlossaryOpen(false);
    }
    if (assistActive) {
      window.addEventListener('scroll', hide, true);
      window.addEventListener('mousedown', hide);
    }
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('mousedown', hide);
    };
  }, [assistActive]);

  // Reading timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Start timer on mount
  useEffect(() => {
    setIsTimerRunning(true);
    return () => setIsTimerRunning(false);
  }, []);

  // Typing animation for glossary
  useEffect(() => {
    if (!glossaryOpen || !glossaryText) return;
    let i = 0;
    setDisplayedGlossary('');
    const timer = setInterval(() => {
      if (i < glossaryText.length) {
        setDisplayedGlossary(glossaryText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [glossaryOpen, glossaryText]);

  // Text-to-speech handler
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!selectedText) return;
    const utterance = new SpeechSynthesisUtterance(selectedText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Highlight text handler
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    try {
      const range = selection.getRangeAt(0);
      const selectedContent = range.cloneContents();
      const span = document.createElement('mark');
      span.style.backgroundColor = 'hsl(189 97% 55% / 0.3)';
      span.style.padding = '0.125rem 0.25rem';
      span.style.borderRadius = '0.25rem';
      span.style.transition = 'background-color 0.2s ease';
      
      // Try simple wrap first
      try {
        range.surroundContents(span);
      } catch {
        // For complex selections, create a styled span and replace
        span.appendChild(selectedContent);
        range.deleteContents();
        range.insertNode(span);
      }
      
      // Clear selection
      selection.removeAllRanges();
    } catch (e) {
      console.log('Could not highlight selection:', e);
    }
    setAssistActive(false);
  };

  // Glossary handler with Dictionary and Wikipedia APIs
  const handleGlossary = async () => {
    if (!selectedText) return;
    setIsLoadingDef(true);
    setGlossaryOpen(true);
    setDictionaryData(null);
    setWikipediaData(null);
    
    const word = selectedText.trim().split(' ')[0].toLowerCase(); // Get first word
    
    try {
      // Fetch from Dictionary API
      const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (dictResponse.ok) {
        const dictData = await dictResponse.json();
        setDictionaryData(dictData[0]);
      }
    } catch (error) {
      console.log('Dictionary API error:', error);
    }
    
    try {
      // Fetch from Wikipedia API
      const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedText)}`);
      if (wikiResponse.ok) {
        const wikiData = await wikiResponse.json();
        setWikipediaData(wikiData);
      }
    } catch (error) {
      console.log('Wikipedia API error:', error);
    }
    
    setIsLoadingDef(false);
  };

  // Font size handlers
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  // Bookmark handler
  const handleBookmark = () => {
    if (!selectedText) return;
    const id = Date.now().toString();
    const position = window.scrollY;
    setBookmarks(prev => [...prev, { id, text: selectedText.substring(0, 50), position }]);
    setAssistActive(false);
    showToast('✓ Bookmark added');
  };

  // Copy text handler
  const handleCopy = async () => {
    if (!selectedText) return;
    try {
      await navigator.clipboard.writeText(selectedText);
      showToast('✓ Text copied to clipboard');
    } catch (error) {
      showToast('✗ Failed to copy text');
    }
  };

  // Format reading time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Glossary Modal component with Dictionary and Wikipedia
  function GlossaryModal() {
    const modalRef = useRef<HTMLDivElement>(null);
    const [modalPos, setModalPos] = useState<{top: number, left: number}>();
    useEffect(() => {
      if (!glossaryOpen || !assistPos) return;
      const updatePosition = () => {
        const padding = 12;
        const modal = modalRef.current;
        if (!modal) return;
        const { innerWidth, innerHeight } = window;
        const rect = modal.getBoundingClientRect();
        let top = assistPos.top + 60;
        let left = assistPos.left;
        // Adjust horizontally
        if (left - rect.width / 2 < padding) {
          left = rect.width / 2 + padding;
        } else if (left + rect.width / 2 > innerWidth - padding) {
          left = innerWidth - rect.width / 2 - padding;
        }
        // Adjust vertically
        if (top + rect.height > innerHeight - padding) {
          top = innerHeight - rect.height - padding;
        }
        if (top < padding) top = padding;
        setModalPos({ top, left });
      };
      // Wait for modal to render
      setTimeout(updatePosition, 0);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }, [glossaryOpen, assistPos, glossaryText, isLoadingDef, dictionaryData, wikipediaData]);
    if (!glossaryOpen || !assistPos) return null;
    return createPortal(
      <div
        ref={modalRef}
        className="glossary-modal fixed z-[9999] max-h-[80vh] overflow-y-auto"
        style={{
          top: (modalPos?.top ?? assistPos.top + 60),
          left: (modalPos?.left ?? assistPos.left),
          transform: 'translate(-50%, 0)',
          background: 'rgba(24,24,27,0.98)',
          borderRadius: '1rem',
          boxShadow: '0 8px 40px 0 rgba(0,0,0,0.35)',
          padding: '1.5rem',
          maxWidth: '500px',
          minWidth: '350px',
          border: '1px solid rgba(189,147,249,0.3)',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors text-2xl leading-none"
          onClick={() => {
            setGlossaryOpen(false);
            setDictionaryData(null);
            setWikipediaData(null);
          }}
        >
          ×
        </button>

        {isLoadingDef && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoadingDef && (
          <div className="space-y-4">
            {/* Dictionary Section */}
            {dictionaryData && (
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-white">Dictionary</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-primary">{dictionaryData.word}</p>
                  {dictionaryData.phonetic && (
                    <p className="text-sm text-gray-400 italic">{dictionaryData.phonetic}</p>
                  )}
                  {dictionaryData.meanings?.slice(0, 2).map((meaning: any, idx: number) => (
                    <div key={idx} className="mt-2">
                      <p className="text-sm font-semibold text-secondary">{meaning.partOfSpeech}</p>
                      {meaning.definitions?.slice(0, 2).map((def: any, defIdx: number) => (
                        <p key={defIdx} className="text-sm text-white/90 mt-1 ml-4">
                          • {def.definition}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wikipedia Section */}
            {wikipediaData && wikipediaData.extract && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-bold text-white">Wikipedia</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-primary">{wikipediaData.title}</p>
                  <p className="text-sm text-white/90 leading-relaxed">{wikipediaData.extract}</p>
                  {wikipediaData.content_urls?.desktop?.page && (
                    <a
                      href={wikipediaData.content_urls.desktop.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-block mt-2"
                    >
                      Read more on Wikipedia →
                    </a>
                  )}
                </div>
              </div>
            )}

            {!isLoadingDef && !dictionaryData && !wikipediaData && (
              <div className="text-center py-4">
                <p className="text-white/60">No definitions found for "{selectedText}"</p>
              </div>
            )}
          </div>
        )}
      </div>,
      document.body
    );
  }

  // Reading Assist Tooltip component
  function ReadingAssistTooltip() {
    if (!assistActive || !assistPos) return null;
    return createPortal(
      <div
        ref={assistRef}
        className="reading-assist-tooltip fixed z-[9999]"
        style={{
          top: assistPos.top,
          left: assistPos.left,
          transform: 'translate(-50%, 0)',
          background: 'rgba(24,24,27,0.98)',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          minHeight: '44px',
        }}
        tabIndex={-1}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Focus Mode */}
        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title={focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
          onClick={e => {
            e.stopPropagation();
            setFocusMode(f => !f);
          }}
        >
          {focusMode ? (
            <Eye className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          ) : (
            <EyeOff className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          )}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {focusMode ? 'Exit Focus' : 'Focus Mode'}
          </span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Font Size Controls */}
        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Decrease font size"
          onClick={e => {
            e.stopPropagation();
            decreaseFontSize();
          }}
        >
          <Minus className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Smaller
          </span>
        </button>

        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Increase font size"
          onClick={e => {
            e.stopPropagation();
            increaseFontSize();
          }}
        >
          <Plus className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Larger
          </span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Text-to-Speech */}
        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
          onClick={e => {
            e.stopPropagation();
            handleSpeak();
          }}
        >
          <Volume2 className={`w-5 h-5 transition-colors ${isSpeaking ? 'text-green-400' : 'text-primary group-hover:text-primary/80'}`} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {isSpeaking ? 'Stop' : 'Read Aloud'}
          </span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Glossary */}
        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Show definition"
          onClick={e => {
            e.stopPropagation();
            handleGlossary();
          }}
        >
          <BookOpen className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Define
          </span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Highlight */}
        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Highlight text"
          onClick={e => {
            e.stopPropagation();
            handleHighlight();
          }}
        >
          <Highlighter className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Highlight
          </span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Bookmark */}
        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Bookmark this spot"
          onClick={e => {
            e.stopPropagation();
            handleBookmark();
          }}
        >
          <Bookmark className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Bookmark
          </span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Copy */}
        <button
          className="group focus:outline-none relative"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Copy text"
          onClick={e => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          <Copy className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 rounded px-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Copy
          </span>
        </button>
      </div>,
      document.body
    );
  }

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
    <div className={"min-h-screen mt-16 bg-background" + (focusMode ? ' focus-mode-active' : '')}>
      <Helmet>
        <title>{blog.title} | Shashikant Kataria</title>
        <meta name="description" content={blog.description} />
        <meta name="author" content={blog.author} />
        <meta property="og:title" content={blog.title + " | Shashikant Kataria"} />
        <meta property="og:description" content={blog.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://shashikant-kataria.vercel.app/blog/${blog.slug}`} />
        <meta property="og:image" content={`https://shashikant-kataria.vercel.app${blog.coverImage}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title + " | Shashikant Kataria"} />
        <meta name="twitter:description" content={blog.description} />
        <meta name="twitter:image" content={`https://shashikant-kataria.vercel.app${blog.coverImage}`} />
        <link rel="canonical" href={`https://shashikant-kataria.vercel.app/blog/${blog.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "image": `https://shashikant-kataria.vercel.app${blog.coverImage}`,
            "author": { "@type": "Person", "name": blog.author },
            "datePublished": blog.date,
            "description": blog.description,
            "url": `https://shashikant-kataria.vercel.app/blog/${blog.slug}`
          })}
        </script>
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button and Reading Timer */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/blog" className="inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          
          {/* Reading Timer */}
          <div className="flex items-center gap-3 bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
            <Timer className={`w-5 h-5 ${isTimerRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-sm font-mono font-semibold text-foreground">{formatTime(readingTime)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              {isTimerRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => setReadingTime(0)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

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
          style={{ fontSize: `${fontSize}px` }}
          className="prose prose-lg dark:prose-invert max-w-none transition-all duration-300
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
        {ReadingAssistTooltip()}
        {GlossaryModal()}

        {/* Toast Notification */}
        {toast.visible && createPortal(
          <div
            className="fixed bottom-8 right-8 z-[10000] bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
            style={{
              animation: toast.visible ? 'slideInUp 0.3s ease-out' : 'slideOutDown 0.3s ease-in'
            }}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>,
          document.body
        )}

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

        {/* Bookmarks Panel */}
        {bookmarks.length > 0 && (
          <>
            <Separator className="my-12" />
            <div className="my-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-primary" />
                Your Bookmarks ({bookmarks.length})
              </h2>
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <Card
                    key={bookmark.id}
                    className="p-4 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => window.scrollTo({ top: bookmark.position, behavior: 'smooth' })}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                          "{bookmark.text}..."
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to jump to this section
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBookmarks([])}
                  className="w-full"
                >
                  Clear All Bookmarks
                </Button>
              </div>
            </div>
          </>
        )}

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
