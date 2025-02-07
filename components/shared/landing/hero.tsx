import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Revolutionize Parking with AI-Powered Solutions
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            HAU2PARK integrates cutting-edge AI technology to streamline parking management, enhancing efficiency for
            both operators and users.
          </p>
          <div className="space-x-4">
            <Button size="lg">Schedule a Demo</Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
        <div className="relative">
          <Image
            src="https://placehold.co/600x400"
            alt="AI-powered parking management"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}

