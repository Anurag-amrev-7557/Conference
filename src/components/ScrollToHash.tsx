import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToHash() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      
      if (element) {
        // Delay slightly to ensure content is rendered
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      // Scroll to top on route change if no hash
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key]);

  return null;
}
