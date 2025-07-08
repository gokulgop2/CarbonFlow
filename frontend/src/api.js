// frontend/src/api.js

// Use environment variable for API base URL, fallback to Railway URL for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://carbonflow-production.up.railway.app';

console.log('🌐 API Base URL:', API_BASE_URL);

// Add a function to check if the API is available
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};

// Enhanced fetch with timeout and better error handling
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }
};

export const addProducer = async (producerData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/producers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producerData),
    });
    if (!response.ok) { 
      throw new Error(`Failed to add producer: ${response.status} ${response.statusText}`); 
    }
    return response.json();
  } catch (error) {
    console.error('Error adding producer:', error);
    throw error;
  }
};

export const addConsumer = async (consumerData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/consumers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consumerData),
    });
    if (!response.ok) { 
      throw new Error(`Failed to add consumer: ${response.status} ${response.statusText}`); 
    }
    return response.json();
  } catch (error) {
    console.error('Error adding consumer:', error);
    throw error;
  }
};

export const getProducers = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/producers`);
    if (!response.ok) { 
      throw new Error(`Failed to fetch producers: ${response.status} ${response.statusText}`); 
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching producers:', error);
    // Return mock data if API is down
    return [
      {
        id: 'demo-1',
        name: 'Demo Carbon Producer',
        industry_type: 'Demo Industry',
        co2_output_tonnes_per_year: 1000,
        co2_purity: 95,
        location: { lat: 37.7749, lon: -122.4194 },
        transportation_methods: ['Pipeline', 'Truck'],
        additional_info: 'Demo producer for testing purposes'
      }
    ];
  }
};

export const getConsumers = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/consumers`);
    if (!response.ok) { 
      throw new Error(`Failed to fetch consumers: ${response.status} ${response.statusText}`); 
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching consumers:', error);
    // Return mock data if API is down
    return [
      {
        id: 'demo-consumer-1',
        name: 'Demo Carbon Consumer',
        industry_type: 'Manufacturing',
        co2_demand_tonnes_per_week: 500,
        location: { lat: 37.7849, lon: -122.4094 },
        transportation_methods: ['Pipeline', 'Truck'],
        additional_info: 'Demo consumer for testing purposes'
      }
    ];
  }
};

export const getMatches = async (producerId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/matches?producer_id=${producerId}`);
    if (!response.ok) { 
      throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`); 
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    // Return mock data if API is down
    return [
      {
        id: 'demo-match-1',
        name: 'Demo Consumer',
        location: { lat: 37.7849, lon: -122.4094 },
        industry: 'Manufacturing',
        demand: 500
      }
    ];
  }
};

export const getAnalyzedMatches = async (producer, matches) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/analyze-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producer, matches }),
    });
    if (!response.ok) { 
      throw new Error(`Failed to get AI analysis for matches: ${response.status} ${response.statusText}`); 
    }
    return response.json();
  } catch (error) {
    console.error('Error analyzing matches:', error);
    // Return mock analysis if API is down
    return {
      ranked_matches: matches.map((match, index) => ({
        ...match,
        rank: index + 1,
        score: Math.random() * 100,
        distance: Math.random() * 200
      }))
    };
  }
};

export const getImpactReport = async (producer, consumer) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/impact-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producer, consumer }),
    });
    if (!response.ok) { 
      throw new Error(`Failed to generate impact report: ${response.status} ${response.statusText}`); 
    }
    return response.json();
  } catch (error) {
    console.error('Error generating impact report:', error);
    // Return mock report if API is down
    return {
      partnership: {
        producer: producer.name,
        consumer: consumer.name
      },
      impact: {
        carbon_reduction: 1000,
        revenue_potential: 50000,
        cost_savings: 25000
      }
    };
  }
};

export const geocodeAddress = async (address) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) {
      throw new Error(`Failed to geocode address: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error('Failed to geocode address. Please check if the address is valid.');
  }
};

// Vector System API Functions
export const getMatchingStats = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/matching-stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch matching stats: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching matching stats:', error);
    // Return mock data if API is down
    return {
      total_producers: 9,
      total_consumers: 5,
      avg_matches_per_producer: 2.11,
      vector_engine_stats: {
        producer_vectors: 9,
        consumer_vectors: 5,
        vector_dimensions: {
          producer: 32,
          consumer: 28
        }
      },
      weights: {
        vector_similarity: 0.35,
        capacity_compatibility: 0.25,
        distance_penalty: 0.20,
        quality_match: 0.15,
        transport_compatibility: 0.05
      }
    };
  }
};

export const rebuildVectors = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/rebuild-vectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to rebuild vectors: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error rebuilding vectors:', error);
    throw error;
  }
};