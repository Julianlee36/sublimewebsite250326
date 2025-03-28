import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData, Event } from '../cms/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageWithFallback from '../components/ImageWithFallback';
import '../styles/EventDetail.css';

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = useData();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
          }
        }
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvent();
  }, [eventId, events]);

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

  // Format date nicely
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Determine event status text and background color
  let statusText = '';
  let statusClass = '';
  
  switch(event.type) {
    case 'upcoming':
      statusText = 'Upcoming Event';
      statusClass = 'upcoming-status';
      break;
    case 'current':
      statusText = 'Ongoing Event';
      statusClass = 'current-status';
      break;
    case 'past':
      statusText = 'Past Event';
      statusClass = 'past-status';
      break;
  }

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
          
          <div className="event-detail-grid">
            <div className="event-info">
              <div className="event-metadata">
                <div className="metadata-item">
                  <i className="event-icon date-icon">📅</i>
                  <span>{formattedDate}</span>
                </div>
                <div className="metadata-item">
                  <i className="event-icon location-icon">📍</i>
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div className="event-description">
                <h2>About This Event</h2>
                <p>{event.description}</p>
              </div>
              
              {event.result && (
                <div className="event-result">
                  <h2>Results</h2>
                  <p>{event.result}</p>
                </div>
              )}
              
              {event.livestreamLink && (
                <div className="event-livestream">
                  <h2>Livestream</h2>
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
              
              <div className="event-actions">
                <Link to="/schedule" className="back-button">
                  Back to Schedule
                </Link>
                {event.type === 'upcoming' && (
                  <a 
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${encodeURIComponent(event.date)}/${encodeURIComponent(event.date)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="add-calendar-button"
                  >
                    Add to Calendar
                  </a>
                )}
              </div>
            </div>
            
            <div className="event-image-container">
              {event.image ? (
                <ImageWithFallback
                  src={event.image}
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
        </div>
      </div>
    </div>
  );
};

export default EventDetail;