import React from 'react';
import { useData } from '../cms/DataContext';

const Campaigns: React.FC = () => {
  const { campaigns } = useData();
  
  // Ensure campaigns array exists
  const safeCampaigns = campaigns && Array.isArray(campaigns) ? campaigns : [];

  // Split campaigns into active (ongoing) and past
  const activeCampaigns = safeCampaigns
    .filter(campaign => !campaign.endDate || new Date(campaign.endDate) > new Date())
    .sort((a, b) => {
      if (a.endDate && b.endDate) {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      } else if (a.endDate) {
        return -1; // Put campaigns with end dates first
      } else if (b.endDate) {
        return 1;
      }
      return 0;
    });

  const pastCampaigns = safeCampaigns
    .filter(campaign => campaign.endDate && new Date(campaign.endDate) <= new Date())
    .sort((a, b) => {
      if (a.endDate && b.endDate) {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }
      return 0;
    });

  return (
    <div className="campaigns-page">
      <h1>Team Campaigns</h1>
      
      <section className="active-campaigns">
        <h2>Active Campaigns</h2>
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
      </section>

      <section className="past-campaigns">
        <h2>Past Campaigns</h2>
        {pastCampaigns.length > 0 ? (
          <div className="campaigns-grid past">
            {pastCampaigns.map(campaign => (
              <div key={campaign.id} className="campaign-card past">
                {campaign.image && (
                  <div 
                    className="campaign-image" 
                    style={{ 
                      backgroundImage: `url(${campaign.image})`,
                      opacity: '0.7' 
                    }}
                  ></div>
                )}
                {!campaign.image && (
                  <div className="campaign-image-placeholder past">
                    <span>Past Campaign</span>
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
                      Ended: {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  )}
                  
                  {(campaign.currentAmount !== undefined && campaign.goalAmount !== undefined) && (
                    <div className="campaign-result">
                      {campaign.currentAmount >= campaign.goalAmount ? (
                        <div className="success-badge">Goal Reached</div>
                      ) : (
                        <div className="incomplete-badge">Goal Not Reached</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No past campaigns are available.</p>
        )}
      </section>
    </div>
  );
};

export default Campaigns;