import React from 'react';
import { useData } from '../cms/DataContext';
import ImageWithFallback from '../components/ImageWithFallback';

const Schedule: React.FC = () => {
  const { events } = useData();
  
  // Separate upcoming, current, and past events
  const upcomingEvents = events.filter(event => event.type === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const currentEvents = events.filter(event => event.type === 'current')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastEvents = events.filter(event => event.type === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get events with livestream links
  const eventsWithLivestreams = events.filter(event => event.livestreamLink);
  
  return (
    <div className="schedule-page">
      <h1>Schedule & Results</h1>
      
      <section className="upcoming-tournaments">
        <h2>Upcoming Tournaments & Matches</h2>
        {upcomingEvents.length > 0 ? (
          <div className="events-list">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                {event.image && (
                  <div className="event-image">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      fallbackSrc="/placeholder-event.jpg"
                      className="event-photo"
                    />
                  </div>
                )}
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-date">
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="event-location">
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p className="event-description">{event.description}</p>
                  {event.livestreamLink && (
                    <p className="event-livestream">
                      <a href={event.livestreamLink} target="_blank" rel="noopener noreferrer">
                        Livestream Link
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No upcoming tournaments scheduled at this time. Check back soon!</p>
        )}
      </section>

      <section className="current-tournaments">
        <h2>Current Tournaments & Matches</h2>
        {currentEvents.length > 0 ? (
          <div className="events-list">
            {currentEvents.map(event => (
              <div key={event.id} className="event-card">
                {event.image && (
                  <div className="event-image">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      fallbackSrc="/placeholder-event.jpg"
                      className="event-photo"
                    />
                  </div>
                )}
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-date">
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="event-location">
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p className="event-description">{event.description}</p>
                  {event.livestreamLink && (
                    <p className="event-livestream">
                      <a href={event.livestreamLink} target="_blank" rel="noopener noreferrer">
                        Watch Live
                      </a>
                    </p>
                  )}
                  {event.result && (
                    <p className="event-result">
                      <strong>Current Standing:</strong> {event.result}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No tournaments currently in progress.</p>
        )}
      </section>

      <section className="past-results">
        <h2>Past Game Results</h2>
        {pastEvents.length > 0 ? (
          <div className="events-list">
            {pastEvents.map(event => (
              <div key={event.id} className="event-card">
                {event.image && (
                  <div className="event-image">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      fallbackSrc="/placeholder-event.jpg"
                      className="event-photo"
                    />
                  </div>
                )}
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-date">
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="event-location">
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p className="event-result">
                    <strong>Result:</strong> {event.result || 'Not available'}
                  </p>
                  <p className="event-description">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No past tournament results available.</p>
        )}
      </section>

      <section className="livestreams">
        <h2>Livestreams & Game Footage</h2>
        {eventsWithLivestreams.length > 0 ? (
          <div className="events-list">
            {eventsWithLivestreams.map(event => (
              <div key={event.id} className="event-card">
                {event.image && (
                  <div 
                    className="event-image" 
                    style={{ backgroundImage: `url(${event.image})` }}
                  ></div>
                )}
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-date">
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="event-livestream">
                    <a href={event.livestreamLink} target="_blank" rel="noopener noreferrer">
                      Watch Livestream/Recording
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No livestream links are currently available.</p>
        )}
      </section>
    </div>
  );
};

export default Schedule;
