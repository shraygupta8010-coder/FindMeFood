import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './NearbyNgos.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Creative Loading Components
const FoodTruckLoader = () => (
  <div className="loading-container">
    <div className="food-truck-loader">
      <div className="food-items">
        <div className="food-item">🍎</div>
        <div className="food-item">🍞</div>
        <div className="food-item">🥦</div>
      </div>
      <div className="truck-body">
        <div className="truck-cabin">
          <div className="truck-window"></div>
        </div>
      </div>
      <div className="wheels">
        <div className="wheel"></div>
        <div className="wheel"></div>
      </div>
    </div>
    <div className="loading-text">
      Finding nearby NGOs<span className="dots-animation"></span>
    </div>
    <div className="loading-subtext">
      Delivering hope to your community
    </div>
  </div>
);

const MapPinLoader = () => (
  <div className="loading-container">
    <div className="map-pin-loader">
      <div className="pin"></div>
      <div className="ripple"></div>
      <div className="ripple"></div>
      <div className="ripple"></div>
    </div>
    <div className="loading-text">
      Scanning your area<span className="dots-animation"></span>
    </div>
    <div className="loading-subtext">
      Locating the nearest food partners
    </div>
  </div>
);

const PulseDotsLoader = () => (
  <div className="loading-container">
    <div className="pulse-dots-loader">
      <div className="pulse-dot"></div>
      <div className="pulse-dot"></div>
      <div className="pulse-dot"></div>
    </div>
    <div className="loading-text">
      Searching for NGOs<span className="dots-animation"></span>
    </div>
  </div>
);

const NearbyNgos = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]);
  const [map, setMap] = useState(null);
  const [currentLoader, setCurrentLoader] = useState(0);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getUserLocation();
    
    // Rotate between different loaders every 5 seconds
    const loaderInterval = setInterval(() => {
      setCurrentLoader(prev => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(loaderInterval);
  }, []);

  const getCurrentLoader = () => {
    const loaders = [FoodTruckLoader, MapPinLoader, PulseDotsLoader];
    const LoaderComponent = loaders[currentLoader];
    return <LoaderComponent />;
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          await fetchNearbyNGOs(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Using default location.');
          fetchNearbyNGOs(userLocation[0], userLocation[1]);
        }
      );
    } else {
      setError('Geolocation not supported. Using default location.');
      fetchNearbyNGOs(userLocation[0], userLocation[1]);
    }
  };

  const fetchNearbyNGOs = async (lat, lng) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/ngo/nearby/real?latitude=${lat}&longitude=${lng}&radius=5000`);
      const result = await response.json();

      if (result.success) {
        setNgos(result.data.ngos);
      } else {
        setError(result.message || 'Failed to load NGOs');
      }
    } catch (error) {
      setError('Error loading nearby NGOs');
      console.error('Fetch NGOs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDirections = (ngo) => {
    if (ngo.latitude && ngo.longitude) {
      const url = `https://www.openstreetmap.org/directions?from=${userLocation[0]},${userLocation[1]}&to=${ngo.latitude},${ngo.longitude}#map=15/${ngo.latitude}/${ngo.longitude}`;
      window.open(url, '_blank');
    }
  };

  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      if (userLocation) {
        map.setView(userLocation, 13);
      }
    }, [userLocation, map]);
    return null;
  };

  if (loading) {
    return (
      <div className="nearby-ngos-page">
        <header className="site-header">
          <div className="brand" onClick={() => navigate('/')}>
            <div className="logo-icon">🍽️❤️</div>
            <div className="brand-text">
              <div className="name">FindMeFood</div>
              <div className="tagline">Share food • Feed communities</div>
            </div>
          </div>
          <nav className="topnav">
            <Link to="/">🏠 Home</Link>
            <Link to="/dashboard">📊 Dashboard</Link>
            <Link to="/nearby-ngos" className="active">🗺️ Nearby NGOs</Link>
          </nav>
        </header>
        <div className="ngos-container">
          {getCurrentLoader()}
        </div>
      </div>
    );
  }

  return (
    <div className="nearby-ngos-page">
      <header className="site-header">
        <div className="brand" onClick={() => navigate('/')}>
          <div className="logo-icon">🍽️❤️</div>
          <div className="brand-text">
            <div className="name">FindMeFood</div>
            <div className="tagline">Share food • Feed communities</div>
          </div>
        </div>
        <nav className="topnav">
          <Link to="/">🏠 Home</Link>
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/nearby-ngos" className="active">🗺️ Nearby NGOs</Link>
        </nav>
      </header>

      <div className="ngos-container">
        <div className="ngos-header">
          <h1>🗺️ Nearby NGOs</h1>
          <p>Discover organizations near your location</p>
          
          {userLocation && (
            <div className="location-info">
              📍 Scanning 5km radius around your location
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={getUserLocation} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        )}

        <div className="content-layout">
          {/* Map Section */}
          <div className="map-section">
            <MapContainer 
              center={userLocation} 
              zoom={13} 
              style={{ height: '400px', width: '100%' }}
              whenCreated={setMap}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapController />
              
              {/* User Location Marker */}
              <Marker position={userLocation}>
                <Popup>Your Location</Popup>
              </Marker>

              {/* NGO Markers */}
              {ngos.map(ngo => (
                <Marker 
                  key={ngo.id} 
                  position={[ngo.latitude, ngo.longitude]}
                >
                  <Popup>
                    <div className="popup-content">
                      <h4>{ngo.name}</h4>
                      <p>{ngo.type}</p>
                      <p>{ngo.address}</p>
                      <button 
                        onClick={() => getDirections(ngo)}
                        className="btn btn-primary btn-sm"
                      >
                        Get Directions
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color blue"></div>
                <span>Your Location</span>
              </div>
              <div className="legend-item">
                <div className="legend-color red"></div>
                <span>NGO Locations</span>
              </div>
            </div>
          </div>

          {/* NGOs List */}
          <div className="ngos-list">
            <div className="results-count">
              Found {ngos.length} organization{ngos.length !== 1 ? 's' : ''} near you
            </div>
            
            {ngos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3>No organizations found nearby</h3>
                <p>Try increasing the search radius or check your location settings.</p>
                <button onClick={getUserLocation} className="btn btn-primary">
                  🔄 Search Again
                </button>
              </div>
            ) : (
              ngos.map(ngo => (
                <div key={ngo.id} className="ngo-card">
                  <div className="ngo-header">
                    <h3>{ngo.name}</h3>
                    <div className="distance-badge">
                      📍 {ngo.distance} km
                    </div>
                  </div>

                  <div className="ngo-details">
                    <p className="ngo-type">🏷️ {ngo.type}</p>
                    <p className="ngo-address">📍 {ngo.address}</p>
                    
                    {ngo.phone && (
                      <p className="ngo-phone">📞 {ngo.phone}</p>
                    )}
                    
                    {ngo.email && (
                      <p className="ngo-email">📧 {ngo.email}</p>
                    )}
                    
                    {ngo.contact_person && (
                      <p className="ngo-contact">👤 {ngo.contact_person}</p>
                    )}

                    {ngo.source === 'database' && (
                      <span className="source-badge">🏢 Registered NGO</span>
                    )}
                    {ngo.source === 'openstreetmap' && (
                      <span className="source-badge">🗺️ Community Organization</span>
                    )}
                  </div>

                  <div className="ngo-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => getDirections(ngo)}
                    >
                      🗺️ Get Directions
                    </button>
                    <Link to="/create-donation" className="btn btn-ghost">
                      💝 Donate Food
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyNgos;