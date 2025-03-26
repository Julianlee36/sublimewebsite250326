import React from 'react';
import { useData } from '../cms/DataContext';

const About: React.FC = () => {
  const { pageContent } = useData();
  // Use coaches from pageContent with fallback to empty array
  const coaches = pageContent.coaches || [];
  
  return (
    <div className="about-page">
      <div className="container">
        <h1>About Sublime Ultimate</h1>
        
        <section className="team-history">
          <h2>Team History & Mission</h2>
          <div className="history-content">
            <div className="history-text">
              <p>Founded in 2018, Sublime Ultimate has grown from a small group of passionate players to one of the most competitive Ultimate Frisbee teams in the region.</p>
              <p>Our journey began when a group of five friends who shared a love for Ultimate Frisbee decided to form a team to compete in local tournaments. What started as a casual weekend activity quickly evolved into a serious competitive endeavor.</p>
              <p>Over the years, we've expanded our roster, refined our strategies, and built a supportive community around the sport we love. Today, Sublime Ultimate competes at the highest levels of competition while maintaining our core values of inclusivity, sportsmanship, and continuous improvement.</p>
              <h3>Our Mission</h3>
              <p>At Sublime Ultimate, our mission is to promote excellence in Ultimate Frisbee through dedication, teamwork, and respect for the game. We strive to:</p>
              <ul className="mission-list">
                <li>Compete at the highest levels of Ultimate Frisbee</li>
                <li>Foster a supportive and inclusive team environment</li>
                <li>Develop players' skills and strategic understanding of the game</li>
                <li>Promote the growth of Ultimate Frisbee in our community</li>
                <li>Uphold the spirit of the game in all our actions</li>
              </ul>
            </div>
            <div className="history-image">
              {pageContent.aboutImage ? (
                <div 
                  className="about-image" 
                  style={{ backgroundImage: `url(${pageContent.aboutImage})` }}
                ></div>
              ) : (
                <div className="image-placeholder">Team History Image</div>
              )}
            </div>
          </div>
        </section>

        <section className="team-values">
          <h2>Team Culture & Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Excellence</h3>
              <p>We strive for excellence in everything we do, from training and competition to how we represent ourselves off the field.</p>
            </div>
            <div className="value-card">
              <h3>Teamwork</h3>
              <p>We believe that our success depends on working together, supporting each other, and putting the team's goals ahead of individual achievements.</p>
            </div>
            <div className="value-card">
              <h3>Respect</h3>
              <p>We respect our teammates, opponents, coaches, and the rules of the game. We play with integrity and uphold the spirit of Ultimate Frisbee.</p>
            </div>
            <div className="value-card">
              <h3>Growth</h3>
              <p>We are committed to continuous improvement, both as individual players and as a team. We embrace challenges as opportunities to learn and grow.</p>
            </div>
          </div>
        </section>

        <section className="coaching-staff">
          <h2>Coaching Staff & Leadership</h2>
          <div className="coaches-grid">
            {coaches.map(coach => (
              <div key={coach.id} className="coach-card">
                <div className="coach-image">
                  {coach.image ? (
                    <div 
                      className="coach-photo" 
                      style={{ backgroundImage: `url(${coach.image})` }}
                    ></div>
                  ) : (
                    <div className="image-placeholder">Coach Photo</div>
                  )}
                </div>
                <div className="coach-info">
                  <h3>{coach.name}</h3>
                  <p className="coach-role">{coach.role}</p>
                  <p className="coach-bio">{coach.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;