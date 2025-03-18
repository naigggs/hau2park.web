'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GuestList } from "@/components/admin/guest-list/guest-list"
import { AllGuestList } from "@/components/admin/guest-list/guest-list-all"
import { UserPlus, ClipboardList, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function GuestsPage() {
  // For mobile tab selection
  const [activeTab, setActiveTab] = useState("pending")
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <motion.div 
      className="w-full max-w-full flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-6 md:p-8 pt-4 sm:pt-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guest Management</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1 hidden sm:block ml-11">
          Approve guest requests and view past approvals
        </p>
      </div>
      
      {/* Content Area - Takes remaining height */}
      <div className="flex-1 w-full max-w-full overflow-hidden">
        {/* Mobile View: Tabs */}
        {isMobile ? (
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 shadow-sm">
              <TabsTrigger value="pending" className="flex items-center gap-2 py-2.5">
                <UserPlus className="h-4 w-4" />
                <span>Pending</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 py-2.5">
                <ClipboardList className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-6 flex-1 overflow-hidden">
              <Card className="border-border/40 h-full flex flex-col shadow-sm rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-5">
                      <GuestList />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-6 flex-1 overflow-hidden">
              <Card className="border-border/40 h-full flex flex-col shadow-sm rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold">Approval History</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-5">
                      <AllGuestList />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex lg:flex-row flex-col gap-8 h-full w-full">
            <Card className="flex-1 border-border/40 flex flex-col lg:h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="font-semibold">Pending Approvals</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-2">
                  <GuestList />
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="flex-1 border-border/40 flex flex-col lg:h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="font-semibold">Approval History</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-2">
                  <AllGuestList />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  )
}