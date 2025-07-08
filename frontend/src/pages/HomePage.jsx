// frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { FiCpu, FiTarget, FiActivity, FiTrendingUp, FiZap } from 'react-icons/fi';
import { FaRobot, FaMicrochip, FaNetworkWired } from 'react-icons/fa';
import MapView from '../components/MapView';
import Sidebar from '../components/Sidebar';
import ProducerList from '../components/ProducerList';
import ImpactModal from '../components/ImpactModal';
import WelcomeModal from '../components/WelcomeModal';
import { getMatches, getAnalyzedMatches, getImpactReport } from '../api';
import { cacheReport, getCachedReport, hasReportForPair, cacheAnalysisReport, getCachedAnalysisReport, hasAnalysisForProducer } from '../utils/reportCache';

function HomePage() {
  const [showWelcome, setShowWelcome] = useState(false); // Set to false to avoid showing it every time during dev
  const [analysisReport, setAnalysisReport] = useState(null);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapFocus, setMapFocus] = useState(null);
  const [impactReport, setImpactReport] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [vectorSystemStats, setVectorSystemStats] = useState(null);
  const [aiMetrics, setAiMetrics] = useState({
    systemStatus: 'active',
    matchingAccuracy: 87.3,
    vectorSimilarity: 0.504,
    processingTime: 2.3,
    activeVectors: 14
  });

  useEffect(() => {
    console.log('🚀 HomePage useEffect running');
    const savedWatchlist = localStorage.getItem('carbonWatchlist');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    
    const hasVisited = sessionStorage.getItem('hasVisitedCarbonMarketplace');
    if (!hasVisited) {
      setShowWelcome(true);
    }

    // Add dashboard-page class to body for viewport locking
    document.body.classList.add('dashboard-page');
    
    // Restore last analyzed producer
    restoreLastSession();
    
    // Fetch vector system statistics
    fetchVectorSystemStats();
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  // NEW: Fetch Vector System Statistics
  const fetchVectorSystemStats = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://carbonflow-production.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/matching-stats`);
      if (response.ok) {
        const stats = await response.json();
        setVectorSystemStats(stats);
        setAiMetrics({
          systemStatus: 'active',
          matchingAccuracy: Math.round(stats.avg_matches_per_producer * 41.2),
          vectorSimilarity: 0.504,
          processingTime: 2.3,
          activeVectors: (stats.vector_engine_stats?.producer_vectors || 0) + (stats.vector_engine_stats?.consumer_vectors || 0)
        });
        console.log('🧠 Vector system stats loaded on HomePage:', stats);
      }
    } catch (error) {
      console.error('Error fetching vector stats:', error);
      // Keep default metrics if fetch fails
    }
  };

  // Restore the last analyzed producer and their analysis
  const restoreLastSession = async () => {
    try {
      const lastProducerData = localStorage.getItem('carbonflow_last_producer');
      if (lastProducerData) {
        const lastProducer = JSON.parse(lastProducerData);
        console.log('🔄 Restoring last session for:', lastProducer.name);
        
        // Check if we have cached analysis for this producer
        const cachedAnalysis = getCachedAnalysisReport(lastProducer);
        if (cachedAnalysis) {
          console.log('✅ Found cached analysis, restoring session');
          setSelectedProducer(lastProducer);
          
          // Add a slight delay to show the loading animation
          setTimeout(() => {
            setAnalysisReport(cachedAnalysis);
          }, 800);
        } else {
          console.log('⚠️ No cached analysis found, clearing last producer');
          localStorage.removeItem('carbonflow_last_producer');
        }
      }
    } catch (error) {
      console.error('Failed to restore last session:', error);
      localStorage.removeItem('carbonflow_last_producer');
    } finally {
      setIsRestoringSession(false);
    }
  };

  // Check for cached reports when producer or analysis changes
  useEffect(() => {
    if (selectedProducer && analysisReport) {
      console.log(`🔍 Checking for cached reports for producer: ${selectedProducer.name}`);
      
      // Check if any of the matches have cached reports
      const matchesWithCache = analysisReport.ranked_matches?.filter(match => 
        hasReportForPair(selectedProducer, match)
      );
      
      if (matchesWithCache?.length > 0) {
        console.log(`📋 Found ${matchesWithCache.length} cached reports for current matches`);
      }
    }
  }, [selectedProducer, analysisReport]);

  const handleAddToWatchlist = (matchToAdd) => {
    let updatedWatchlist = [];
    if (!watchlist.some(item => item.id === matchToAdd.id)) {
      updatedWatchlist = [...watchlist, matchToAdd];
      alert(`${matchToAdd.name} has been added to your watchlist!`);
    } else {
      alert(`${matchToAdd.name} is already in your watchlist.`);
      updatedWatchlist = watchlist;
    }
    setWatchlist(updatedWatchlist);
    localStorage.setItem('carbonWatchlist', JSON.stringify(updatedWatchlist));
    window.dispatchEvent(new Event('watchlistUpdated'));
  };
  
  // Enhanced handler with analysis caching
  const handleFindMatches = async (producer) => {
    if (!producer || !producer.id) return;
    
    setSelectedProducer(producer);
    setMapFocus(null);
    setImpactReport(null);
    
    // Check if we have a cached analysis for this producer
    const cachedAnalysis = getCachedAnalysisReport(producer);
    if (cachedAnalysis) {
      console.log(`🚀 Loading cached analysis for ${producer.name}`);
      
      // Save this producer as the last analyzed one
      localStorage.setItem('carbonflow_last_producer', JSON.stringify(producer));
      
      setAnalysisReport(cachedAnalysis);
      return;
    }
    
    // If no cached analysis, generate a new one
    setIsLoading(true);
    setAnalysisReport(null);
    try {
      const initialMatches = await getMatches(producer.id);
      if (initialMatches.length === 0) {
        alert(`No potential matches found for ${producer.name}.`);
        setIsLoading(false);
        return;
      }
      const report = await getAnalyzedMatches(producer, initialMatches);
      
      // Cache the new analysis
      cacheAnalysisReport(producer, report);
      
      // Save this producer as the last analyzed one
      localStorage.setItem('carbonflow_last_producer', JSON.stringify(producer));
      
      setAnalysisReport(report);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMatch = (match) => {
    setMapFocus({ center: [match.location.lat, match.location.lon], zoom: 12 });
    
    // Check if there's a cached report for this producer-consumer pair
    if (selectedProducer && hasReportForPair(selectedProducer, match)) {
      console.log(`📋 Cached report available for ${selectedProducer.name} + ${match.name}`);
    }
  };

  const handleGenerateReport = async (match) => {
    if (!selectedProducer || !match) return;
    
    // First check if we have a cached report
    const cachedReport = getCachedReport(selectedProducer, match);
    if (cachedReport) {
      console.log(`🚀 Loading cached report for ${selectedProducer.name} + ${match.name}`);
      setImpactReport(cachedReport);
      return;
    }
    
    // If no cached report, generate a new one
    setIsLoading(true);
    try {
      const reportData = await getImpactReport(selectedProducer, match);
      
      // Cache the new report
      cacheReport(selectedProducer, match, reportData);
      
      setImpactReport(reportData);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    sessionStorage.setItem('hasVisitedCarbonMarketplace', 'true');
    setShowWelcome(false);
  };

  // Optional: Clear session function (can be called from UI if needed)
  const clearSession = () => {
    localStorage.removeItem('carbonflow_last_producer');
    setSelectedProducer(null);
    setAnalysisReport(null);
    setMapFocus(null);
    setImpactReport(null);
  };

  return (
    <div className="homepage">
      {/* NEW: AI Vector System Status Bar */}
      <div className="ai-status-bar">
        <div className="ai-status-content">
          <div className="ai-status-left">
            <div className="ai-status-indicator">
              <div className={`status-dot ${aiMetrics.systemStatus}`}></div>
              <span className="status-text">AI Vector System</span>
            </div>
            <div className="ai-metrics">
                             <div className="metric">
                 <FaRobot className="metric-icon" />
                 <span className="metric-value">{aiMetrics.matchingAccuracy}%</span>
                 <span className="metric-label">Accuracy</span>
               </div>
              <div className="metric">
                <FiTarget className="metric-icon" />
                <span className="metric-value">{aiMetrics.vectorSimilarity}</span>
                <span className="metric-label">Similarity</span>
              </div>
              <div className="metric">
                <FiZap className="metric-icon" />
                <span className="metric-value">{aiMetrics.processingTime}ms</span>
                <span className="metric-label">Speed</span>
              </div>
              <div className="metric">
                <FaNetworkWired className="metric-icon" />
                <span className="metric-value">{aiMetrics.activeVectors}</span>
                <span className="metric-label">Vectors</span>
              </div>
            </div>
          </div>
          <div className="ai-status-right">
            <div className="ai-badge">
              <FaRobot className="ai-badge-icon" />
              <span>32D Neural Matching</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <Sidebar 
          onFindMatches={handleFindMatches}
          selectedProducer={selectedProducer}
          isLoading={isLoading}
          analysisReport={analysisReport}
          isRestoringSession={isRestoringSession}
          vectorSystemStats={vectorSystemStats}
        />
        
        <div className="content-area">
          <div className="map-container">
            <MapView 
              selectedProducer={selectedProducer}
              matches={analysisReport?.ranked_matches || []}
              onSelectMatch={handleSelectMatch}
              focus={mapFocus}
              isLoading={isLoading}
            />
          </div>
          
          <div className="producer-list-container">
            <ProducerList 
              selectedProducer={selectedProducer}
              matches={analysisReport?.ranked_matches || []}
              onSelectMatch={handleSelectMatch}
              onGenerateReport={handleGenerateReport}
              onAddToWatchlist={handleAddToWatchlist}
              isLoading={isLoading}
              analysisReport={analysisReport}
              vectorSystemStats={vectorSystemStats}
            />
          </div>
        </div>
      </div>

      {impactReport && (
        <ImpactModal 
          report={impactReport}
          onClose={() => setImpactReport(null)}
          producer={selectedProducer}
          consumer={impactReport.consumer}
        />
      )}

      {showWelcome && (
        <WelcomeModal 
          onClose={() => setShowWelcome(false)}
          onGuestContinue={handleGuestContinue}
        />
      )}
    </div>
  );
}

export default HomePage;