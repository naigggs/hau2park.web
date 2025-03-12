'use client'

import { useState, useCallback, useMemo } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'

// Updated with the exact coordinates provided
const HAU_LOCATION = {
  lat: 15.13318857426688, 
  lng: 120.59002325831534
}

export default function ContactMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  
  // Simplified map options for better mobile performance
  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    scrollwheel: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e9e9e9"
          },
          {
            "lightness": 17
          }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          },
          {
            "lightness": 20
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#ffffff"
          },
          {
            "lightness": 17
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#ffffff"
          },
          {
            "lightness": 29
          },
          {
            "weight": 0.2
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ffffff"
          },
          {
            "lightness": 18
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          },
          {
            "lightness": 21
          }
        ]
      }
    ]
  }), [])
  
  const onLoad = useCallback((map: google.maps.Map) => {
    // Adjusted zoom level for mobile view
    map.setZoom(16)
    map.setCenter(HAU_LOCATION)
    setMap(map)
    
    // Open the info window by default
    setTimeout(() => setIsInfoOpen(true), 1000)
  }, [])
  
  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Smaller marker for mobile
  const markerIcon = {
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='%23df0000' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E",
    scaledSize: new google.maps.Size(36, 36),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(18, 36)
  }
  
  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      options={mapOptions}
      zoom={16}
      center={HAU_LOCATION}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker 
        position={HAU_LOCATION}
        onClick={() => setIsInfoOpen(true)}
        animation={google.maps.Animation.DROP}
        icon={markerIcon}
      >
        {isInfoOpen && (
          <InfoWindow
            position={HAU_LOCATION}
            onCloseClick={() => setIsInfoOpen(false)}
          >
            <div className="p-2 min-w-[180px] max-w-[220px]">
              <h3 className="font-medium text-xs sm:text-sm">Holy Angel University</h3>
              <p className="text-xs mt-0.5">#1 Holy Angel St, Angeles, 2009 Pampanga</p>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex justify-between">
                <a 
                  href="https://www.hau.edu.ph/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Visit Website
                </a>
                <a 
                  href="https://maps.app.goo.gl/14eLoHu2czkoCyoN9" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  View on Maps
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </Marker>
    </GoogleMap>
  )
}