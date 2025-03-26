import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroBanner.css';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundImage
}) => {
  const bannerStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})` }
    : {};

  return (
    <div className="hero-banner" style={bannerStyle}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="hero-cta">
          <Link to={ctaLink} className="hero-button">{ctaText}</Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;