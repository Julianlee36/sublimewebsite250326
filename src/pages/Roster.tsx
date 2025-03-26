import React, { useState } from 'react';
import { useData } from '../cms/DataContext';

const Roster: React.FC = () => {
  const { players } = useData();
  
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
        <h1>Team Roster</h1>
        
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