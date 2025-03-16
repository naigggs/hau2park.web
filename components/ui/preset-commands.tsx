"use client"

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PresetCommandsProps {
  onCommandClick: (command: string) => void;
}

export function PresetCommands({ onCommandClick }: PresetCommandsProps) {
  const [isVisible, setIsVisible] = useState(false);

  const presetCommands = [
    {
      category: "Quick Actions",
      commands: [
        "Check parking availability",
        "Show available spaces",
        "How do I reserve parking?",
        "What's my parking status?",
        "Show parking rules",
        "Get directions"
      ]
    }
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-4">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">Quick Actions</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs font-normal">
            {presetCommands[0].commands.length} commands
          </span>
        </div>
        {isVisible ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {isVisible && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2">
            {presetCommands[0].commands.map((command) => (
              <button
                key={command}
                onClick={() => onCommandClick(command)}
                className="w-full md:w-auto px-4 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-700 dark:text-gray-200"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
