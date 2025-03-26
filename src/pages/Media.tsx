import React from 'react';

const Media: React.FC = () => {
  return (
    <div className="media-page">
      <h1>Media & Gallery</h1>
      
      <section className="photo-gallery">
        <h2>Photos</h2>
        {/* Photo gallery will go here */}
      </section>

      <section className="video-gallery">
        <h2>Videos</h2>
        {/* Video gallery will go here */}
      </section>

      <section className="highlight-reels">
        <h2>Highlight Reels</h2>
        {/* Highlight reels will go here */}
      </section>
    </div>
  );
};

export default Media;
