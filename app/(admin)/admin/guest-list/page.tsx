'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GuestList } from "@/components/admin/guest-list/guest-list"
import { AllGuestList } from "@/components/admin/guest-list/guest-list-all"
import { UserPlus, ClipboardList, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

export default function GuestsPage() {
  // For mobile tab selection
  const [activeTab, setActiveTab] = useState("pending")

  return (
    <motion.div 
      className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guest Management</h1>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Approve guest requests and view past approvals
        </p>
      </div>
      
      {/* Mobile View: Tabs */}
      <div className="block md:hidden">
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Pending</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-4">
                    <GuestList />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Approval History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-4">
                    <AllGuestList />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop View: Side by Side */}
      <div className="hidden md:flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle>Pending Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <GuestList />
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <CardTitle>Approval History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <AllGuestList />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}