const axios = require('axios');
const pool = require('../config/database');

class EnhancedNgoService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    // Food-related keywords for better filtering
    this.foodKeywords = [
      'food', 'kitchen', 'meal', 'hunger', 'feed', 'bhojan', 'khana',
      'annapurna', 'community kitchen', 'food bank', 'food distribution',
      'charity food', 'free food', 'langar', 'bhandara', 'donation',
      'hunger relief', 'food rescue', 'surplus food', 'meal service'
    ];
  }

  async findNearbyNGOs(latitude, longitude, radius = 20000) {
    try {
      console.log(`🍽️ Searching for FOOD NGOs near: ${latitude}, ${longitude}, radius: ${radius}m`);

      // 1. Get enhanced OpenStreetMap results with food focus
      const osmNGOs = await this.getEnhancedOSMNGOs(latitude, longitude, radius);
      
      // 2. Get NGOs from our local database
      const localNGOs = await this.getLocalNGOs(latitude, longitude, radius);
      
      // 3. Combine and prioritize food-related NGOs
      const allNGOs = [...osmNGOs, ...localNGOs];
      const prioritizedNGOs = this.prioritizeFoodNGOs(allNGOs);
      
      // 4. Remove duplicates and sort
      const uniqueNGOs = this.removeDuplicates(prioritizedNGOs);
      
      console.log(`✅ Found ${uniqueNGOs.length} NGOs (${osmNGOs.length} from OSM, ${localNGOs.length} from DB) within ${radius/1000}km radius`);
      return uniqueNGOs.sort((a, b) => a.distance - b.distance);
      
    } catch (error) {
      console.error('Enhanced NGO service error:', error);
      // Fallback to local database only
      return await this.getLocalNGOs(latitude, longitude, radius);
    }
  }

  async getEnhancedOSMNGOs(lat, lng, radius) {
    try {
      // Enhanced query with more food-related categories
      const query = `
        [out:json][timeout:25];
        (
          // Food-specific categories
          node["amenity"="food_bank"](around:${radius},${lat},${lng});
          node["amenity"="soup_kitchen"](around:${radius},${lat},${lng});
          node["amenity"="social_facility"]["social_facility"="food_bank"](around:${radius},${lat},${lng});
          node["amenity"="social_facility"]["social_facility"="soup_kitchen"](around:${radius},${lat},${lng});
          node["amenity"="community_centre"](around:${radius},${lat},${lng});
          
          // NGOs and charities
          node["office"="ngo"](around:${radius},${lat},${lng});
          node["office"="charity"](around:${radius},${lat},${lng});
          node["office"="foundation"](around:${radius},${lat},${lng});
          node["amenity"="social_facility"](around:${radius},${lat},${lng});
          
          // Broader search with name filtering
          node[~"name"~".*food.*|.*kitchen.*|.*hunger.*|.*feed.*|.*bhojan.*|.*annapurna.*",i](around:${radius},${lat},${lng});
          node[~"name"~".*charity.*|.*trust.*|.*foundation.*|.*seva.*",i](around:${radius},${lat},${lng});
        );
        out body;
      `;

      const response = await axios.post(this.overpassUrl, query, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000
      });

      const elements = response.data.elements || [];
      console.log(`🗺️ OpenStreetMap found ${elements.length} potential organizations within ${radius/1000}km radius`);

      // Filter and enhance results
      const enhancedNGOs = elements.map(element => {
        const ngo = this.enhanceOSMData(element, lat, lng);
        return this.isFoodRelated(ngo) ? ngo : null;
      }).filter(ngo => ngo !== null);

      console.log(`🍽️ Filtered to ${enhancedNGOs.length} food-related NGOs`);
      return enhancedNGOs;

    } catch (error) {
      console.log('OpenStreetMap search failed:', error.message);
      return [];
    }
  }

  enhanceOSMData(element, userLat, userLng) {
    const tags = element.tags || {};
    const name = tags.name || 'Community Organization';
    
    // Enhanced type detection
    const type = this.detectNGOCategory(tags, name);
    const isFoodFocused = this.isFoodRelated({ name, tags, type });
    
    return {
      id: `osm_${element.id}`,
      name: name,
      type: type,
      category: this.getNGOCategory(tags, name),
      address: this.formatEnhancedAddress(tags),
      latitude: element.lat,
      longitude: element.lon,
      phone: tags.phone || tags['contact:phone'],
      website: tags.website || tags.url,
      description: this.generateDescription(tags, name),
      distance: this.calculateDistance(userLat, userLng, element.lat, element.lon),
      source: 'openstreetmap',
      food_related: isFoodFocused,
      tags: tags,
      confidence: this.calculateConfidence(tags, name, isFoodFocused)
    };
  }

  detectNGOCategory(tags, name) {
    const nameLower = name.toLowerCase();
    
    // Food-specific categories
    if (tags.amenity === 'food_bank' || tags['social_facility'] === 'food_bank') return 'Food Bank';
    if (tags.amenity === 'soup_kitchen' || nameLower.includes('kitchen')) return 'Community Kitchen';
    if (tags.amenity === 'social_facility') return 'Social Service';
    if (tags.office === 'ngo') return 'NGO';
    if (tags.office === 'charity') return 'Charity';
    if (tags.office === 'foundation') return 'Foundation';
    
    // Name-based detection
    if (nameLower.includes('food') || nameLower.includes('bhojan') || nameLower.includes('annapurna')) {
      return 'Food Service';
    }
    if (nameLower.includes('trust') || nameLower.includes('seva') || nameLower.includes('samiti')) {
      return 'Trust/Foundation';
    }
    
    return 'Community Organization';
  }

  getNGOCategory(tags, name) {
    const nameLower = name.toLowerCase();
    const categories = [];
    
    if (this.isFoodRelated({ name, tags })) categories.push('food');
    if (tags.amenity === 'social_facility') categories.push('social_service');
    if (tags.office === 'charity') categories.push('charity');
    if (nameLower.includes('trust') || nameLower.includes('foundation')) categories.push('trust');
    if (nameLower.includes('women') || nameLower.includes('child')) categories.push('women_child_welfare');
    if (nameLower.includes('education')) categories.push('education');
    if (nameLower.includes('health') || nameLower.includes('medical')) categories.push('health');
    
    return categories.length > 0 ? categories : ['community_service'];
  }

  isFoodRelated(ngo) {
    const { name, tags, type } = ngo;
    const nameLower = name.toLowerCase();
    
    // Direct category matches
    if (tags.amenity === 'food_bank' || tags['social_facility'] === 'food_bank') return true;
    if (tags.amenity === 'soup_kitchen') return true;
    if (type === 'Food Bank' || type === 'Community Kitchen') return true;
    
    // Name-based food detection
    const foodIndicators = this.foodKeywords;
    return foodIndicators.some(keyword => nameLower.includes(keyword));
  }

  formatEnhancedAddress(tags) {
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
      tags['addr:postcode']
    ].filter(Boolean);
    
    if (addressParts.length > 0) {
      return addressParts.join(', ');
    }
    
    // Fallback to other address fields
    return tags.address || tags['addr:full'] || 'Address not available';
  }

  generateDescription(tags, name) {
    if (tags.description) return tags.description;
    
    const type = this.detectNGOCategory(tags, name);
    const baseDescriptions = {
      'Food Bank': 'Food distribution and hunger relief services',
      'Community Kitchen': 'Provides free meals and food services',
      'NGO': 'Non-governmental organization serving the community',
      'Charity': 'Charitable organization helping those in need',
      'Social Service': 'Social welfare and community support services'
    };
    
    return baseDescriptions[type] || 'Community service organization';
  }

  calculateConfidence(tags, name, isFoodFocused) {
    let confidence = 0.3; // Base confidence
    
    if (tags.amenity === 'food_bank') confidence += 0.4;
    if (tags.amenity === 'soup_kitchen') confidence += 0.4;
    if (isFoodFocused) confidence += 0.2;
    if (tags.phone || tags.website) confidence += 0.1;
    if (tags['addr:street']) confidence += 0.1;
    
    return Math.min(confidence, 1.0).toFixed(2);
  }

  async getLocalNGOs(lat, lng, radius) {
    try {
      console.log('🔍 Fetching local NGOs from database...');
      
      // SIMPLIFIED QUERY - Only use columns that definitely exist
      const ngos = await pool.query(`
        SELECT 
          n.id, 
          n.name, 
          n.email, 
          np.phone, 
          np.description,
          np.latitude, 
          np.longitude, 
          np.address
        FROM ngo n 
        LEFT JOIN ngo_profiles np ON n.id = np.ngo_id
        WHERE np.latitude IS NOT NULL 
        AND np.longitude IS NOT NULL
      `);

      console.log(`📊 Found ${ngos.rows.length} NGOs in database`);

      const nearbyNGOs = ngos.rows.map(ngo => {
        try {
          const distance = this.calculateDistance(lat, lng, ngo.latitude, ngo.longitude);
          const serviceRadius = 20; // Default 20km
          
          // Only include NGOs within service radius
          if (distance <= serviceRadius) {
            let address = 'Address not available';
            
            // Safe address parsing
            try {
              if (ngo.address) {
                if (typeof ngo.address === 'string') {
                  // Try to parse JSON address
                  try {
                    const addressObj = JSON.parse(ngo.address);
                    address = addressObj.street || addressObj.address || ngo.address;
                  } catch (parseError) {
                    // If not JSON, use as is
                    address = ngo.address;
                  }
                } else {
                  address = ngo.address.street || ngo.address.address || 'Address available';
                }
              }
            } catch (e) {
              console.log('Address parsing error:', e.message);
              address = ngo.address || 'Address not available';
            }

            return {
              id: `db_${ngo.id}`,
              name: ngo.name,
              type: 'Verified NGO',
              category: ['food', 'verified'],
              address: address,
              phone: ngo.phone,
              email: ngo.email,
              latitude: ngo.latitude,
              longitude: ngo.longitude,
              distance: distance,
              service_radius: serviceRadius,
              source: 'database',
              description: ngo.description || 'Food donation and distribution service',
              food_related: true,
              verified: true,
              confidence: 0.9
            };
          }
          return null;
        } catch (error) {
          console.error('Error processing NGO:', ngo.id, error.message);
          return null;
        }
      }).filter(ngo => ngo !== null);

      console.log(`📍 ${nearbyNGOs.length} NGOs within ${radius/1000}km radius`);
      return nearbyNGOs;

    } catch (error) {
      console.error('Local NGO search error:', error);
      return [];
    }
  }

  prioritizeFoodNGOs(ngos) {
    return ngos.sort((a, b) => {
      // Priority: Food-related > Verified > Higher confidence > Shorter distance
      const aScore = (a.food_related ? 100 : 0) + (a.verified ? 50 : 0) + (a.confidence * 10);
      const bScore = (b.food_related ? 100 : 0) + (b.verified ? 50 : 0) + (b.confidence * 10);
      return bScore - aScore;
    });
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(2));
  }

  removeDuplicates(ngos) {
    const seen = new Set();
    return ngos.filter(ngo => {
      const key = `${ngo.name.toLowerCase()}_${ngo.latitude?.toFixed(4)}_${ngo.longitude?.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = new EnhancedNgoService();