"use client";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Menu,
  RefreshCw,
} from "lucide-react";

interface PresetCommandsProps {
  onCommandClick: (command: string) => void;
  isTextInputVisible?: boolean;
  onToggleTextInput?: () => void;
  availableParkingSpaces?: string[];
  awaitingConfirmation?: string | null;
  entranceConfirmation?: boolean | null;
  isUserParked?: boolean;
  userParkingSpace?: string | null;
  parkingStatus?: "Occupied" | "Reserved" | null;
}

export function PresetCommands({
  onCommandClick,
  isTextInputVisible = false,
  onToggleTextInput,
  availableParkingSpaces = [],
  awaitingConfirmation,
  entranceConfirmation,
  isUserParked = false,
  userParkingSpace = null,
  parkingStatus = null,
}: PresetCommandsProps) {
  const [isCommandsVisible, setIsCommandsVisible] = useState(true);
  const [isUsingDefaultCommands, setIsUsingDefaultCommands] = useState(true);

  const occupiedUserCommands = [
    `Where is my car in ${userParkingSpace}?`,
    "Get directions to my car",
    "Show parking rules",
    "What's my parking duration?",
  ];

  const reservedUserCommands = [
    `Show route to ${userParkingSpace}`,
    "Cancel my reservation",
    "How much time left to park?",
    "Show parking rules",
  ];

  const defaultCommands = [
    "Check parking availability",
    "Show available spaces",
    "How do I reserve parking?",
    "What's my parking status?",
    "Show parking rules",
    "Get directions",
  ];

  // Generate commands based on state
  const commands = isUsingDefaultCommands
    ? (isUserParked 
        ? (parkingStatus === "Occupied" 
            ? occupiedUserCommands 
            : parkingStatus === "Reserved" 
              ? reservedUserCommands 
              : defaultCommands)
        : defaultCommands)
    : awaitingConfirmation
    ? ["Yes", "No, I will find another parking spot", "Reset quick actions"]
    : entranceConfirmation
    ? ["Main Entrance", "Side Entrance", "Reset quick actions"]
    : availableParkingSpaces.length > 0
    ? [
        ...availableParkingSpaces.map((space) => `I want to park in ${space}`),
        "Reset quick actions",
      ]
    : (isUserParked 
        ? (parkingStatus === "Occupied" 
            ? occupiedUserCommands 
            : parkingStatus === "Reserved" 
              ? reservedUserCommands 
              : defaultCommands)
        : defaultCommands);

  // Update commands when props change
  useEffect(() => {
    setIsUsingDefaultCommands(
      !awaitingConfirmation && 
      !entranceConfirmation && 
      availableParkingSpaces.length === 0
    );
  }, [awaitingConfirmation, availableParkingSpaces, entranceConfirmation]);

  const presetCommands = [
    {
      category: "Quick Actions",
      commands,
    },
  ];

  const handleCommandClick = (command: string) => {
    if (command === "Reset quick actions") {
      setIsUsingDefaultCommands(true);
      return;
    }
    onCommandClick(command);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-4">
      <div className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
        <button
          onClick={() => setIsCommandsVisible(!isCommandsVisible)}
          className="flex flex-1 items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">
              Quick Actions
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs font-normal">
              {presetCommands[0].commands.length} commands
            </span>
          </div>
          {isCommandsVisible ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {onToggleTextInput && (
          <button
            onClick={onToggleTextInput}
            className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
            title={isTextInputVisible ? "Show Commands" : "Show Text Input"}
          >
            {isTextInputVisible ? (
              <Menu className="h-5 w-5 text-gray-500" />
            ) : (
              <MessageCircle className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {isCommandsVisible && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2">
            {presetCommands[0].commands.map((command) => (
              <button
                key={command}
                onClick={() => handleCommandClick(command)}
                className={`w-full md:w-auto px-4 py-2.5 text-sm ${
                  command === "Yes"
                    ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800/30 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                    : command.startsWith("No,")
                    ? "bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300"
                    : command === "Reset quick actions"
                    ? "bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 flex items-center gap-1"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                } rounded-full transition-colors`}
              >
                {command === "Reset quick actions" ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {command}
                  </>
                ) : (
                  command
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
