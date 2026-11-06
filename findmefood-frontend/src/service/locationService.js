class LocationService {
  // Get coordinates from address using OpenStreetMap Nominatim
  static async geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      
      if (!response.ok) throw new Error('Geocoding service unavailable')
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          address: data[0].display_name,
          confidence: data[0].importance
        }
      }
      throw new Error('Address not found. Please try a more specific address.')
    } catch (error) {
      console.error('Geocoding error:', error)
      throw new Error('Unable to find this address. Please check the address and try again.')
    }
  }

  // Calculate distance between two points in kilometers
  static calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return { kilometers: 'N/A', miles: 'N/A' }
    }

    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distanceKm = R * c
    
    return {
      kilometers: distanceKm < 1 ? 
        `${(distanceKm * 1000).toFixed(0)} meters` : 
        `${distanceKm.toFixed(1)} km`,
      miles: `${(distanceKm * 0.621371).toFixed(1)} miles`
    }
  }

  // Find NGOs within specified radius
  static findNearbyNGOs(userLat, userLon, ngos, radiusKm = 10) {
    if (!userLat || !userLon) return []

    return ngos
      .filter(ngo => {
        if (!ngo.latitude || !ngo.longitude) return false
        
        const distance = this.calculateDistanceInKm(
          userLat, userLon, 
          ngo.latitude, ngo.longitude
        )
        return distance <= radiusKm
      })
      .sort((a, b) => {
        const distA = this.calculateDistanceInKm(userLat, userLon, a.latitude, a.longitude)
        const distB = this.calculateDistanceInKm(userLat, userLon, b.latitude, b.longitude)
        return distA - distB
      })
      .map(ngo => ({
        ...ngo,
        distance: this.calculateDistance(userLat, userLon, ngo.latitude, ngo.longitude)
      }))
  }

  // Helper method for raw distance calculation
  static calculateDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Format address for display
  static formatAddress(address) {
    if (!address) return 'Address not available'
    
    if (typeof address === 'string') {
      return address
    }
    
    if (typeof address === 'object') {
      const { street, city, state, pincode, country } = address
      const parts = [street, city, state, pincode, country].filter(Boolean)
      return parts.join(', ')
    }
    
    return 'Address not available'
  }

  // Check if coordinates are valid
  static isValidCoordinates(lat, lng) {
    return (
      lat !== null && 
      lng !== null && 
      !isNaN(lat) && 
      !isNaN(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    )
  }
}

export default LocationService