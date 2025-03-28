import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import { heroBannerPlaceholder } from '../assets/images/banners/hero-banner';
import { useData } from '../cms/DataContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const { events: allEvents, refreshData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  
  // Force data refresh from Firestore when component mounts
  useEffect(() => {
    const loadEventData = async () => {
      setIsLoading(true);
      try {
        // First try direct Firestore access
        const eventsDoc = await getDoc(doc(db, 'website', 'events'));
        if (eventsDoc.exists()) {
          console.log("Home: Got events directly from Firestore:", eventsDoc.data().data);
        }
        
        // Then use the DataContext refreshData method to ensure everything is in sync
        refreshData();
      } catch (error) {
        console.error("Error loading event data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEventData();
  }, []); // Remove dependency on refreshData to prevent constant refreshing
  
  
  // Get upcoming events from the data context
  const upcomingEvents = allEvents
    .filter(event => event.type === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      location: event.location,
      description: event.description
    }));

  const quickLinks = [
    { title: 'Team Roster', path: '/roster' },
    { title: 'Upcoming Schedule', path: '/schedule' },
    { title: 'Latest News', path: '/news' },
    { title: 'Join Our Team', path: '/recruitment' }
  ];

  // Get hero banner settings from the data context
  const { siteSettings } = useData();
  
  return (
    <div className="home-page">
      <HeroBanner
        title={siteSettings.heroTitle}
        subtitle={siteSettings.heroSubtitle}
        ctaText={siteSettings.heroCtaText}
        ctaLink={siteSettings.heroCtaLink}
        backgroundImage={siteSettings.heroBackgroundImage || heroBannerPlaceholder}
      />
      
      <div className="container">
        <section className="upcoming-events">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Upcoming Events</h2>
          </div>
          <div className="events-grid">
            {isLoading ? (
              <LoadingSpinner />
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <Link to={`/event/${event.id}`} key={event.id} className="event-card-link">
                  <div className="event-card">
                    <h3>{event.title}</h3>
                    <p className="event-date">{event.date}</p>
                    <p className="event-location">{event.location}</p>
                    <p>{event.description}</p>
                    <div className="event-card-action">
                      <span className="view-details">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-events-message">
                <p>No upcoming events at this time. Check back later or add events in the admin panel.</p>
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  If you just added an event, try clicking the refresh button above.
                </p>
              </div>
            )}
          </div>
          <Link to="/schedule" className="view-more">View Full Schedule →</Link>
        </section>

        <section className="quick-links">
          <h2>Quick Links</h2>
          <div className="links-grid">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.path} className="quick-link-card">
                {link.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="team-highlights">
          <h2>Team Highlights</h2>
          <div className="highlight-content">
            <div className="highlight-text">
              <h3>Championship Winners 2024</h3>
              <p>Sublime Ultimate took home the regional championship trophy in 2024, defeating the defending champions in a thrilling final match. The team's commitment to excellence and teamwork shined throughout the tournament.</p>
              <Link to="/news" className="read-more">Read the Full Story →</Link>
            </div>
            <div className="highlight-image">
              {/* Placeholder for team image */}
              <div className="image-placeholder">Team Image</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;