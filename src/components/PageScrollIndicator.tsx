import { useEffect, useState } from "react";

const PageScrollIndicator = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scrollContainer = document.querySelector('.page-scroll-container') || window;

    const handleScroll = () => {
      let scrollTop, scrollHeight, clientHeight;
      if (scrollContainer instanceof Window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        scrollTop = scrollContainer.scrollTop;
        scrollHeight = scrollContainer.scrollHeight;
        clientHeight = scrollContainer.clientHeight;
      }
      const percent = scrollHeight - clientHeight > 0 ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
      setProgress(percent);
    };

    if (scrollContainer instanceof Window) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    }
    handleScroll();

    return () => {
      if (scrollContainer instanceof Window) {
        window.removeEventListener("scroll", handleScroll);
      } else {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "4px",
        zIndex: 2147483647, // max z-index
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, var(--tw-gradient-from, #6366f1), var(--tw-gradient-via, #a21caf), var(--tw-gradient-to, #ec4899))",
          transition: "width 0.2s cubic-bezier(.4,0,.2,1)",
          borderRadius: "2px",
          boxShadow: "0 1px 6px 0 rgba(0,0,0,0.08)",
        }}
      />
    </div>
  );
};

export default PageScrollIndicator;