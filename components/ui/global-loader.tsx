"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);
    };
    
    const handleComplete = () => {
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 400);
      
      return () => clearTimeout(timeout);
    };

    window.addEventListener("next-route-start", handleStart);
    window.addEventListener("next-route-complete", handleComplete);
    
    return () => {
      window.removeEventListener("next-route-start", handleStart);
      window.removeEventListener("next-route-complete", handleComplete);
    };
  }, []);

  // Auto progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading && progress < 90) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Gradually slow down as we approach 90%
          const increment = Math.max(1, 10 * (1 - prevProgress / 100));
          const newProgress = Math.min(90, prevProgress + increment);
          return newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, progress]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <>
          {/* Progress bar at the top */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 z-50 bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ 
                duration: 0.3, 
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Subtle backdrop blur */}
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none bg-background/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Centered spinner */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-4 shadow-sm">
              <svg 
                className="w-8 h-8 text-primary" 
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Loading"
              >
                <motion.path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, rotate: 360 }}
                  transition={{
                    pathLength: { 
                      repeat: Infinity,
                      duration: 1.5, 
                      ease: "easeInOut" 
                    },
                    rotate: { 
                      repeat: Infinity, 
                      duration: 1.5,
                      ease: "linear"
                    }
                  }}
                />
              </svg>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}