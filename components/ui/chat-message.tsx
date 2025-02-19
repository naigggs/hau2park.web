"use client"

import React, { useMemo, useState, useRef, useEffect } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Code2, Loader2, Terminal, Map, Play, Pause, Volume2 } from "lucide-react"
import ChatbotMapsRoute from "./google-map-chat-message"
import { cn } from "@/lib/utils"
import { FilePreview } from "@/components/ui/file-preview"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { Button } from "./button"

const chatBubbleVariants = cva(
  "group/message relative break-words rounded-lg p-3 text-sm sm:max-w-[70%]",
  {
    variants: {
      isUser: {
        true: "bg-primary text-primary-foreground",
        false: "bg-muted text-foreground",
      },
      animation: {
        none: "",
        slide: "duration-300 animate-in fade-in-0",
        scale: "duration-300 animate-in fade-in-0 zoom-in-75",
        fade: "duration-500 animate-in fade-in-0",
      },
    },
    compoundVariants: [
      {
        isUser: true,
        animation: "slide",
        class: "slide-in-from-right",
      },
      {
        isUser: false,
        animation: "slide",
        class: "slide-in-from-left",
      },
      {
        isUser: true,
        animation: "scale",
        class: "origin-bottom-right",
      },
      {
        isUser: false,
        animation: "scale",
        class: "origin-bottom-left",
      },
    ],
  }
)

type Animation = VariantProps<typeof chatBubbleVariants>["animation"]

interface MapData {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

interface Attachment {
  name?: string
  contentType?: string
  url: string
  mapData?: MapData
}

interface PartialToolCall {
  state: "partial-call"
  toolName: string
}

interface ToolCall {
  state: "call"
  toolName: string
}

interface ToolResult {
  state: "result"
  toolName: string
  result: any
}

type ToolInvocation = PartialToolCall | ToolCall | ToolResult

export interface Message {
  id: string
  role: "user" | "assistant" | (string & {})
  content: string
  createdAt?: Date
  experimental_attachments?: Attachment[]
  toolInvocations?: ToolInvocation[]
}

export interface ChatMessageProps extends Message {
  showTimeStamp?: boolean
  animation?: Animation
  actions?: React.ReactNode
  className?: string
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  createdAt,
  showTimeStamp = false,
  animation = "scale",
  actions,
  className,
  experimental_attachments,
  toolInvocations,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const files = useMemo(() => {
    return experimental_attachments?.filter(att => !att.mapData).map((attachment) => {
      const dataArray = dataUrlToUint8Array(attachment.url)
      const file = new File([dataArray], attachment.name ?? "Unknown")
      return file
    })
  }, [experimental_attachments])

  const mapAttachment = experimental_attachments?.find(att => att.mapData)

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (role === 'assistant' && !hasInitialized) {
      setHasInitialized(true);
      handleTTS();
    }
  }, [role, hasInitialized]); // Add dependencies
  
  const handleTTS = async () => {
    if (role !== 'assistant') return;
  
    try {
      setIsLoading(true);
  
      // Clean up previous audio and URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
  
      const response = await fetch('/api/chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
  
      if (!response.ok) throw new Error('Failed to generate speech');
  
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
  
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };
  
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
  
      try {
        await audio.play();
      } catch (playError: any) {
        // Silently handle AbortError since it's expected when audio is interrupted
        if (playError.name !== 'AbortError') {
          console.error('Playback error:', playError);
        }
      }
    } catch (error) {
      // Only log non-abort errors
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('TTS error:', error);
      }
    } finally {
      setIsLoading(false);
    }
};
  
  // Update the cleanup effect
  useEffect(() => {
    const currentAudio = audioRef.current;
    
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (toolInvocations && toolInvocations.length > 0) {
    return <ToolCall toolInvocations={toolInvocations} />
  }

  const isUser = role === "user"

  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      {files && files.length > 0 ? (
        <div className="mb-1 flex flex-wrap gap-2">
          {files.map((file, index) => {
            return <FilePreview file={file} key={index} />
          })}
        </div>
      ) : null}

      <div className={cn(chatBubbleVariants({ isUser, animation }), className, "relative")}>
        <div>
          <MarkdownRenderer>{content}</MarkdownRenderer>
        </div>

        {mapAttachment?.mapData && (
          <div className="mt-2 rounded-lg overflow-hidden border bg-background">
            <div className="flex items-center gap-2 border-b bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Map className="h-4 w-4" />
              <span>Route to Parking Space</span>
            </div>
            <ChatbotMapsRoute
              origin={mapAttachment.mapData.origin}
              destination={mapAttachment.mapData.destination}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
            />
          </div>
        )}

        {role === "assistant" && (
          <div className="absolute -top-2 -right-2 flex space-x-1">
            <Button
              size="icon"
              variant="outline"
              onClick={handleTTS}
              className="h-6 w-6 rounded-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

        {role === "assistant" && actions ? (
          <div className="absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100">
            {actions}
          </div>
        ) : null}
      </div>

      {showTimeStamp && createdAt ? (
        <time
          dateTime={createdAt.toISOString()}
          className={cn(
            "mt-1 block px-1 text-xs opacity-50",
            animation !== "none" && "duration-500 animate-in fade-in-0"
          )}
        >
          {formattedTime}
        </time>
      ) : null}
    </div>
  )
}

function dataUrlToUint8Array(data: string) {
  const base64 = data.split(",")[1]
  const buf = Buffer.from(base64, "base64")
  return new Uint8Array(buf)
}

function ToolCall({
  toolInvocations,
}: Pick<ChatMessageProps, "toolInvocations">) {
  if (!toolInvocations?.length) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {toolInvocations.map((invocation, index) => {
        switch (invocation.state) {
          case "partial-call":
          case "call":
            return (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground"
              >
                <Terminal className="h-4 w-4" />
                <span>Calling {invocation.toolName}...</span>
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            )
          case "result":
            return (
              <div
                key={index}
                className="flex flex-col gap-1.5 rounded-lg border bg-muted px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Code2 className="h-4 w-4" />
                  <span>Result from {invocation.toolName}</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap text-foreground">
                  {JSON.stringify(invocation.result, null, 2)}
                </pre>
              </div>
            )
        }
      })}
    </div>
  )
}