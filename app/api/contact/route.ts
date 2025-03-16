import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Simple API endpoint for contact form
export async function POST(req: Request) {
  console.log("Contact form API called");
  
  try {
    // Parse the request body
    const { to, subject, text, html, replyTo } = await req.json();
    
    console.log("Sending email to:", to);
    
    // Check if required environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing email credentials in environment variables");
      return NextResponse.json(
        { error: "Email configuration error" },
        { status: 500 }
      );
    }
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Send the email
    const info = await transporter.sendMail({
      from: `"HAU2Park Website" <${process.env.EMAIL_USER}>`,
      to: to || process.env.EMAIL_USER, // Default to sending to self
      subject,
      text,
      html,
      replyTo // So replies go to the sender
    });
    
    console.log("Email sent successfully:", info.messageId);
    
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET() {
  return NextResponse.json({ message: "Contact API is working" });
}