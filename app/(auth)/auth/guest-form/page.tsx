import { GuestForm } from "@/components/auth/guest-form";
import Image from "next/image";

export default function GuestFormPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center gap-3 group transition-colors hover:text-primary"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background shadow-sm border">
              <Image
                src="/hau2park-logo.svg"
                alt="HAU2PARK Logo"
                width={26}
                height={26}
                className="size-6"
              />
            </div>
            <span className="font-semibold tracking-tight">HAU2PARK</span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          {/* Constrain the form width for a narrower mobile layout */}
          <div className="w-[80%] max-w-xs mx-auto py-10">
            <div className="h-px w-full bg-border mb-6 lg:hidden"></div>
            <GuestForm />
            <div className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
              © {new Date().getFullYear()} HAU2PARK
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        {/* Image overlay for desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        
        <Image
          src="/guest-form.png"
          width={1000}
          height={2000}
          alt="Guest Form"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
          priority
        />
        
        <div className="absolute bottom-10 left-10 z-20 max-w-md">
          <h2 className="text-white text-3xl font-bold mb-2">HAU2PARK</h2>
          <p className="text-gray-200 text-sm">
          The smart parking management solution for Holy Angel University
          </p>
        </div>
      </div>
    </div>
  );
}
