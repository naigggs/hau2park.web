"use client"

import { useState, useEffect } from "react"
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api"

const libraries: ("places")[] = ["places"]

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

interface ChatbotMapsRouteProps {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  apiKey: string
}

export default function ChatbotMapsRoute({ origin, destination, apiKey }: ChatbotMapsRouteProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries,
  })

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    const directionsService = new google.maps.DirectionsService()
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result)
        }
      },
    )
  }, [isLoaded, origin, destination])

  if (loadError) {
    return <div>Error loading maps</div>
  }

  if (!isLoaded) {
    return <div>Loading maps</div>
  }

  return (
    <div className="w-full rounded-lg overflow-hidden">
      <GoogleMap 
        mapContainerStyle={mapContainerStyle} 
        zoom={17} 
        center={origin}
      >
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
  )
}