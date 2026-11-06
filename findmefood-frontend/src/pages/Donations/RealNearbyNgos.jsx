import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RealNearbyNgos.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RealNearbyNgos = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]); // Default to Delhi
  const [map, setMap] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          await fetchRealNearbyNGOs(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Using default location.');
          fetchRealNearbyNGOs(userLocation[0], userLocation[1]);
        }
      );
    } else {
      setError('Geolocation not supported. Using default location.');
      fetchRealNearbyNGOs(userLocation[0], userLocation[1]);
    }
  };

  const fetchRealNearbyNGOs = async (lat, lng) => {
    try {
      setLoading(true);
      // CHANGED: radius from 5000 to 20000 (20km)
      const response = await fetch(`http://localhost:5000/api/ngo/nearby/real?latitude=${lat}&longitude=${lng}&radius=20000`);
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
      <div className="real-nearby-ngos-page">
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
            <Link to="/nearby-ngos" className="active">🗺️ Real NGOs Map</Link>
          </nav>
        </header>
        <div className="ngos-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            Scanning your area for NGOs and food banks within 20km radius...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="real-nearby-ngos-page">
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
          <Link to="/nearby-ngos" className="active">🗺️ Real NGOs Map</Link>
        </nav>
      </header>

      <div className="real-ngos-container">
        <div className="real-ngos-header">
          <h1>🗺️ NGOs & Food Banks Near You</h1>
          <p>Discover real organizations in your area using live map data</p>
          
          {/* ADDED: 20km radius display */}
          <div className="search-info">
            <div className="radius-info">
              🔍 <strong>Searching within 20km radius</strong> around your location
            </div>
            <div className="search-stats">
              {ngos.length > 0 ? (
                <span className="stats-success">
                  ✅ Found {ngos.length} organization{ngos.length !== 1 ? 's' : ''} nearby
                </span>
              ) : (
                <span className="stats-empty">
                  🏢 No organizations found within 20km
                </span>
              )}
            </div>
          </div>
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
                      <p><small>📍 {ngo.distance} km away</small></p>
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
          </div>

          {/* NGOs List */}
          <div className="real-ngos-list">
            <div className="results-count">
              <strong>Search Results (20km radius)</strong>
            </div>
            
            {ngos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3>No organizations found within 20km</h3>
                <p>Try checking nearby areas or contact us to add your organization.</p>
                <button onClick={getUserLocation} className="btn btn-primary">
                  🔄 Search Again
                </button>
              </div>
            ) : (
              ngos.map(ngo => (
                <div key={ngo.id} className="real-ngo-card">
                  <div className="real-ngo-header">
                    <h3>{ngo.name}</h3>
                    <div className="distance-badge">
                      📍 {ngo.distance} km
                    </div>
                  </div>

                  <div className="real-ngo-details">
                    <p className="real-ngo-type">🏷️ {ngo.type}</p>
                    <p className="real-ngo-address">📍 {ngo.address}</p>
                    
                    {ngo.phone && (
                      <p className="real-ngo-phone">📞 {ngo.phone}</p>
                    )}
                    
                    {ngo.email && (
                      <p className="real-ngo-email">📧 {ngo.email}</p>
                    )}
                    
                    {ngo.contact_person && (
                      <p className="real-ngo-contact">👤 {ngo.contact_person}</p>
                    )}

                    {ngo.source === 'database' && (
                      <span className="source-badge verified">✅ Verified NGO</span>
                    )}
                    {ngo.source === 'openstreetmap' && (
                      <span className="source-badge community">🗺️ Community Organization</span>
                    )}
                  </div>

                  <div className="real-ngo-actions">
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

export default RealNearbyNgos;