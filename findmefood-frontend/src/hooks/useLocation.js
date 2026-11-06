import { useState, useEffect } from 'react'

const useLocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: '',
    loading: false,
    error: null,
    supported: true
  })

  // Check if geolocation is supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        supported: false,
        error: 'Geolocation is not supported by your browser'
      }))
    }
  }, [])

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by your browser'
        setLocation(prev => ({
          ...prev,
          error,
          supported: false
        }))
        reject(new Error(error))
        return
      }

      setLocation(prev => ({ ...prev, loading: true, error: null }))

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          console.log('📍 Coordinates detected:', latitude, longitude)
          
          try {
            // Use OpenStreetMap Nominatim API (more reliable)
            const address = await getAddressFromCoords(latitude, longitude)
            console.log('✅ Address found:', address)
            
            const newLocation = {
              latitude,
              longitude,
              address,
              loading: false,
              error: null,
              supported: true
            }
            
            setLocation(newLocation)
            resolve(newLocation)
          } catch (error) {
            console.error('❌ Geocoding error:', error)
            const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            
            const fallbackLocation = {
              latitude,
              longitude,
              address: fallbackAddress,
              loading: false,
              error: 'Could not get full address, but coordinates are saved',
              supported: true
            }
            
            setLocation(fallbackLocation)
            resolve(fallbackLocation)
          }
        },
        (error) => {
          console.error('❌ Geolocation error:', error)
          let errorMessage = 'Unable to retrieve your location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your connection.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
            default:
              errorMessage = 'An unknown error occurred while getting location.'
              break
          }
          
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: errorMessage
          }))
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      )
    })
  }

  const getAddressFromCoords = async (lat, lng) => {
    try {
      console.log('🔍 Geocoding coordinates:', lat, lng)
      
      // Use OpenStreetMap Nominatim API (free and reliable)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📨 Geocoding response:', data)
      
      if (data && data.display_name) {
        return data.display_name
      }
      
      // Fallback: return coordinates
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      
    } catch (error) {
      console.error('❌ Geocoding error:', error)
      // Fallback to coordinates if geocoding fails
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null
    
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance.toFixed(1)
  }

  const clearLocation = () => {
    setLocation({
      latitude: null,
      longitude: null,
      address: '',
      loading: false,
      error: null,
      supported: true
    })
  }

  return {
    location,
    getCurrentLocation,
    calculateDistance,
    clearLocation
  }
}

export default useLocation