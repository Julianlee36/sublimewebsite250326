import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import { heroBannerPlaceholder } from '../assets/images/banners/hero-banner';
import { useData } from '../cms/DataContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const { events: allEvents, campaigns, refreshData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  
  // Force data refresh from Firestore when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // First refresh data through the DataContext to ensure everything is in sync
        await refreshData();
        
        // Log updated data to confirm
        console.log("Home: Data refreshed through DataContext");
        
        // Additional direct check to confirm Firestore data
        const pageContentDoc = await getDoc(doc(db, 'website', 'pageContent'));
        if (pageContentDoc.exists()) {
          console.log("Home: Direct check of pageContent from Firestore:", pageContentDoc.data().data);
          const coaches = pageContentDoc.data().data?.coaches || [];
          console.log("Home: Coaches from Firestore (direct check):", coaches);
        }
        
        // Log localStorage data to confirm it's in sync
        const localStoragePageContent = localStorage.getItem('pageContent');
        if (localStoragePageContent) {
          const parsedContent = JSON.parse(localStoragePageContent);
          console.log("Home: pageContent from localStorage after refresh:", parsedContent);
          console.log("Home: Coaches from localStorage after refresh:", parsedContent.coaches || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []); // No dependencies to prevent constant refreshing
  
  
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

  // Get active campaigns
  const activeCampaigns = campaigns && Array.isArray(campaigns) 
    ? campaigns
        .filter(campaign => !campaign.endDate || new Date(campaign.endDate) > new Date())
        .sort((a, b) => {
          if (a.endDate && b.endDate) {
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          } else if (a.endDate) {
            return -1;
          } else if (b.endDate) {
            return 1;
          }
          return 0;
        })
        .slice(0, 2)
    : [];

  const quickLinks = [
    { title: 'Team Roster', path: '/roster' },
    { title: 'Our Campaigns', path: '/campaigns' },
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
          <Link to="/campaigns" className="view-more">View All Events →</Link>
        </section>

        <section className="active-campaigns">
          <h2>Team Campaigns</h2>
          {activeCampaigns.length > 0 ? (
            <div className="campaigns-grid">
              {activeCampaigns.map(campaign => (
                <div key={campaign.id} className="campaign-card">
                  {campaign.image && (
                    <div 
                      className="campaign-image" 
                      style={{ backgroundImage: `url(${campaign.image})` }}
                    ></div>
                  )}
                  {!campaign.image && (
                    <div className="campaign-image-placeholder">
                      <span>Support Our Team</span>
                    </div>
                  )}
                  <div className="campaign-content">
                    <h3>{campaign.title}</h3>
                    <p className="campaign-description">{campaign.description}</p>
                    
                    {(campaign.goalAmount !== undefined && campaign.currentAmount !== undefined) && (
                      <div className="campaign-progress">
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${Math.min(100, (campaign.currentAmount / campaign.goalAmount) * 100)}%`,
                              backgroundColor: '#4CAF50'
                            }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          <span className="amount-text">${campaign.currentAmount} raised</span>
                          <span className="goal-text">of ${campaign.goalAmount} goal</span>
                        </div>
                      </div>
                    )}
                    
                    {campaign.endDate && (
                      <p className="campaign-date">
                        Ends: {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                    )}
                    
                    <button className="support-button">Support This Campaign</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No active campaigns at this time. Check back soon!</p>
          )}
          <Link to="/campaigns" className="view-more">View All Campaigns →</Link>
        </section>

        <section className="past-events">
          <h2>Past Events and Campaigns</h2>
          {allEvents.filter(event => event.type === 'past').length > 0 ? (
            <div className="events-grid past">
              {allEvents
                .filter(event => event.type === 'past')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)
                .map(event => (
                  <Link to={`/event/${event.id}`} key={event.id} className="event-card-link">
                    <div className="event-card past">
                      <h3>{event.title}</h3>
                      <p className="event-date">{new Date(event.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p className="event-location">{event.location}</p>
                      {event.result && (
                        <p className="event-result"><strong>Result:</strong> {event.result}</p>
                      )}
                      <p>{event.description}</p>
                      <div className="event-card-action">
                        <span className="view-details">View Details →</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="no-events-message">
              <p>No past events to display.</p>
            </div>
          )}
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
              <h3>Your New Highlight Title</h3>
              <p>Your new highlight description goes here. Describe the achievement or news you want to feature on the homepage.</p>
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