"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      const event = new CustomEvent("next-route-start");
      window.dispatchEvent(event);
    };

    const handleRouteChangeComplete = () => {
      const event = new CustomEvent("next-route-complete");
      window.dispatchEvent(event);
    };

    // For client-side route transitions
    window.addEventListener("popstate", handleRouteChangeStart);
    
    // For link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link?.href && 
          !link.href.startsWith('javascript:') && 
          !link.href.includes('#') &&
          link.target !== '_blank' && 
          !e.ctrlKey && 
          !e.metaKey) {
        
        // Check if the link points to the current page
        const currentUrl = window.location.href.split('#')[0].split('?')[0];
        const clickedUrl = link.href.split('#')[0].split('?')[0];
        
        // Only trigger loading if navigating to a different page
        if (currentUrl !== clickedUrl) {
          handleRouteChangeStart();
        }
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    
    // Trigger route change complete when pathname or searchParams change
    handleRouteChangeComplete();

    return () => {
      window.removeEventListener("popstate", handleRouteChangeStart);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [pathname, searchParams]);

  return null;
}