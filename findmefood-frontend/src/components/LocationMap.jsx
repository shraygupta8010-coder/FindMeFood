import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to update map center when location changes
function MapUpdater({ center }) {
  const map = useMap()
  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

const LocationMap = ({ 
  position, 
  onPositionChange, 
  height = '300px',
  zoom = 13 
}) => {
  const defaultCenter = [28.6139, 77.2090] // Default to Delhi, India
  
  const handleMapClick = (e) => {
    if (onPositionChange) {
      const { lat, lng } = e.latlng
      onPositionChange(lat, lng)
    }
  }

  return (
    <div className="location-map" style={{ height, borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={position || defaultCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {position && (
          <Marker position={position}>
            <Popup>
              📍 Selected Location<br />
              Lat: {position[0].toFixed(4)}<br />
              Lng: {position[1].toFixed(4)}
            </Popup>
          </Marker>
        )}
        
        {position && <MapUpdater center={position} />}
      </MapContainer>
    </div>
  )
}

export default LocationMap