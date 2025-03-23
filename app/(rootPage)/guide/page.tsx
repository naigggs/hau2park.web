'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaQuery } from '@/hooks/use-media-query'
import Header from "@/components/shared/landing/header"
import Footer from "@/components/shared/landing/footer"
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Book,
  Home,
  Menu,
  FileText,
  Maximize,
  MoveHorizontal,
  X
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Create a VisuallyHidden component for screen reader text
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
      {children}
    </span>
  );
};

// Map of page numbers to section names from the table of contents
const sectionNames: { [key: number]: string } = {
  3: "Introduction",
  4: "Getting Started",
  7: "Guest Parking Request Process",
  9: "User Registration And Access",
  11: "Administrator/Staff Portal",
  17: "HAU2PARK AI Chatbot",
  23: "Real-Time Monitoring and Verification",
  24: "Policies, Security, and Support"
};

// Helper function to get section name
const getSectionName = (pageNum: number) => {
  // Adjust for offset (we start at page 3 in the array, which is page 1 in the manual)
  const adjustedPage = pageNum - 2;
  
  // Find the closest section that starts at or before this page
  const sectionStarts = Object.keys(sectionNames).map(Number).sort((a, b) => a - b);
  const sectionStart = sectionStarts.filter(start => start <= pageNum).pop() || 3;
  
  return `${adjustedPage}: ${sectionNames[sectionStart] || "Appendix"}`;
};

// Image Viewer with Zoom and Pan Controls - Now with full scrollable support
const ImageViewer = ({ src, alt }: { src: string; alt: string }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3)); // Limit max zoom to 3x
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5)); // Limit min zoom to 0.5x
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault(); // Prevent browser's default drag behavior
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      setPosition({
        x: newX,
        y: newY
      });
      e.preventDefault(); // Prevent scroll while dragging
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Close button - top right */}
      <div 
        className="absolute top-0 right-0 m-4 z-30"
      >
        <DialogClose asChild>
          <Button variant="outline" size="icon" className="rounded-full bg-white/90 dark:bg-black/90">
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </div>
      
      {/* Zoom controls - top left */}
      <div 
        className="absolute top-0 left-0 m-4 z-30 flex gap-2"
      >
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="rounded-full bg-white/90 dark:bg-black/90"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleResetZoom}
          className="rounded-full bg-white/90 dark:bg-black/90"
        >
          <MoveHorizontal className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className="rounded-full bg-white/90 dark:bg-black/90"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      
      {/* The main container that enables scrolling when zoomed */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-auto"
      >
        {/* Content wrapper with dynamic size based on zoom level */}
        <div
          ref={contentRef}
          className={`relative w-full h-full min-h-full ${scale > 1 ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            minWidth: `${100 * scale}%`,
            minHeight: `${100 * scale}%`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image container with transform applied */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              transformOrigin: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={src}
              alt={alt}
              className="object-contain max-w-full max-h-full"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ManualPage = () => {
  const [currentPage, setCurrentPage] = useState(3) // Start from page 3 (after title and TOC)
  const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false)
  const [imageError, setImageError] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")
  const totalPages = 24

  // Check if fullscreen API is available (only used in mobile view now)
  useEffect(() => {
    if (document.fullscreenEnabled) {
      setIsFullscreenEnabled(true)
    }
  }, [])

  // Function to handle fullscreen toggle (only used in mobile view now)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Go fullscreen
      const docElement = document.documentElement
      if (docElement.requestFullscreen) {
        docElement.requestFullscreen()
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Function to handle page change
  const handlePageChange = (page: number) => {
    if (page >= 3 && page <= totalPages) {
      setCurrentPage(page)
      setImageError(false) // Reset error state when changing page
      
      // On mobile, scroll to the manual section when changing pages
      if (isMobile) {
        const manualSection = document.getElementById('manual-section')
        if (manualSection) {
          manualSection.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-900">
      <Header />
      
      {/* Hero section with title and TOC */}
      <section className="w-full py-8 md:py-16 lg:py-24 relative">
        <div className="container px-4 md:px-6 mx-auto space-y-6 md:space-y-8 text-center">
          <div className="flex flex-col items-center text-center space-y-3 mx-auto">
            <div className="inline-block p-1.5 px-3 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium mb-2">
              Documentation
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
              HAU2Park User Manual
            </h1>
            <p className="text-sm md:text-base lg:text-xl text-muted-foreground max-w-[42rem] mx-auto">
              Complete guide to using the HAU2Park parking management system
            </p>
          </div>

          {/* Title Page and TOC in a nice card layout - swipeable on mobile */}
          {isMobile ? (
            <div className="mt-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory flex justify-center space-x-4 scrollbar-hide">
              <motion.div 
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700 flex-shrink-0 w-[280px] snap-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="aspect-[4/5] relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="absolute inset-0 cursor-zoom-in">
                        <img 
                          src="/user-manual/1.png" 
                          alt="HAU2Park User Manual Title Page" 
                          className="absolute inset-0 w-full h-full object-contain p-4"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/10 dark:bg-white/10 backdrop-blur-sm p-2 rounded-full">
                          <ZoomIn className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 rounded-lg overflow-hidden">
                      <DialogTitle className="sr-only">HAU2Park User Manual Title Page</DialogTitle>
                      <ImageViewer 
                        src="/user-manual/1.png"
                        alt="HAU2Park User Manual Title Page"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-3 text-center border-t border-gray-200 dark:border-zinc-700">
                  <h3 className="font-semibold text-sm">Title Page</h3>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700 flex-shrink-0 w-[280px] snap-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="aspect-[4/5] relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="absolute inset-0 cursor-zoom-in">
                        <img 
                          src="/user-manual/2.png" 
                          alt="Table of Contents" 
                          className="absolute inset-0 w-full h-full object-contain p-4"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/10 dark:bg-white/10 backdrop-blur-sm p-2 rounded-full">
                          <ZoomIn className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 rounded-lg overflow-hidden">
                      <DialogTitle className="sr-only">HAU2Park User Manual Table of Contents</DialogTitle>
                      <ImageViewer 
                        src="/user-manual/2.png"
                        alt="Table of Contents"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-3 text-center border-t border-gray-200 dark:border-zinc-700">
                  <h3 className="font-semibold text-sm">Table of Contents</h3>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-center gap-4 mt-12 mx-auto max-w-5xl">
              <motion.div 
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700 w-full max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="aspect-[4/5] relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="absolute inset-0 cursor-zoom-in">
                        <img 
                          src="/user-manual/1.png" 
                          alt="HAU2Park User Manual Title Page" 
                          className="absolute inset-0 w-full h-full object-contain p-4"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/10 dark:bg-white/10 backdrop-blur-sm p-2 rounded-full">
                          <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 rounded-lg overflow-hidden">
                      <DialogTitle className="sr-only">HAU2Park User Manual Title Page</DialogTitle>
                      <ImageViewer 
                        src="/user-manual/1.png"
                        alt="HAU2Park User Manual Title Page"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-4 text-center border-t border-gray-200 dark:border-zinc-700">
                  <h3 className="font-semibold">Title Page</h3>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700 w-full max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="aspect-[4/5] relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="absolute inset-0 cursor-zoom-in">
                        <img 
                          src="/user-manual/2.png" 
                          alt="Table of Contents" 
                          className="absolute inset-0 w-full h-full object-contain p-4"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/10 dark:bg-white/10 backdrop-blur-sm p-2 rounded-full">
                          <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 rounded-lg overflow-hidden">
                      <DialogTitle className="sr-only">HAU2Park User Manual Table of Contents</DialogTitle>
                      <ImageViewer 
                        src="/user-manual/2.png"
                        alt="Table of Contents"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-4 text-center border-t border-gray-200 dark:border-zinc-700">
                  <h3 className="font-semibold">Table of Contents</h3>
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Mobile indicator for horizontal scrolling */}
          {isMobile && (
            <div className="flex justify-center mt-1">
              <div className="flex space-x-1">
                <div className="w-8 h-1.5 rounded-full bg-blue-500"></div>
                <div className="w-8 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Manual Pages - Paginated Section */}
      <section id="manual-section" className="w-full py-8 md:py-16 bg-white dark:bg-zinc-900 border-t border-b border-gray-200 dark:border-zinc-800">
        <div className="container px-4 md:px-6 mx-auto">
          {/* Navigation Bar - Different for Mobile and Desktop */}
          {isMobile ? (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Book className="h-4 w-4" />
                <span>Page {currentPage - 2} of {totalPages - 2}</span>
              </div>
              
              <div className="flex space-x-2">
                {/* Mobile actions with sheet for page selection */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
                    <SheetHeader className="mb-4 text-center">
                      <SheetTitle>Jump to Page</SheetTitle>
                      <SheetDescription>
                        Select a page from the manual to view
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto pb-safe max-h-[calc(60vh-100px)]">
                      {[...Array(totalPages - 2)].map((_, i) => {
                        const pageNum = i + 3;
                        const sectionName = Object.keys(sectionNames).includes(pageNum.toString()) 
                          ? sectionNames[pageNum]
                          : null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            className={`h-12 text-sm ${sectionName ? "font-medium border-blue-200 dark:border-blue-800" : ""} overflow-hidden`}
                            onClick={() => {
                              handlePageChange(pageNum);
                              document.querySelector('[data-radix-focus-guard]')?.closest('button')?.click();
                            }}
                          >
                            {sectionName ? (
                              <div className="flex flex-col text-xs w-full">
                                <span className="truncate w-full">Page {pageNum - 2}</span>
                                <span className="truncate w-full text-[10px]">{sectionName}</span>
                              </div>
                            ) : (
                              <span className="truncate w-full">Page {pageNum - 2}</span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Book className="h-4 w-4" />
                <span>Page {currentPage - 2} of {totalPages - 2}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Jump to specific page (useful for longer manuals) */}
                <Select
                  value={currentPage.toString()}
                  onValueChange={(value) => handlePageChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Jump to page" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(totalPages - 2)].map((_, i) => {
                      const pageNum = i + 3;
                      return (
                        <SelectItem key={pageNum} value={pageNum.toString()}>
                          {getSectionName(pageNum)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Manual Page Display */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl mx-auto">
              <div className="relative bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-[4/5] w-full relative"
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="w-full h-full cursor-zoom-in relative">
                          {imageError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium mb-2">Image could not be loaded</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Please try again later or contact support
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Using regular img tag for more reliability */}
                              <img
                                src={`/user-manual/${currentPage}.png`}
                                alt={`User Manual Page ${currentPage - 2}`}
                                className="absolute inset-0 w-full h-full object-contain p-4"
                                onError={() => setImageError(true)}
                              />
                              <div className="absolute bottom-4 right-4 bg-black/10 dark:bg-white/10 backdrop-blur-sm p-2 rounded-full">
                                <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                              </div>
                            </>
                          )}
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 rounded-lg overflow-hidden">
                        <DialogTitle className="sr-only">User Manual Page {currentPage - 2}</DialogTitle>
                        <ImageViewer 
                          src={`/user-manual/${currentPage}.png`}
                          alt={`User Manual Page ${currentPage - 2}`}
                        />
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                </AnimatePresence>
                
                {/* Page navigation buttons - positioned over the image */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-black/70 h-10 w-10 md:h-12 md:w-12"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 3}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-black/70 h-10 w-10 md:h-12 md:w-12"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Pagination - Mobile optimized */}
          <div className="mt-6 md:mt-8 flex justify-center">
            {isMobile ? (
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 3}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="font-medium">
                  {currentPage - 2} / {totalPages - 2}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage <= 3 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages - 2)].map((_, i) => {
                    const pageNum = i + 3;
                    
                    // Desktop/tablet pagination display logic
                    if (isTablet) {
                      // Show more pages on tablet but still limit
                      if (pageNum < currentPage - 2 || pageNum > currentPage + 2) {
                        if (pageNum !== 3 && pageNum !== totalPages) {
                          return null;
                        }
                      }
                    } else {
                      // Desktop - skip some pages if too many
                      if (totalPages > 12 && (
                        (pageNum > 5 && pageNum < currentPage - 2) || 
                        (pageNum > currentPage + 2 && pageNum < totalPages - 3)
                      )) {
                        if (pageNum === 6 || pageNum === totalPages - 4) {
                          return (
                            <PaginationItem key={pageNum}>
                              <span className="px-4 py-2">...</span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <Button 
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="icon"
                          className="w-10 h-10"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum - 2}
                        </Button>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
          
          {/* Current section name display (centered) */}
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Current section: {getSectionName(currentPage).split(': ')[1]}
            </p>
          </div>
          
          {/* Page Info & Minimap (desktop only) */}
          {!isMobile && (
            <div className="mt-12 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700 max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium">Current Section</h3>
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage - 2} of {totalPages - 2}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Current page indicator */}
                  <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
                    {[...Array(totalPages - 2)].map((_, i) => {
                      const pageNum = i + 3;
                      const isSection = Object.keys(sectionNames).includes(pageNum.toString());
                      
                      return (
                        <div
                          key={pageNum}
                          className={`h-1.5 rounded-full transition-all cursor-pointer hover:opacity-100 ${
                            currentPage === pageNum
                              ? 'w-6 bg-primary'
                              : isSection 
                                ? 'w-4 bg-blue-400 dark:bg-blue-600 opacity-80' 
                                : 'w-3 bg-gray-300 dark:bg-zinc-700 opacity-70'
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                          title={getSectionName(pageNum)}
                        />
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handlePageChange(3)}
                  >
                    <Home className="h-3.5 w-3.5" />
                    <span>Back to Start</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Mobile Quick Actions Footer */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-4 flex justify-between items-center z-10">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => handlePageChange(3)}
              >
                <Home className="h-3.5 w-3.5" />
                <span>Start</span>
              </Button>
              
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] justify-center">
                {[...Array(totalPages - 2)].map((_, i) => {
                  const pageNum = i + 3;
                  // Only show important sections for mobile
                  const isSection = Object.keys(sectionNames).includes(pageNum.toString());
                  if (!isSection && i !== 0 && i !== totalPages - 3) return null;
                  
                  return (
                    <div
                      key={pageNum}
                      className={`h-1.5 rounded-full transition-all cursor-pointer hover:opacity-100 ${
                        currentPage === pageNum
                          ? 'w-5 bg-primary'
                          : isSection
                            ? 'w-3 bg-blue-400 dark:bg-blue-600 opacity-80'
                            : 'w-2.5 bg-gray-300 dark:bg-zinc-700 opacity-70'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    />
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className={!isFullscreenEnabled ? "invisible" : ""}
                onClick={toggleFullscreen}
              >
                <Maximize className="h-3.5 w-3.5 mr-1" />
                <span className="sr-only md:not-sr-only">Fullscreen</span>
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default ManualPage