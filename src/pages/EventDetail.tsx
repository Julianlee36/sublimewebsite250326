import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData, Event, Player } from '../cms/DataContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageWithFallback from '../components/ImageWithFallback';
import '../styles/EventDetail.css';

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, players } = useData();
  const [event, setEvent] = useState<Event | null>(null);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [campaignPlayers, setCampaignPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roster');

  // Function to fetch and refresh the event image URL
  const fetchEventImage = async (eventObj: Event) => {
    if (!eventObj || !eventObj.image) {
      setEventImage(null);
      return;
    }
    
    setIsImageLoading(true);
    
    try {
      // Check if the image URL is already a valid Firebase Storage URL with auth token
      if (eventObj.image.includes('firebasestorage.googleapis.com') && eventObj.image.includes('token=')) {
        console.log("Event already has a valid image URL with auth token");
        setEventImage(eventObj.image);
        return;
      }
      
      // Extract the path from the Firebase Storage URL (if possible)
      if (eventObj.image.includes('firebasestorage.googleapis.com')) {
        // Try to get a new download URL for the image
        try {
          // Extract the path from the URL - this is a simplified approach
          // A more robust approach would parse the URL and extract just the path
          const pathRegex = /\/o\/(.+?)(\?|$)/;
          const match = eventObj.image.match(pathRegex);
          
          if (match && match[1]) {
            // Decode the path that was URL-encoded
            const path = decodeURIComponent(match[1]);
            console.log("Extracted path from Firebase URL:", path);
            
            // Get a fresh download URL with a valid token
            const storageReference = ref(storage, path);
            const freshUrl = await getDownloadURL(storageReference);
            console.log("Got fresh image URL with auth token");
            setEventImage(freshUrl);
          } else {
            console.log("Could not extract path from Firebase URL, using original URL");
            setEventImage(eventObj.image);
          }
        } catch (storageError) {
          console.error("Error refreshing Firebase Storage URL:", storageError);
          // Fall back to the original URL
          setEventImage(eventObj.image);
        }
      } else {
        // Not a Firebase Storage URL, use as is
        setEventImage(eventObj.image);
      }
    } catch (error) {
      console.error("Error handling event image:", error);
      setEventImage(eventObj.image); // Fallback to original URL
    } finally {
      setIsImageLoading(false);
    }
  };

  // Function to fetch campaign roster players
  const fetchCampaignRoster = async (campaignId: string) => {
    setIsRosterLoading(true);
    try {
      // First check if this event already has a roster attached in memory
      const currentEvent = events.find(e => e.id.toString() === campaignId);
      
      if (currentEvent?.roster && Array.isArray(currentEvent.roster) && currentEvent.roster.length > 0) {
        console.log("Using roster from event object:", currentEvent.roster.length, "players");
        setCampaignPlayers(currentEvent.roster);
        return;
      }
      
      // Otherwise, fetch player data from Firestore
      console.log(`Fetching campaign roster for campaign ID: ${campaignId}`);
      
      // Approach 1: Check if the campaign has roster IDs stored
      const campaignDoc = await getDoc(doc(db, 'website', 'events'));
      if (campaignDoc.exists() && campaignDoc.data()?.data) {
        const allEvents = campaignDoc.data().data;
        const campaignData = allEvents.find((e: any) => e.id.toString() === campaignId);
        
        if (campaignData && campaignData.roster && Array.isArray(campaignData.roster)) {
          console.log("Found roster data in Firestore campaign document:", campaignData.roster.length, "players");
          setCampaignPlayers(campaignData.roster);
          return;
        }
      }
      
      // Approach 2: If no roster found directly, look for players with team assignment matching campaign name
      const playersDoc = await getDoc(doc(db, 'website', 'players'));
      if (playersDoc.exists() && playersDoc.data()?.data) {
        const allPlayers = playersDoc.data().data;
        
        // If the event has a teamName property, use that to match players
        if (event?.teamName) {
          const matchedPlayers = allPlayers.filter((player: Player) => 
            player.team === event.teamName
          );
          
          console.log(`Found ${matchedPlayers.length} players matching team name "${event.teamName}"`);
          setCampaignPlayers(matchedPlayers);
        }
        // Otherwise, use the current global players that aren't assigned to other teams
        else {
          setCampaignPlayers(players);
        }
      } else {
        // Fallback to current global players state if Firestore query fails
        setCampaignPlayers(players);
      }
    } catch (error) {
      console.error("Error fetching campaign roster:", error);
      // Fallback to using any roster data already in the event object
      if (event?.roster && Array.isArray(event.roster)) {
        setCampaignPlayers(event.roster);
      } else {
        setCampaignPlayers([]);
      }
    } finally {
      setIsRosterLoading(false);
    }
  };

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      try {
        // Make sure events is defined and is an array before using find
        if (events && Array.isArray(events)) {
          // Find the event with the matching ID without refreshing first
          const foundEvent = events.find(e => e && typeof e === 'object' && e.id && e.id.toString() === eventId);
          if (foundEvent) {
            setEvent(foundEvent);
            
            // Fetch/refresh the event image URL
            await fetchEventImage(foundEvent);
            
            // If this is a campaign, fetch its roster
            if (foundEvent.eventType === 'campaign' && eventId) {
              fetchCampaignRoster(eventId);
            }
          }
        }
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvent();
  }, [eventId, events, players]);

  // Redirect to schedule page if event not found
  useEffect(() => {
    if (!isLoading && !event) {
      navigate('/schedule', { replace: true });
    }
  }, [event, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="event-detail-page">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!event) {
    return null; // We'll redirect in the useEffect
  }

  // Format date(s) nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Create appropriate date display (single date or date range)
  let dateDisplay;
  if (event.eventType === 'campaign' && event.endDate) {
    // For campaigns, show date range
    const startDate = formatDate(event.date);
    const endDate = formatDate(event.endDate);
    dateDisplay = `${startDate} - ${endDate}`;
  } else {
    // For single events, show just the date
    dateDisplay = formatDate(event.date);
  }

  // Determine event status text and background color
  let statusText = '';
  let statusClass = '';
  
  // Update status text based on both type and eventType
  if (event.type === 'upcoming') {
    statusText = event.eventType === 'campaign' ? 'Upcoming Campaign' : 'Upcoming Event';
    statusClass = 'upcoming-status';
  } else if (event.type === 'current') {
    statusText = event.eventType === 'campaign' ? 'Ongoing Campaign' : 'Ongoing Event';
    statusClass = 'current-status';
  } else if (event.type === 'past') {
    statusText = event.eventType === 'campaign' ? 'Completed Campaign' : 'Completed Event';
    statusClass = 'past-status';
  }

  // Function to render tabs based on event type
  const renderTabs = () => {
    const tabs = [];
    
    // Only show roster tab for campaigns
    if (event.eventType === 'campaign') {
      tabs.push({ id: 'roster', label: 'Roster' });
    }
    
    return (
      <div className="event-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };
  
  // Function to render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="tab-content about-tab">
            <div className="event-description">
              <p>{event.description}</p>
            </div>
            
            {event.result && (
              <div className="event-result">
                <h3>Results</h3>
                <p>{event.result}</p>
              </div>
            )}
            
            {event.livestreamLink && (
              <div className="event-livestream">
                <h3>Livestream</h3>
                <a 
                  href={event.livestreamLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="livestream-button"
                >
                  Watch Livestream
                </a>
              </div>
            )}
          </div>
        );
      
      case 'roster':
        return (
          <div className="tab-content roster-tab">
            {isRosterLoading ? (
              <div className="loading-container">
                <LoadingSpinner />
              </div>
            ) : campaignPlayers && campaignPlayers.length > 0 ? (
              <div className="campaign-roster">
                <h3 className="roster-heading">
                  {event.teamName ? `${event.teamName} Roster` : 'Campaign Roster'}
                </h3>
                
                <div className="players-grid">
                  {campaignPlayers.map(player => (
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-roster">
                <p className="no-roster">Roster information is not available for this campaign yet.</p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Function to render gallery section (only for completed events/campaigns)
  const renderGallery = () => {
    if (event.type !== 'past' || !event.gallery || event.gallery.length === 0) {
      return null;
    }
    
    return (
      <div className="event-gallery">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {event.gallery.map((image, index) => (
            <div key={index} className="gallery-item">
              <ImageWithFallback
                src={image}
                alt={`${event.title} image ${index + 1}`}
                fallbackSrc="/placeholder-gallery.jpg"
                className="gallery-image"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="event-detail-page">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Home</Link> &gt; <Link to="/schedule">Schedule</Link> &gt; <span>{event.title}</span>
        </div>
        
        <div className="event-detail-container">
          <div className={`event-status ${statusClass}`}>
            {statusText}
          </div>
          
          <h1>{event.title}</h1>
          
          <div className="event-header">
            <div className="event-metadata">
              <div className="metadata-item">
                <i className="event-icon date-icon">📅</i>
                <span>{dateDisplay}</span>
              </div>
              <div className="metadata-item">
                <i className="event-icon location-icon">📍</i>
                <span>{event.location}</span>
              </div>
            </div>
            
            <div className="event-image-container">
              {isImageLoading ? (
                <div className="image-loading">
                  <LoadingSpinner />
                </div>
              ) : eventImage ? (
                <ImageWithFallback
                  src={eventImage}
                  alt={event.title}
                  fallbackSrc="/placeholder-event.jpg"
                  className="event-full-image"
                />
              ) : (
                <div className="event-image-placeholder">
                  <div className="placeholder-text">
                    {event.title.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs interface */}
          {renderTabs()}
          
          {/* Tab content */}
          <div className="event-tab-content">
            {event.eventType === 'campaign' ? renderTabContent() : (
              <div className="tab-content about-tab">
                <div className="event-description">
                  <p>{event.description}</p>
                </div>
                
                {event.result && (
                  <div className="event-result">
                    <h3>Results</h3>
                    <p>{event.result}</p>
                  </div>
                )}
                
                {event.livestreamLink && (
                  <div className="event-livestream">
                    <h3>Livestream</h3>
                    <a 
                      href={event.livestreamLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="livestream-button"
                    >
                      Watch Livestream
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Gallery section (only for completed events) */}
          {renderGallery()}
          
          <div className="event-actions">
            <Link to="/schedule" className="back-button">
              Back to Schedule
            </Link>
            {event.type === 'upcoming' && (
              <a 
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${encodeURIComponent(event.date)}/${encodeURIComponent(event.eventType === 'campaign' && event.endDate ? event.endDate : event.date)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="add-calendar-button"
              >
                Add to Calendar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;