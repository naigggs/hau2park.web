"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/shared/landing/header";
import Footer from "@/components/shared/landing/footer";
import { 
  BadgeCheck, 
  Car, 
  QrCode, 
  Users, 
  Map, 
  MessageSquare, 
  BellRing, 
  Cog, 
  Shield, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import React from "react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  content: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, content, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 1,
            delay: delay * 0.1,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}
    >
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm hover:bg-card/90 transition-all duration-500 h-full">
        <CardHeader className="pb-2">
          <div className="bg-primary/5 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full mb-4">
            {icon}
          </div>
          <CardTitle className="text-lg sm:text-xl tracking-tight">{title}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Home() {
  const heroImageRef = useRef(null);
  const statsSectionRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effect for hero image
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  
  // For animations based on scroll position
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <Header />

      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-16 md:pt-0">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background/0 z-0"></div>

          {/* Background subtle pattern */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.015] z-0"></div>

          <div className="container relative z-10 mx-auto px-4 py-16 md:py-32">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <motion.div
                className="space-y-6 md:space-y-8"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div>
                  <motion.span
                    className="inline-block py-1 px-3 text-xs font-medium text-primary bg-primary/10 rounded-full mb-4 md:mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Introducing HAU2PARK AI
                  </motion.span>
                  <motion.h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-4 md:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Intelligent Parking{" "}
                    <span className="text-primary">Made Simple</span>
                  </motion.h1>
                  <motion.p
                    className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-[46rem]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    HAU2PARK is an advanced AI-driven parking management system
                    that streamlines the entire parking experience with QR
                    codes, real-time monitoring, and an intelligent chatbot
                    assistant.
                  </motion.p>
                </div>

                <motion.div
                  className="flex flex-col xs:flex-row gap-4 pt-2 sm:pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <Link href="auth/register">
                    <Button
                      size="lg"
                      className="w-full xs:w-auto rounded-full px-6 sm:px-8 text-sm sm:text-base group"
                    >
                      Get Started
                      <ArrowRight
                        size={16}
                        className="ml-2 transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  </Link>
                  <Link href="auth/guest-form/">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full xs:w-auto rounded-full px-6 sm:px-8 text-sm sm:text-base group"
                    >
                      Guest Parking
                      <ChevronRight
                        size={16}
                        className="ml-2 transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                ref={heroImageRef}
                className="relative h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl mt-8 lg:mt-0"
                style={{ scale: heroScale, opacity: heroOpacity }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5,
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src="/hero.png"
                  alt="Smart parking visualization with HAU2PARK interface"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>

                {/* Floating UI elements for visual appeal - only show on larger screens */}
                <motion.div
                  className="absolute top-[20%] left-[10%] bg-background/90 backdrop-blur-md p-2 sm:p-4 rounded-lg shadow-lg hidden sm:block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-status-available"></div>
                    <span className="text-xs sm:text-sm font-medium">
                      P1 Available
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-[25%] right-[15%] bg-background/90 backdrop-blur-md p-2 sm:p-4 rounded-lg shadow-lg hidden sm:block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium">
                      AI Assistant
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator - hide on small screens */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-2">
                Scroll to explore
              </span>
              <motion.div
                className="w-[1px] h-16 bg-muted-foreground/30"
                animate={{
                  scaleY: [0.3, 1, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </section>

        {/* Stats Banner */}
        <section
          ref={statsSectionRef}
          className="relative py-16 md:py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
          <div
            className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-20"
            style={{
              backgroundSize: "200px",
              filter: "contrast(170%) brightness(1000%)",
            }}
          ></div>

          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="text-center text-white">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                  77.4%
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium opacity-80">
                  Precision
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="text-center text-white">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                  24/7
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium opacity-80">
                  Real-time Updates
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="text-center text-white">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                  5min
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium opacity-80">
                  Average Time Saved
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="text-center text-white">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                  98%
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium opacity-80">
                  User Satisfaction
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 sm:py-20 md:py-24 lg:py-32 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Intelligent Features
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
                HAU2PARK combines AI technology with user-friendly features to
                create a seamless parking experience.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                }
                title="AI Chatbot Assistant"
                description="Intelligent conversation with voice and text support"
                content="Get real-time assistance, find available parking spaces, and navigate campus with our intelligent AI chatbot that supports both text and voice interactions."
                delay={0}
              />

              <FeatureCard
                icon={<QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                title="QR Code Access"
                description="Secure and contactless parking entry"
                content="Use secure QR codes for contactless parking access. Unique codes are generated for each parking request and verified by security personnel."
                delay={1}
              />

              <FeatureCard
                icon={<Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                title="Real-time Monitoring"
                description="Live updates on parking availability"
                content="Advanced computer vision provides real-time monitoring of parking spaces with high accuracy detection of available, reserved, and occupied spots."
                delay={2}
              />

              <FeatureCard
                icon={<Map className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                title="Interactive Mapping"
                description="Visual guidance to parking locations"
                content="Navigate campus with interactive maps showing available parking spaces and providing turn-by-turn directions to your reserved spot."
                delay={3}
              />

              <FeatureCard
                icon={
                  <BellRing className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                }
                title="Smart Notifications"
                description="Timely alerts and verifications"
                content="Receive instant notifications about parking approvals, space availability, verification requests, and time-sensitive reminders for parking limits."
                delay={4}
              />

              <FeatureCard
                icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                title="Enhanced Security"
                description="Protected parking environment"
                content="Maintain a secure parking environment with illegal parking detection, verification processes, and comprehensive monitoring of all parking activities."
                delay={5}
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="py-16 sm:py-20 md:py-24 lg:py-32 relative"
        >
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                How It Works
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
                HAU2PARK makes parking simple with an intuitive process designed
                for all user types.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="max-w-5xl mx-auto"
            >
              <Tabs defaultValue="guest" className="w-full">
                <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto mb-8 sm:mb-12 h-10 sm:h-12">
                  <TabsTrigger
                    value="guest"
                    className="text-xs sm:text-sm rounded-full data-[state=active]:bg-primary data-[state=active]:text-secondary"
                  >
                    Guest
                  </TabsTrigger>
                  <TabsTrigger
                    value="user"
                    className="text-xs sm:text-sm rounded-full data-[state=active]:bg-primary data-[state=active]:text-secondary"
                  >
                    Registered User
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="text-xs sm:text-sm rounded-full data-[state=active]:bg-primary data-[state=active]:text-secondary"
                  >
                    Administrator
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="guest" className="mt-0">
                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div
                      className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden order-1 md:order-1"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <Image
                        src="/guest-request-form.png"
                        alt="Guest request form visualization"
                        fill
                        className="object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                    </motion.div>

                    <motion.div
                      className="space-y-6 sm:space-y-8 order-2 md:order-2"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={staggerContainer}
                    >
                      <motion.h3
                        className="text-xl sm:text-2xl md:text-3xl font-bold"
                        variants={fadeIn}
                      >
                        Guest Parking Process
                      </motion.h3>

                      <ol className="space-y-4 sm:space-y-6">
                        {[
                          {
                            title: "Submit a parking request",
                            description:
                              "Fill out the guest form with your details and purpose of visit",
                          },
                          {
                            title: "Wait for approval",
                            description:
                              "Admin team reviews and approves your request",
                          },
                          {
                            title: "Receive your QR code",
                            description:
                              "Get a unique QR code by email or in the app",
                          },
                          {
                            title: "Present QR code at entry",
                            description:
                              "Security guard scans your code for verification",
                          },
                          {
                            title: "Park in designated area",
                            description:
                              "Access AI chatbot for assistance if needed",
                          },
                        ].map((step, index) => (
                          <motion.li
                            key={index}
                            className="flex gap-3 sm:gap-4 items-start"
                            variants={fadeIn}
                          >
                            <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-sm sm:text-base">
                                {step.title}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </motion.li>
                        ))}
                      </ol>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="user" className="mt-0">
                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div
                      className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden order-1 md:order-1"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <Image
                        src="/user-interface.png"
                        alt="User interface with chatbot visualization"
                        fill
                        className="object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                    </motion.div>

                    <motion.div
                      className="space-y-6 sm:space-y-8 order-2 md:order-2"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={staggerContainer}
                    >
                      <motion.h3
                        className="text-xl sm:text-2xl md:text-3xl font-bold"
                        variants={fadeIn}
                      >
                        Registered User Process
                      </motion.h3>

                      <ol className="space-y-4 sm:space-y-6">
                        {[
                          {
                            title: "Log in to HAU2PARK",
                            description:
                              "Access your account via web or mobile app",
                          },
                          {
                            title: "Check available spaces",
                            description:
                              "Ask the AI chatbot about current availability",
                          },
                          {
                            title: "Reserve a parking space",
                            description:
                              "Tell the chatbot which space you want",
                          },
                          {
                            title: "Follow navigation guidance",
                            description:
                              "Get directions to your reserved space",
                          },
                          {
                            title: "Verify your parking",
                            description:
                              "Respond to the verification notification",
                          },
                        ].map((step, index) => (
                          <motion.li
                            key={index}
                            className="flex gap-3 sm:gap-4 items-start"
                            variants={fadeIn}
                          >
                            <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-sm sm:text-base">
                                {step.title}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </motion.li>
                        ))}
                      </ol>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-0">
                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div
                      className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden order-1 md:order-1"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <Image
                        src="/admin-dashboard.png"
                        alt="Admin dashboard visualization"
                        fill
                        className="object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                    </motion.div>

                    <motion.div
                      className="space-y-6 sm:space-y-8 order-2 md:order-2"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={staggerContainer}
                    >
                      <motion.h3
                        className="text-xl sm:text-2xl md:text-3xl font-bold"
                        variants={fadeIn}
                      >
                        Administrator Process
                      </motion.h3>

                      <ol className="space-y-4 sm:space-y-6">
                        {[
                          {
                            title: "Access admin portal",
                            description:
                              "Login with admin credentials to the dashboard",
                          },
                          {
                            title: "Monitor parking status",
                            description:
                              "View real-time status of all parking spaces",
                          },
                          {
                            title: "Review guest requests",
                            description:
                              "Approve or reject incoming parking requests",
                          },
                          {
                            title: "Manage user roles",
                            description: "Assign and modify user permissions",
                          },
                          {
                            title: "Handle parking issues",
                            description:
                              "Resolve conflicts and unauthorized parking events",
                          },
                        ].map((step, index) => (
                          <motion.li
                            key={index}
                            className="flex gap-3 sm:gap-4 items-start"
                            variants={fadeIn}
                          >
                            <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-sm sm:text-base">
                                {step.title}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </motion.li>
                        ))}
                      </ol>
                    </motion.div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* User Types - Interactive cards */}
        <section
          id="users"
          className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                User Experience
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
                HAU2PARK provides tailored experiences for different user types.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[
                {
                  type: "Guest",
                  title: "Visitor Parking",
                  description:
                    "Quick and easy parking access for campus visitors",
                  color: "accent",
                  icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
                  features: [
                    "Simple request submission",
                    "Digital QR code parking pass",
                    "Basic AI chatbot assistance",
                    "Designated guest parking areas",
                  ],
                  action: {
                    text: "Request Guest Parking",
                    href: "auth/guest-form",
                    variant: "outline",
                  },
                },
                {
                  type: "User",
                  title: "Registered User",
                  description:
                    "Full-featured parking experience for regular users",
                  color: "primary",
                  icon: <Car className="h-4 w-4 sm:h-5 sm:w-5" />,
                  features: [
                    "Real-time parking availability",
                    "Advanced AI parking assistant",
                    "Interactive navigation guidance",
                    "Parking verification system",
                  ],
                  action: {
                    text: "Create Account",
                    href: "auth/register",
                    variant: "default",
                  },
                },
                {
                  type: "Admin",
                  title: "Administrator",
                  description: "Complete system management and oversight",
                  color: "secondary",
                  icon: <Cog className="h-4 w-4 sm:h-5 sm:w-5" />,
                  features: [
                    "Comprehensive dashboard",
                    "Request approval system",
                    "User role management",
                    "Parking space oversight",
                  ],
                  action: {
                    text: "Admin Portal",
                    href: "auth/login",
                    variant: "secondary",
                  },
                },
              ].map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="border-0 shadow-md h-full bg-card/80 backdrop-blur-sm overflow-hidden">
                    <div
                      className={`h-1 sm:h-2 w-full ${
                        card.color === "primary"
                          ? "bg-primary"
                          : card.color === "secondary"
                          ? "bg-secondary"
                          : "bg-accent"
                      }`}
                    ></div>
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`${
                            card.color === "primary"
                              ? "bg-primary/10"
                              : card.color === "secondary"
                              ? "bg-secondary/10"
                              : "bg-accent/10"
                          } p-1.5 sm:p-2 rounded-full`}
                        >
                          {card.icon}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            card.color === "primary"
                              ? "text-primary"
                              : card.color === "secondary"
                              ? "text-secondary"
                              : "text-accent"
                          }`}
                        >
                          {card.type}
                        </span>
                      </div>
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">
                        {card.title}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                        {card.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <motion.div
                        className="space-y-2 sm:space-y-3"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                      >
                        {card.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            className="flex gap-2 items-start"
                            variants={fadeIn}
                            custom={idx}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <BadgeCheck
                              className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 ${
                                card.color === "primary"
                                  ? "text-primary"
                                  : card.color === "secondary"
                                  ? "text-secondary"
                                  : "text-accent"
                              }`}
                            />
                            <span className="text-xs sm:text-sm">
                              {feature}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>

                      <div className="pt-2 sm:pt-4">
                        <Link href={card.action.href}>
                          <Button
                            variant={
                              card.action.variant === "default"
                                ? "default"
                                : card.action.variant === "secondary"
                                ? "secondary"
                                : "outline"
                            }
                            className={`w-full text-xs sm:text-sm rounded-full group transition-all duration-300 ${
                              card.action.variant === "default"
                                ? ""
                                : card.action.variant === "secondary"
                                ? ""
                                : card.color === "primary"
                                ? "hover:bg-primary/10"
                                : card.color === "secondary"
                                ? "hover:bg-secondary/10"
                                : "hover:bg-accent/10"
                            }`}
                          >
                            {card.action.text}
                            <ArrowRight
                              size={14}
                              className="ml-1.5 opacity-70 transition-transform group-hover:translate-x-1"
                            />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Apple-style with 3D parallax effect */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 z-0"></div>

          {/* Animated background elements */}
          <div className="absolute inset-0 z-10 overflow-hidden">
            <motion.div
              className="absolute -top-[30%] -left-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-white/10 blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute top-[60%] -right-[5%] w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-white/5 blur-2xl"
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 15,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </div>

          <div className="container relative z-20 mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <motion.div
                className="space-y-6 sm:space-y-8 text-white"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                  Ready to Transform Your Parking Experience?
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light opacity-90 leading-relaxed">
                  Join HAU2PARK today and experience the future of intelligent
                  parking management with AI-powered assistance.
                </p>
                <div className="flex flex-col xs:flex-row gap-4 pt-2 sm:pt-4">
                  <Link href="auth/register">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full xs:w-auto rounded-full px-6 sm:px-8 text-sm sm:text-base group"
                    >
                      Create Account
                      <ArrowRight
                        size={16}
                        className="ml-2 transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  </Link>
                  <Link href="auth/guest-form">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full xs:w-auto rounded-full px-6 sm:px-8 text-sm sm:text-base group bg-transparent border-white text-white hover:bg-white/10"
                    >
                      Guest Parking
                      <ChevronRight
                        size={16}
                        className="ml-2 transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                {/* 3D floating mockup */}
                <div className="relative h-full w-full perspective-[1000px]">
                  <motion.div
                    className="absolute inset-0 z-10"
                    animate={{
                      rotateX: [0, 2, 0, -2, 0],
                      rotateY: [0, -2, 0, 2, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 6,
                      ease: "easeInOut",
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src="/app-mockup.png"
                        alt="HAU2PARK mobile app interface with AI chatbot"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tl from-black/40 via-transparent to-transparent"></div>

                      {/* Floating UI elements - hidden on smallest screens */}
                      <motion.div
                        className="absolute top-1/4 left-1/4 bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg hidden xs:flex"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >
                        <div className="flex items-center gap-2">
                          <Car className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          <span className="text-xs sm:text-sm font-medium">
                            Parking Assistant
                          </span>
                        </div>
                      </motion.div>

                      <motion.div
                        className="absolute bottom-1/4 right-1/4 bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg hidden xs:flex"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                      >
                        <div className="flex items-center gap-2">
                          <Map className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
                          <span className="text-xs sm:text-sm font-medium">
                            Real-time Navigation
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology Showcase */}
        <section className="py-12 sm:py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Powered By Advanced Technology
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                HAU2PARK leverages cutting-edge technologies to deliver
                accurate, real-time parking management.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-14 py-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  name: "Gemini AI",
                  logo: "/google-gemini.svg",
                  height: 32,
                  darkMode: true,
                },
                {
                  name: "React",
                  logo: "/react.svg",
                  height: 34,
                },
                {
                  name: "Next.js",
                  logo: "/next.svg",
                  height: 24,
                  darkMode: true,
                },
                {
                  name: "Vercel",
                  logo: "/vercel-icon.svg",
                  height: 32,
                  darkMode: true,
                },
                {
                  name: "Supabase",
                  logo: "/supabase-icon.svg",
                  height: 32,
                },
                {
                  name: "Roboflow",
                  logo: "/Roboflow.svg",
                  height: 32,
                },
                {
                  name: "OpenCV",
                  logo: "/opencv.svg",
                  height: 32,
                },
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  className="text-center opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105"
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                >
                  <div
                    className={`
          h-16 sm:h-20 w-32 sm:w-40 
          bg-white dark:bg-zinc-900 
          shadow-sm border border-zinc-100 dark:border-zinc-800 
          flex items-center justify-center 
          rounded-xl sm:rounded-2xl 
          overflow-hidden
          p-4
        `}
                  >
                    <div
                      className={`relative ${
                        tech.darkMode ? "dark:invert" : ""
                      }`}
                    >
                      <Image
                        src={tech.logo}
                        alt={`${tech.name} logo`}
                        width={tech.height * 2} // Using an appropriate aspect ratio
                        height={tech.height}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm font-medium tracking-wide">
                    {tech.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Back to top button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 z-40 rounded-full p-2 sm:p-3 bg-primary/90 text-white shadow-lg hover:bg-primary transition-all duration-300"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: scrollY > 500 ? 1 : 0,
          scale: scrollY > 500 ? 1 : 0.8,
          pointerEvents: scrollY > 500 ? "auto" : "none",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
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
          className="lucide lucide-chevron-up"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </motion.button>

      <Footer />
    </div>
  );
}