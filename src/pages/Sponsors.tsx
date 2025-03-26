import React from 'react';

const Sponsors: React.FC = () => {
  return (
    <div className="sponsors-page">
      <h1>Sponsors & Partners</h1>
      
      <section className="current-sponsors">
        <h2>Our Sponsors</h2>
        {/* List of sponsors with logos will go here */}
      </section>

      <section className="sponsorship-opportunities">
        <h2>Sponsorship Opportunities</h2>
        <p>Interested in sponsoring Sublime Ultimate? We offer various sponsorship packages to suit your business needs.</p>
        {/* Sponsorship packages will go here */}
      </section>

      <section className="support-team">
        <h2>How to Support Us</h2>
        <p>There are many ways businesses and individuals can support our team.</p>
        {/* Support information will go here */}
      </section>
    </div>
  );
};

export default Sponsors;
