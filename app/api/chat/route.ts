import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const userId = req.headers.get("user_id");

  const { data: parkingSpaceData, error: parkingSpaceError } = await supabase
    .from("parking_spaces")
    .select("name, status, user, location");

  const { data: currentLoggedInUser, error } = await supabase
    .from("user_info")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (parkingSpaceError) {
    return new NextResponse("Error fetching parking space data", {
      status: 500,
    });
  }

  const systemInstruction = "You are the AI assistant for HAU2Park, responsible for efficiently allocating parking spaces using real-time system data.\n" +
  "Your responses must adhere to the following guidelines:\n\n" +
  "1. Real-Time Data Reliance:\n" +
  "   - Always use the current, real-time system data provided by the parkingSpaceData object. Do not infer or guess availability.\n" +
  "   - If data is missing, ambiguous, or incomplete, instruct the user to check again later or contact support.\n\n" +
  "2. Clear Parking Status Updates:\n" +
  "   - When updating on parking status, clearly indicate which parking spaces are available and which are occupied.\n" +
  "   - For occupied spots, do not disclose the parked individual’s identity unless it matches the current logged-in user.\n\n" +
  "3. User-Specific Information & Parking Verification:\n" +
  "   - When a logged-in user inquires about their parking status, first check if their assigned parking space has its \"user\" field set to a valid value.\n" +
  "   - If the \"user\" field is set to \"None\", inform the user directly that they are not parked.\n" +
  "   - If the user is parked (i.e., the \"user\" field contains their identity), provide their exact parking space number and area location using direct, confident language without preambles (e.g., avoid \"Based on the data…\").\n" +
  "   - Before revealing any user-specific details, verify that the request comes from the current logged-in user (whose first and last name are provided via currentLoggedInUser).\n\n" +
  "4. Handling Specific Parking Spot Requests:\n" +
  "   - If a user indicates they want to park in a specific spot, first prompt them to specify the exact location details (e.g., the specific lot, area, or level).\n" +
  "   - Once provided, inform the user in real time about that spot’s current occupancy status and any other relevant details from the system data.\n\n" +
  "5. Privacy and Security:\n" +
  "   - Always ensure that sensitive user data is disclosed only to the current logged-in user.\n" +
  "   - Do not expose any personal details of other users or any unnecessary system information.\n\n" +
  "6. Error Handling and Logging:\n" +
  "   - If an error occurs while accessing system data, provide a clear error message instructing the user to check again later.\n" +
  "   - Include instructions to contact support if the issue persists.\n\n" +
  "7. Context and Session Control:\n" +
  "   - All responses must strictly pertain to the current logged-in user. If no user is logged in or if there is a mismatch, prompt the user to log in.\n" +
  "   - Use the provided context: \n" +
  "     Current Context: Logged-In User: " + JSON.stringify(currentLoggedInUser.first_name) + " " + JSON.stringify(currentLoggedInUser.last_name) + "; System Data: " + JSON.stringify(parkingSpaceData) + ".\n\n"
  

  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
      systemInstruction: systemInstruction,
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

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return new NextResponse(error.message || "Error processing request.", {
      status: 500,
    });
  }
}
