import React, { useEffect } from 'react';
import { useData } from '../cms/DataContext';
import ImageWithFallback from '../components/ImageWithFallback';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const About: React.FC = () => {
  const { pageContent, refreshData } = useData();
  // Use coaches from pageContent with fallback to empty array
  const coaches = pageContent.coaches || [];
  
  console.log("About page rendering with coaches:", coaches);
  
  // Function to check coach data and refresh from Firestore
  const checkCoachData = async () => {
    console.log("About: Current coaches from pageContent:", coaches);
    
    try {
      // Always check directly in Firestore first for the most up-to-date data
      const pageContentDoc = await getDoc(doc(db, 'website', 'pageContent'));
      
      if (pageContentDoc.exists() && pageContentDoc.data()?.data) {
        console.log("About: Got pageContent directly from Firestore");
        const firestoreData = pageContentDoc.data().data;
        const firestoreCoaches = firestoreData?.coaches || [];
        
        console.log("About: Coaches from Firestore:", {
          count: firestoreCoaches.length,
          names: firestoreCoaches.map((c: any) => c.name)
        });
        
        // Always update from Firestore if we have data there - this ensures we always
        // have the latest data from the database
        if (firestoreCoaches.length > 0) {
          console.log("About: Updating coaches from Firestore");
          
          // Create complete new pageContent object
          const newPageContent = {
            aboutImage: firestoreData?.aboutImage || '',
            coaches: firestoreCoaches
          };
          
          // Update localStorage
          localStorage.setItem('pageContent', JSON.stringify(newPageContent));
          
          // Update state directly instead of doing a full page reload
          if (coaches.length === 0 || JSON.stringify(coaches) !== JSON.stringify(firestoreCoaches)) {
            console.log("About: Coaches data changed, updating state");
            // We don't have direct access to setPageContent from this component
            // so we'll do a force reload only if needed
            window.location.reload();
            return;
          }
        }
      } else {
        console.log("About: No pageContent document in Firestore or missing data structure");
      }
      
      // Force a refresh anyway to ensure we have the latest data
      await refreshData();
      
      // As a backup, check localStorage after the refresh
      const localStoragePageContent = localStorage.getItem('pageContent');
      if (localStoragePageContent) {
        try {
          const parsedContent = JSON.parse(localStoragePageContent);
          const localCoaches = parsedContent.coaches || [];
          
          console.log("About: Coaches from localStorage:", {
            count: localCoaches.length,
            names: localCoaches.map((c: any) => c.name || 'unnamed')
          });
          
          // If localStorage has coaches but our component doesn't, reload
          if (localCoaches.length > 0 && coaches.length === 0) {
            console.log("About: Found coaches in localStorage but not in component state, reloading");
            window.location.reload();
            return;
          }
        } catch (parseError) {
          console.error("Error parsing localStorage pageContent:", parseError);
        }
      } else {
        console.log("About: No pageContent in localStorage");
      }
    } catch (error) {
      console.error("Error checking coach data:", error);
    }
  };
  
  // Check data on page load and when pageContent changes
  useEffect(() => {
    // Force a refresh and then check for coach data
    const loadData = async () => {
      try {
        // First try the direct refresh method
        await refreshData();
        
        // After refresh, check if we have coaches
        if (!coaches || coaches.length === 0) {
          // If we still don't have coaches, try the more thorough check
          console.log("No coaches found after refreshData, performing deeper check");
          await checkCoachData();
        }
      } catch (error: any) {
        console.error("Error in initial data loading:", error);
        // Still try the coach data check even if refreshData fails
        await checkCoachData();
      }
    };
    
    loadData();
  }, []);
  
  // Add a second effect to check coaches when pageContent changes
  useEffect(() => {
    console.log("About: pageContent.coaches changed:", pageContent.coaches);
    if (pageContent.coaches?.length > 0) {
      console.log("About: Found coaches in pageContent:", pageContent.coaches);
    }
  }, [pageContent.coaches]);
  
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
          
          {coaches.length > 0 ? (
            <div className="coaches-grid">
              {coaches.map(coach => (
                <div key={coach.id} className="coach-card">
                  <div className="coach-image">
                    {coach.image ? (
                      <ImageWithFallback
                        src={coach.image}
                        alt={`${coach.name} - ${coach.role}`}
                        fallbackSrc="/placeholder-coach.jpg"
                        className="coach-photo"
                      />
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
          ) : (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <p>No coaches found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default About;