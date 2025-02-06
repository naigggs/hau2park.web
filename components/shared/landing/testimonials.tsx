import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Parking Operations Manager",
    company: "CityPark Solutions",
    testimonial:
      "HAU2PARK has revolutionized our parking operations. The AI-driven insights have helped us optimize our space utilization and significantly increase our revenue.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Michael Chen",
    role: "Urban Planner",
    company: "MetroPlanning Associates",
    testimonial:
      "Implementing HAU2PARK in our city has reduced traffic congestion and improved the overall parking experience for our residents. It's a game-changer for urban mobility.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emily Rodriguez",
    role: "Chief Technology Officer",
    company: "TechDrive Inc.",
    testimonial:
      "The integration of HAU2PARK with our existing systems was seamless. Their API is well-documented, and the support team is highly responsive. Highly recommended!",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{testimonial.testimonial}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

