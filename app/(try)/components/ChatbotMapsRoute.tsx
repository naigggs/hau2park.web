"use client"

import { useState, useCallback, useRef } from "react"
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const libraries = ["places"]

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const center = {
  lat: 0,
  lng: 0,
}

interface ChatbotMapsRouteProps {
  apiKey: string
}

export default function ChatbotMapsRoute({ apiKey }: ChatbotMapsRouteProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as any,
  })

  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    originAutocompleteRef.current = autocomplete
  }, [])

  const onLoadDestination = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    destinationAutocompleteRef.current = autocomplete
  }, [])

  const calculateRoute = useCallback(() => {
    if (!origin || !destination) {
      setError("Please enter both origin and destination.")
      return
    }

    setIsLoading(true)
    setError(null)

    const directionsService = new google.maps.DirectionsService()
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setIsLoading(false)
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result)
        } else {
          setError("Could not calculate directions. Please check your inputs and try again.")
        }
      },
    )
  }, [origin, destination])

  if (loadError) {
    return <div>Error loading maps</div>
  }

  if (!isLoaded) {
    return <div>Loading maps</div>
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className={`w-full ${error && !origin ? "border-red-500" : ""}`}
        />
        <Input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className={`w-full ${error && !destination ? "border-red-500" : ""}`}
        />
        <Button onClick={calculateRoute} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating Route
            </>
          ) : (
            "Calculate Route"
          )}
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="mt-4">
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={2} center={center}>
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: "#3b82f6",
                  strokeWeight: 5,
                },
                markerOptions: {
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: "#3b82f6",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                  },
                },
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  )
}

