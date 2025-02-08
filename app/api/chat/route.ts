import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: parkingSpaceData, error: parkingSpaceError } = await supabase
    .from("parking_spaces")
    .select("name, status, user, location");

  if (parkingSpaceError) {
    return new NextResponse("Error fetching parking space data", {
      status: 500,
    });
  }

  try {
    const { prompt, context } = await req.json();
    const { currentUser, timestamp } = context || {};

    // Check if context exists and has required parking flow data
    if (context?.selectedParking && !context?.entrance) {
      return NextResponse.json({
        response: "What entrance are you coming from? (Main Entrance or Side Entrance)",
        timestamp,
        user: currentUser
      });
    }
    
    const apiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
      systemInstruction:
        "As the AI assistant for HAU2Park, your role is to efficiently allocate parking spaces based on real-time system data. Follow these guidelines:\n" +
        "    Parking Status Updates\n" +
        "        Clearly indicate which parking spaces are open and occupied without hesitation.\n" +
        "        Do not reveal who is parked in a specific space.\n" +
        "    User-Specific Information\n" +
        "        When a user inquires about their parking status, provide their exact parking space and the parking area location.\n" +
        '        Avoid unnecessary phrases like "Based on the data"—deliver information confidently.\n' +
        "    Accuracy and Reliability\n" +
        "        Always rely on the system's data—do not guess or assume availability.\n" +
        "        If data is missing or unclear, prompt the user to check again later.\n" +
        "        The user you only respond is the current logged in user." +
        "\n" +
        "Your primary goal is to provide precise, efficient, and secure parking information.\n" +
        "\n" +
        "\n" +
        `Current logged-in user: ${currentUser}\n` +
        `Current timestamp: ${timestamp}\n` +
        `Data: ${JSON.stringify(parkingSpaceData)}`,
    });

    if (!apiKey) {
      return new NextResponse(
        "GEMINI_API_KEY environment variable is not set.",
        {
          status: 500,
        }
      );
    }

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    };

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ 
      response: responseText,
      timestamp,
      user: currentUser
    });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return new NextResponse(error.message || "Error processing request.", {
      status: 500,
    });
  }
}