import React from 'react';

const Recruitment: React.FC = () => {
  return (
    <div className="recruitment-page">
      <h1>Join Us</h1>
      
      <section className="tryout-details">
        <h2>Tryout Details</h2>
        <p>Interested in joining Sublime Ultimate? Here's information about our upcoming tryouts.</p>
        {/* Tryout details will go here */}
      </section>

      <section className="join-team">
        <h2>How to Join</h2>
        <p>Learn about the process of joining Sublime Ultimate.</p>
        {/* Joining process details will go here */}
      </section>

      <section className="contact-info">
        <h2>Contact for Interested Players</h2>
        <p>If you're interested in joining our team, please reach out to us!</p>
        {/* Contact information will go here */}
      </section>
    </div>
  );
};

export default Recruitment;
