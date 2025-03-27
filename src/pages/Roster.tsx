import React, { useState, useEffect } from 'react';
import { useData } from '../cms/DataContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ImageWithFallback from '../components/ImageWithFallback';

const Roster: React.FC = () => {
  const { players, refreshData } = useData();
  const [debugInfo, setDebugInfo] = useState({ showDebug: false, imageUrls: [] });
  
  // Force refresh data when component mounts
  useEffect(() => {
    const loadRosterData = async () => {
      try {
        console.log("Roster page: Loading data directly from Firestore");
        const playersDoc = await getDoc(doc(db, 'website', 'players'));
        
        if (playersDoc.exists() && playersDoc.data().data) {
          const firestorePlayers = playersDoc.data().data;
          console.log("Roster page: Direct Firestore data:", firestorePlayers);
          
          // Extract image URLs for debugging
          const imageUrls = firestorePlayers
            .filter((player: any) => player.image)
            .map((player: any) => ({
              playerId: player.id,
              playerName: player.name,
              imageUrl: player.image
            }));
          
          setDebugInfo(prev => ({ ...prev, imageUrls }));
          
          // We don't update state here, just logging to check what's in Firestore
        } else {
          console.log("Roster page: No data found in Firestore");
        }
      } catch (error) {
        console.error("Error loading roster data:", error);
      }
    };
    
    // Load both ways to compare
    loadRosterData();
    refreshData();
  }, []);
  
  // Debug helper to verify image URLs
  const toggleDebugInfo = () => {
    setDebugInfo(prev => ({ ...prev, showDebug: !prev.showDebug }));
  };
  
  
  // Commented out: This was clearing all players from localStorage and Firestore on page load
  // useEffect(() => {
  //   const clearMockPlayers = async () => {
  //     try {
  //       // Clear players array
  //       setPlayers([]);
  //       // Save empty array to localStorage
  //       localStorage.removeItem('players');
  //       // Save empty array to Firestore
  //       await setDoc(doc(db, 'website', 'players'), { data: [] });
  //       console.log("All players have been cleared from localStorage and Firestore");
  //     } catch (error) {
  //       console.error("Error clearing players:", error);
  //     }
  //   };
  //   
  //   clearMockPlayers();
  // }, []);
  
  // Filter for teams and captains
  const [filter, setFilter] = useState('all');
  
  // Get unique team names for filter
  const teams = Array.from(new Set(players.map(player => player.team))).filter(Boolean);
  
  const filteredPlayers = filter === 'all' 
    ? players 
    : filter === 'captains'
    ? players.filter(player => player.isCaptain)
    : players.filter(player => player.team === filter);

  return (
    <div className="roster-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Team Roster</h1>
          <div>
            <button 
              style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
              onClick={toggleDebugInfo}
            >
              {debugInfo.showDebug ? 'Hide Debug' : 'Debug Images'}
            </button>
            <button 
              style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
              onClick={() => refreshData()}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
        
        {/* Debug Panel - Only visible when debug is enabled */}
        {debugInfo.showDebug && (
          <div style={{ 
            margin: '20px 0', 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            background: '#f5f5f5' 
          }}>
            <h3>Debug Info - Stored Image URLs</h3>
            {debugInfo.imageUrls.length > 0 ? (
              <div>
                {debugInfo.imageUrls.map((item: { playerId: string|number; playerName: string; imageUrl: string }, index) => (
                  <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <p><strong>Player ID:</strong> {item.playerId} - {item.playerName}</p>
                    <p style={{ wordBreak: 'break-all' }}><strong>Image URL:</strong> {item.imageUrl}</p>
                    <div>
                      <p><strong>Image Preview:</strong></p>
                      <ImageWithFallback 
                        src={item.imageUrl} 
                        alt={`${item.playerName} preview`}
                        fallbackSrc=""
                        style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No image URLs found in player data. Add players with images first.</p>
            )}
          </div>
        )}
        
        <section className="player-profiles">
          <h2>Player Profiles</h2>
          
          <div className="roster-filters">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All Players
            </button>
            <button 
              className={filter === 'captains' ? 'active' : ''} 
              onClick={() => setFilter('captains')}
            >
              Team Captains
            </button>
            
            {/* Team filters */}
            {teams.map(team => (
              <button 
                key={team}
                className={filter === team ? 'active' : ''} 
                onClick={() => setFilter(team)}
              >
                {team}
              </button>
            ))}
          </div>
          
          {filter !== 'all' ? (
            // Display as a single grid for filtered views
            <div className="players-grid">
              {filteredPlayers.map(player => (
                <div key={player.id} className="player-card">
                  <div className="player-image">
                    {player.image ? (
                      <ImageWithFallback
                        src={player.image}
                        alt={`${player.name} #${player.number}`}
                        fallbackSrc="/placeholder-player.jpg"
                        className="player-photo"
                      />
                    ) : (
                      <div className="image-placeholder">
                        #{player.number}
                      </div>
                    )}
                    {player.isCaptain && <span className="captain-badge">Captain</span>}
                  </div>
                  <div className="player-info">
                    <h3>{player.name}</h3>
                    <p className="player-number">#{player.number}</p>
                    <p className="player-bio">{player.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Group by team when showing all players
            <div className="team-sections">
              {teams.map(team => {
                const teamPlayers = players.filter(player => player.team === team);
                if (teamPlayers.length === 0) return null;
                
                return (
                  <div key={team} className="team-section">
                    <h3 className="team-heading">{team}</h3>
                    <div className="players-grid">
                      {teamPlayers.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-image">
                            {player.image ? (
                              <ImageWithFallback
                                src={player.image}
                                alt={`${player.name} #${player.number}`}
                                fallbackSrc="/placeholder-player.jpg"
                                className="player-photo"
                              />
                            ) : (
                              <div className="image-placeholder">
                                #{player.number}
                              </div>
                            )}
                            {player.isCaptain && <span className="captain-badge">Captain</span>}
                          </div>
                          <div className="player-info">
                            <h3>{player.name}</h3>
                            <p className="player-number">#{player.number}</p>
                            <p className="player-bio">{player.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Show players without a team at the end */}
              {players.some(player => !player.team) && (
                <div className="team-section">
                  <h3 className="team-heading">Unassigned Players</h3>
                  <div className="players-grid">
                    {players
                      .filter(player => !player.team)
                      .map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-image">
                            {player.image ? (
                              <div 
                                className="player-photo" 
                                style={{ backgroundImage: `url(${player.image})` }}
                              ></div>
                            ) : (
                              <div className="image-placeholder">
                                #{player.number}
                              </div>
                            )}
                            {player.isCaptain && <span className="captain-badge">Captain</span>}
                          </div>
                          <div className="player-info">
                            <h3>{player.name}</h3>
                            <p className="player-number">#{player.number}</p>
                            <p className="player-bio">{player.bio}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="captains-coaches">
          <h2>Captains & Leadership</h2>
          <div className="leadership-content">
            <p>Our team is led by dedicated captains who help organize practices, develop strategies, and maintain team culture. Working closely with our coaching staff, they ensure that Sublime Ultimate operates at its highest potential.</p>
            <p>Captains are selected annually based on leadership qualities, commitment to the team, and ability to represent our values both on and off the field.</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Roster;