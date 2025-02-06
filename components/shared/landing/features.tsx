import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, CreditCard, BarChart, Shield } from "lucide-react"

const features = [
  {
    title: "AI-Powered Assistance",
    description: "Our advanced AI algorithms optimize parking allocation and provide real-time guidance to users.",
    icon: Bot,
  },
  {
    title: "Seamless Transactions",
    description: "Secure and efficient payment processing for hassle-free parking experiences.",
    icon: CreditCard,
  },
  {
    title: "Data-Driven Insights",
    description: "Comprehensive analytics to help parking operators maximize efficiency and revenue.",
    icon: BarChart,
  },
  {
    title: "Enhanced Security",
    description: "State-of-the-art security measures to protect vehicles and ensure user peace of mind.",
    icon: Shield,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Transforming Parking Management</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none">
              <CardHeader>
                <feature.icon className="w-10 h-10 mb-4 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

