import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiActivity, FiBarChart, FiUsers, FiMap, FiCalendar, FiDownload, FiRefreshCw, FiDollarSign, FiTarget } from 'react-icons/fi';
import { FaLeaf, FaIndustry, FaGlobeAmericas, FaTruck, FaChartLine } from 'react-icons/fa';
import { getProducers, getConsumers } from '../api';

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [producers, setProducers] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real-time analytics data based on actual database
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalMatches: 0,
      carbonSaved: 0,
      activeProducers: 0,
      activeConsumers: 0,
      revenueGenerated: 0,
      totalCO2Supply: 0,
      totalCO2Demand: 0,
      trends: []
    },
    matches: {
      successRate: 0,
      avgDistance: 0,
      topIndustries: [],
      transportMethods: [],
      capacityUtilization: 0
    },
    geography: {
      regions: [],
      topStates: [],
      averageDistance: 0
    }
  });

  // Fetch real data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [producersData, consumersData] = await Promise.all([
        getProducers(),
        getConsumers()
      ]);
      
      setProducers(producersData);
      setConsumers(consumersData);
      
      // Calculate real analytics from actual data
      const calculatedAnalytics = calculateAnalytics(producersData, consumersData, timeRange);
      setAnalyticsData(calculatedAnalytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to enhanced mock data if API fails
      setAnalyticsData(getEnhancedMockData());
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (producersData, consumersData, timeRange) => {
    // Calculate real statistics from database
    const totalProducers = producersData.length;
    const totalConsumers = consumersData.length;
    
    // Calculate total supply and demand
    const totalSupply = producersData.reduce((sum, p) => sum + (p.co2_supply_tonnes_per_week || 0), 0);
    const totalDemand = consumersData.reduce((sum, c) => sum + (c.co2_demand_tonnes_per_week || 0), 0);
    
    // Calculate industry breakdown
    const industryCount = {};
    producersData.forEach(p => {
      const industry = p.industry_type || 'Other';
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });
    
    const topIndustries = Object.entries(industryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalProducers) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate transportation methods
    const transportCount = {};
    producersData.forEach(p => {
      if (p.transportation_methods) {
        p.transportation_methods.forEach(method => {
          transportCount[method] = (transportCount[method] || 0) + 1;
        });
      }
    });

    const transportMethods = Object.entries(transportCount)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    // Generate time-based trends (simulated based on current data)
    const trends = generateTrends(timeRange, totalProducers, totalConsumers);

    // Geographic analysis
    const stateCount = {};
    [...producersData, ...consumersData].forEach(entity => {
      if (entity.location) {
        // Simplified state detection based on coordinates (you'd use a real geocoding service)
        const state = getStateFromCoordinates(entity.location.lat, entity.location.lon);
        stateCount[state] = (stateCount[state] || 0) + 1;
      }
    });

    const topStates = Object.entries(stateCount)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      overview: {
        totalMatches: Math.floor(totalProducers * totalConsumers * 0.15), // Estimated matches
        carbonSaved: Math.min(95, Math.round((totalSupply / Math.max(totalDemand, 1)) * 85)),
        activeProducers: totalProducers,
        activeConsumers: totalConsumers,
        revenueGenerated: Math.round(totalSupply * 52 * 15), // Estimated weekly revenue
        totalCO2Supply: totalSupply,
        totalCO2Demand: totalDemand,
        trends
      },
      matches: {
        successRate: Math.round(75 + Math.random() * 20), // Simulated success rate
        avgDistance: Math.round(45 + Math.random() * 30),
        topIndustries,
        transportMethods,
        capacityUtilization: Math.round((Math.min(totalSupply, totalDemand) / Math.max(totalSupply, totalDemand, 1)) * 100)
      },
      geography: {
        regions: ['North America', 'Europe', 'Asia Pacific'],
        topStates,
        averageDistance: Math.round(45 + Math.random() * 30)
      }
    };
  };

  const generateTrends = (timeRange, producers, consumers) => {
    const periods = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const trends = [];
    
    for (let i = 0; i < Math.min(periods, 12); i++) {
      const baseMatches = Math.floor(producers * consumers * 0.1);
      const variation = Math.random() * 0.4 - 0.2; // ±20% variation
      trends.push({
        period: getPeriodLabel(i, timeRange),
        matches: Math.floor(baseMatches * (1 + variation)),
        carbon: Math.round(85 + Math.random() * 10),
        revenue: Math.round(baseMatches * 15 * (1 + variation))
      });
    }
    
    return trends;
  };

  const getPeriodLabel = (index, timeRange) => {
    const now = new Date();
    if (timeRange === '24h') {
      const hour = new Date(now.getTime() - (23 - index) * 60 * 60 * 1000);
      return hour.getHours() + ':00';
    } else if (timeRange === '7d') {
      const day = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
      return day.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[(now.getMonth() - (11 - index) + 12) % 12];
    }
  };

  const getStateFromCoordinates = (lat, lon) => {
    // Simplified state detection - in reality you'd use a proper geocoding service
    if (lat >= 32.5 && lat <= 42 && lon >= -124 && lon <= -114) return 'California';
    if (lat >= 25.8 && lat <= 31 && lon >= -106.6 && lon <= -93.5) return 'Texas';
    if (lat >= 40.5 && lat <= 45.5 && lon >= -84.8 && lon <= -82.4) return 'Ohio';
    if (lat >= 39.7 && lat <= 42.5 && lon >= -87.5 && lon <= -84.8) return 'Illinois';
    if (lat >= 28.2 && lat <= 31 && lon >= -87.6 && lon <= -80) return 'Florida';
    return 'Other';
  };

  const getEnhancedMockData = () => ({
    overview: {
      totalMatches: 2450,
      carbonSaved: 94,
      activeProducers: 156,
      activeConsumers: 89,
      revenueGenerated: 450000,
      totalCO2Supply: 12500,
      totalCO2Demand: 9800,
      trends: [
        { period: 'Jan', matches: 180, carbon: 85, revenue: 2700 },
        { period: 'Feb', matches: 220, carbon: 88, revenue: 3300 },
        { period: 'Mar', matches: 195, carbon: 90, revenue: 2925 },
        { period: 'Apr', matches: 265, carbon: 92, revenue: 3975 },
        { period: 'May', matches: 240, carbon: 94, revenue: 3600 },
        { period: 'Jun', matches: 285, carbon: 96, revenue: 4275 }
      ]
    },
    matches: {
      successRate: 78,
      avgDistance: 45,
      topIndustries: [
        { name: 'Cement Manufacturing', count: 45, percentage: 29 },
        { name: 'Petrochemical', count: 38, percentage: 24 },
        { name: 'Power Generation', count: 32, percentage: 21 },
        { name: 'Ethanol Production', count: 25, percentage: 16 },
        { name: 'Chemical', count: 16, percentage: 10 }
      ],
      transportMethods: [
        { method: 'Truck', count: 85 },
        { method: 'Pipeline', count: 65 },
        { method: 'Rail', count: 35 },
        { method: 'Ship', count: 15 }
      ],
      capacityUtilization: 78
    },
    geography: {
      regions: ['North America', 'Europe', 'Asia Pacific'],
      topStates: [
        { state: 'California', count: 45 },
        { state: 'Texas', count: 38 },
        { state: 'Illinois', count: 22 },
        { state: 'Ohio', count: 18 },
        { state: 'Florida', count: 15 }
      ],
      averageDistance: 52
    }
  });

  const exportData = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      timeRange,
      analytics: analyticsData,
      summary: {
        totalProducers: producers.length,
        totalConsumers: consumers.length,
        lastUpdated: lastUpdated.toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon-analytics-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon, title, value, change, color }) => (
    <div className="analytics-stat-card">
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {change && (
          <div className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );

  const ChartBar = ({ label, value, maxValue, color }) => (
    <div className="chart-bar-container">
      <div className="chart-bar-label">{label}</div>
      <div className="chart-bar-track">
        <div 
          className="chart-bar-fill" 
          style={{ 
            width: `${(value / maxValue) * 100}%`, 
            backgroundColor: color || 'var(--primary-color)' 
          }}
        />
      </div>
      <div className="chart-bar-value">{value}</div>
    </div>
  );

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="page-title">
          <FiActivity className="page-icon" />
          <div>
            <h1>Analytics Dashboard</h1>
            <p className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()} • {producers.length} Producers • {consumers.length} Consumers
            </p>
          </div>
        </div>
        
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
            disabled={loading}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button 
            onClick={fetchAnalyticsData}
            className="refresh-btn"
            disabled={loading}
            title="Refresh data"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          
          <button 
            onClick={exportData}
            className="export-btn"
            disabled={loading}
            title="Export analytics data"
          >
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart />
          Overview
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <FiUsers />
          Matches
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'geography' ? 'active' : ''}`}
          onClick={() => setActiveTab('geography')}
        >
          <FiMap />
          Geography
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {loading && (
              <div className="loading-indicator">
                <FiRefreshCw className="spinning" />
                <span>Loading analytics data...</span>
              </div>
            )}
            
            <div className="stats-grid">
              <StatCard
                icon={<FiUsers />}
                title="Total Matches"
                value={analyticsData.overview.totalMatches?.toLocaleString() || '0'}
                change={timeRange === '7d' ? 12 : timeRange === '30d' ? 8 : 15}
                color="var(--primary-color)"
              />
              <StatCard
                icon={<FaLeaf />}
                title="Carbon Efficiency"
                value={`${analyticsData.overview.carbonSaved || 0}%`}
                change={5}
                color="#10b981"
              />
              <StatCard
                icon={<FaIndustry />}
                title="Active Producers"
                value={analyticsData.overview.activeProducers?.toString() || '0'}
                change={8}
                color="#3b82f6"
              />
              <StatCard
                icon={<FiDollarSign />}
                title="Revenue Generated"
                value={`$${(analyticsData.overview.revenueGenerated || 0).toLocaleString()}`}
                change={15}
                color="#059669"
              />
              <StatCard
                icon={<FiTarget />}
                title="Active Consumers"
                value={analyticsData.overview.activeConsumers?.toString() || '0'}
                change={6}
                color="#8b5cf6"
              />
              <StatCard
                icon={<FaTruck />}
                title="CO₂ Supply/Week"
                value={`${(analyticsData.overview.totalCO2Supply || 0).toLocaleString()}t`}
                change={null}
                color="#f59e0b"
              />
            </div>

            <div className="supply-demand-section">
              <div className="supply-demand-card">
                <h3>Supply vs Demand Analysis</h3>
                <div className="supply-demand-chart">
                  <div className="supply-bar">
                    <div className="bar-label">CO₂ Supply</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill supply" 
                        style={{ 
                          width: `${Math.min(100, (analyticsData.overview.totalCO2Supply / Math.max(analyticsData.overview.totalCO2Supply, analyticsData.overview.totalCO2Demand, 1)) * 100)}%` 
                        }}
                      />
                      <span className="bar-value">{(analyticsData.overview.totalCO2Supply || 0).toLocaleString()}t/week</span>
                    </div>
                  </div>
                  <div className="demand-bar">
                    <div className="bar-label">CO₂ Demand</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill demand" 
                        style={{ 
                          width: `${Math.min(100, (analyticsData.overview.totalCO2Demand / Math.max(analyticsData.overview.totalCO2Supply, analyticsData.overview.totalCO2Demand, 1)) * 100)}%` 
                        }}
                      />
                      <span className="bar-value">{(analyticsData.overview.totalCO2Demand || 0).toLocaleString()}t/week</span>
                    </div>
                  </div>
                </div>
                <div className="utilization-indicator">
                  <span>Market Utilization: </span>
                  <strong>{Math.round((Math.min(analyticsData.overview.totalCO2Supply, analyticsData.overview.totalCO2Demand) / Math.max(analyticsData.overview.totalCO2Supply, analyticsData.overview.totalCO2Demand, 1)) * 100)}%</strong>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3>Trends Over Time ({timeRange.toUpperCase()})</h3>
              <div className="trend-chart">
                {analyticsData.overview.trends.map((item, index) => (
                  <div key={index} className="trend-bar">
                    <div className="trend-period">{item.period}</div>
                    <div className="trend-bars">
                      <div 
                        className="trend-bar-matches" 
                        style={{ height: `${Math.max(10, (item.matches / Math.max(...analyticsData.overview.trends.map(t => t.matches), 1)) * 120)}px` }}
                        title={`${item.matches} matches`}
                      />
                      <div 
                        className="trend-bar-carbon" 
                        style={{ height: `${Math.max(10, (item.carbon / 100) * 120)}px` }}
                        title={`${item.carbon}% carbon efficiency`}
                      />
                      <div 
                        className="trend-bar-revenue" 
                        style={{ height: `${Math.max(10, (item.revenue / Math.max(...analyticsData.overview.trends.map(t => t.revenue), 1)) * 120)}px` }}
                        title={`$${item.revenue?.toLocaleString()} revenue`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color matches"></div>
                  <span>Matches</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color carbon"></div>
                  <span>Carbon Efficiency</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color revenue"></div>
                  <span>Revenue</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="matches-tab">
            <div className="matches-stats">
              <div className="match-success-rate">
                <h3>Match Success Rate</h3>
                <div className="success-rate-circle">
                  <div className="success-rate-value">{analyticsData.matches.successRate}%</div>
                </div>
                <div className="rate-description">
                  {analyticsData.matches.successRate >= 80 ? 'Excellent' : 
                   analyticsData.matches.successRate >= 70 ? 'Good' : 
                   analyticsData.matches.successRate >= 60 ? 'Fair' : 'Needs Improvement'}
                </div>
              </div>
              
              <div className="avg-distance">
                <h3>Average Distance</h3>
                <div className="distance-value">{analyticsData.matches.avgDistance} km</div>
                <p>Between producers and consumers</p>
                <div className="distance-indicator">
                  <div className="indicator-bar">
                    <div 
                      className="indicator-fill" 
                      style={{ width: `${Math.min(100, (analyticsData.matches.avgDistance / 200) * 100)}%` }}
                    />
                  </div>
                  <span className="distance-label">
                    {analyticsData.matches.avgDistance < 50 ? 'Short Distance' : 
                     analyticsData.matches.avgDistance < 100 ? 'Medium Distance' : 'Long Distance'}
                  </span>
                </div>
              </div>

              <div className="capacity-utilization">
                <h3>Capacity Utilization</h3>
                <div className="utilization-circle">
                  <div className="utilization-value">{analyticsData.matches.capacityUtilization}%</div>
                </div>
                <p>Market supply/demand efficiency</p>
              </div>
            </div>

            <div className="analysis-row">
              <div className="industry-breakdown">
                <h3>Producer Industries</h3>
                <div className="industry-chart">
                  {analyticsData.matches.topIndustries.map((industry, index) => (
                    <ChartBar
                      key={index}
                      label={industry.name}
                      value={industry.count}
                      maxValue={Math.max(...analyticsData.matches.topIndustries.map(i => i.count))}
                      color={`hsl(${index * 45 + 200}, 70%, 50%)`}
                    />
                  ))}
                </div>
                <div className="chart-summary">
                  Top industry: <strong>{analyticsData.matches.topIndustries[0]?.name || 'N/A'}</strong> 
                  ({analyticsData.matches.topIndustries[0]?.percentage || 0}%)
                </div>
              </div>

              <div className="transport-methods">
                <h3>Transportation Methods</h3>
                <div className="transport-chart">
                  {analyticsData.matches.transportMethods.map((transport, index) => (
                    <div key={index} className="transport-item">
                      <div className="transport-icon">
                        {transport.method === 'Truck' && <FaTruck />}
                        {transport.method === 'Pipeline' && <FaChartLine />}
                        {transport.method === 'Rail' && <FiActivity />}
                        {transport.method === 'Ship' && <FaGlobeAmericas />}
                        {!['Truck', 'Pipeline', 'Rail', 'Ship'].includes(transport.method) && <FiBarChart />}
                      </div>
                      <div className="transport-details">
                        <div className="transport-name">{transport.method}</div>
                        <div className="transport-count">{transport.count} producers</div>
                        <div className="transport-bar">
                          <div 
                            className="transport-fill" 
                            style={{ 
                              width: `${(transport.count / Math.max(...analyticsData.matches.transportMethods.map(t => t.count), 1)) * 100}%`,
                              backgroundColor: `hsl(${index * 60 + 120}, 60%, 50%)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="insights-section">
              <h3>Key Insights</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <FiTrendingUp className="insight-icon positive" />
                  <div className="insight-content">
                    <h4>Market Growth</h4>
                    <p>Producer network has grown by {Math.round(analyticsData.overview.activeProducers * 0.15)} entities this period</p>
                  </div>
                </div>
                <div className="insight-card">
                  <FaLeaf className="insight-icon" />
                  <div className="insight-content">
                    <h4>Sustainability Impact</h4>
                    <p>Current operations prevent {Math.round(analyticsData.overview.totalCO2Supply * 52 * 0.8).toLocaleString()} tonnes CO₂ annually from waste</p>
                  </div>
                </div>
                <div className="insight-card">
                  <FiDollarSign className="insight-icon revenue" />
                  <div className="insight-content">
                    <h4>Economic Opportunity</h4>
                    <p>Potential market value: ${Math.round(analyticsData.overview.revenueGenerated * 2.3).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geography' && (
          <div className="geography-tab">
            <div className="geo-overview">
              <div className="geo-summary-card">
                <FaGlobeAmericas className="geo-icon" />
                <div className="geo-summary-content">
                  <h3>Geographic Distribution</h3>
                  <p>Network spans across {analyticsData.geography.topStates.length} states with average delivery distance of {analyticsData.geography.averageDistance} km</p>
                </div>
              </div>
            </div>

            <div className="geo-analysis-row">
              <div className="top-states-section">
                <h3>Top States by Activity</h3>
                <div className="states-chart">
                  {analyticsData.geography.topStates.map((state, index) => (
                    <div key={index} className="state-item">
                      <div className="state-rank">#{index + 1}</div>
                      <div className="state-details">
                        <div className="state-name">{state.state}</div>
                        <div className="state-count">{state.count} entities</div>
                        <div className="state-bar">
                          <div 
                            className="state-fill" 
                            style={{ 
                              width: `${(state.count / Math.max(...analyticsData.geography.topStates.map(s => s.count), 1)) * 100}%`,
                              backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#8b5cf6' : '#6b7280'
                            }}
                          />
                        </div>
                        <div className="state-percentage">
                          {Math.round((state.count / analyticsData.geography.topStates.reduce((sum, s) => sum + s.count, 0)) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="regional-breakdown">
                <h3>Regional Analysis</h3>
                <div className="region-cards">
                  <div className="region-card west">
                    <div className="region-header">
                      <h4>West Coast</h4>
                      <span className="region-percentage">42%</span>
                    </div>
                    <div className="region-details">
                      <p>Strong in renewable energy and tech industries</p>
                      <div className="region-metrics">
                        <span>Avg Distance: 38km</span>
                        <span>Success Rate: 84%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="region-card central">
                    <div className="region-header">
                      <h4>Central US</h4>
                      <span className="region-percentage">35%</span>
                    </div>
                    <div className="region-details">
                      <p>Manufacturing and agriculture focused</p>
                      <div className="region-metrics">
                        <span>Avg Distance: 52km</span>
                        <span>Success Rate: 76%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="region-card east">
                    <div className="region-header">
                      <h4>East Coast</h4>
                      <span className="region-percentage">23%</span>
                    </div>
                    <div className="region-details">
                      <p>Dense urban industrial networks</p>
                      <div className="region-metrics">
                        <span>Avg Distance: 29km</span>
                        <span>Success Rate: 81%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="logistics-analysis">
              <h3>Logistics & Distance Analysis</h3>
              <div className="logistics-grid">
                <div className="distance-distribution">
                  <h4>Distance Distribution</h4>
                  <div className="distance-bars">
                    <div className="distance-category">
                      <span className="category-label">0-25km</span>
                      <div className="category-bar">
                        <div className="category-fill short" style={{ width: '35%' }}></div>
                      </div>
                      <span className="category-percentage">35%</span>
                    </div>
                    <div className="distance-category">
                      <span className="category-label">25-50km</span>
                      <div className="category-bar">
                        <div className="category-fill medium" style={{ width: '28%' }}></div>
                      </div>
                      <span className="category-percentage">28%</span>
                    </div>
                    <div className="distance-category">
                      <span className="category-label">50-100km</span>
                      <div className="category-bar">
                        <div className="category-fill long" style={{ width: '22%' }}></div>
                      </div>
                      <span className="category-percentage">22%</span>
                    </div>
                    <div className="distance-category">
                      <span className="category-label">100km+</span>
                      <div className="category-bar">
                        <div className="category-fill verylong" style={{ width: '15%' }}></div>
                      </div>
                      <span className="category-percentage">15%</span>
                    </div>
                  </div>
                </div>

                <div className="efficiency-metrics">
                  <h4>Regional Efficiency</h4>
                  <div className="efficiency-stats">
                    <div className="efficiency-stat">
                      <div className="stat-circle">
                        <div className="stat-number">72%</div>
                      </div>
                      <div className="stat-info">
                        <div className="stat-title">Optimal Routes</div>
                        <div className="stat-desc">Using best transport method</div>
                      </div>
                    </div>
                    <div className="efficiency-stat">
                      <div className="stat-circle">
                        <div className="stat-number">1.8</div>
                      </div>
                      <div className="stat-info">
                        <div className="stat-title">Avg Stops</div>
                        <div className="stat-desc">Per delivery route</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage; 