import Header from "@/components/shared/landing/header"
import Hero from "@/components/shared/landing/hero"
import Features from "@/components/shared/landing/features"
import Testimonials from "@/components/shared/landing/testimonials"
import Chatbot from "@/components/shared/landing/chatbot"
import Footer from "@/components/shared/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Testimonials />
        <Chatbot />
      </main>
      <Footer />
    </div>
  )
}

