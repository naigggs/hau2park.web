"use client";

import React from 'react';
import { useUserInfo } from "@/hooks/use-user-info";

export default function UserDashboard() {
  const { user, isLoading, error } = useUserInfo();

  return (
    <div className="container mx-auto p-6">
      {/* Greeting with user's name */}
      {(() => {
        const hours = new Date().getHours();
        let greeting;
        if (hours < 12) {
          greeting = "Good Morning";
        } else if (hours < 18) {
          greeting = "Good Afternoon";
        } else {
          greeting = "Good Evening";
        }
        
        // Display user's name if available
        if (isLoading) {
          return <h1 className="text-4xl font-bold mb-6">{greeting}</h1>;
        }
        
        if (error) {
          console.error("Error loading user info:", error);
          return <h1 className="text-4xl font-bold mb-6">{greeting}</h1>;
        }
        
        return (
          <h1 className="text-4xl font-bold mb-6">
            {greeting}{user ? `, ${user.first_name}` : ''}
          </h1>
        );
      })()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard content will go here */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Parking Status</h2>
          <p>Content coming soon...</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p>Content coming soon...</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <p>Content coming soon...</p>
        </div>
      </div>
    </div>
  );
}
