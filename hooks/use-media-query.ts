import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  // Set initial state to false on server, true if it matches on client
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Client-side only
    if (typeof window !== "undefined") {
      // Create media query list
      const mediaQuery = window.matchMedia(query);
      // Set initial value
      setMatches(mediaQuery.matches);

      // Create event listener function
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add listener
      mediaQuery.addEventListener("change", handleChange);

      // Clean up
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [query]); // Re-run effect if query changes

  return matches;
}