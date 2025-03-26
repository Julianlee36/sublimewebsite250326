import React from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import { heroBannerPlaceholder } from '../assets/images/banners/hero-banner';
import { useData } from '../cms/DataContext';

const Home: React.FC = () => {
  const { events: allEvents } = useData();
  
  // Get upcoming events from the data context, or use fallback data if empty
  const upcomingEvents = allEvents.filter(event => event.type === 'upcoming').length > 0 
    ? allEvents
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
        }))
    : [
      {
        id: 1,
        title: 'Spring Tournament',
        date: 'April 15-16, 2025',
        location: 'City Sports Complex',
        description: 'Annual spring tournament featuring teams from across the region.'
      },
      {
        id: 2,
        title: 'Team Practice',
        date: 'Every Tuesday, 6-8 PM',
        location: 'Memorial Park Fields',
        description: 'Weekly team practice session. All team members are expected to attend.'
      },
      {
        id: 3,
        title: 'Charity Exhibition Match',
        date: 'May 5, 2025',
        location: 'University Stadium',
        description: 'Charity match against the defending regional champions to raise funds for youth sports programs.'
      }
    ];

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
          <h2>Upcoming Events</h2>
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p className="event-date">{event.date}</p>
                <p className="event-location">{event.location}</p>
                <p>{event.description}</p>
              </div>
            ))}
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