import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="border-t py-12 bg-gradient-to-b from-muted/50 to-muted">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo and tagline */}
          <div className="max-w-md mb-8">
            <h3 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              HAU2PARK
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Revolutionizing parking management with AI-powered solutions.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Link href="mailto:hau2park@gmail.com">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-300">
                <span className="sr-only">Email</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </Button>
            </Link>
            <Link href="https://github.com/naigggs/hau2park.web" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-300">
                <span className="sr-only">GitHub</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Button>
            </Link>
          </div>

          {/* Copyright */}
          <div className="w-full pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">&copy; 2025 HAU2PARK. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}