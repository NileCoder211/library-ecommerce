// components/ScrollToTop.jsx

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router doesn't reset scroll position on navigation by default —
// this fixes that by scrolling to top whenever the pathname changes.
// Render it once, inside <BrowserRouter>, alongside your routes.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;