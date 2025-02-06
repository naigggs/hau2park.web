import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          HAU2PARK
        </Link>
        <nav className="space-x-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:text-primary"
          >
            Testimonials
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:text-primary"
          >
            Contact
          </Link>
          <Link href={"/auth/login"}>
            <Button variant="outline" size="default">
              Login
            </Button>
          </Link>
          <Link href={"/auth/signup"}>
          <Button size="default">Get Started</Button>
            </Link>
        </nav>
      </div>
    </header>
  );
}
