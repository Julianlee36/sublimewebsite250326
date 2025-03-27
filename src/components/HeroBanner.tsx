import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroBanner.css';
import ImageWithFallback from './ImageWithFallback';

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
  return (
    <div className="hero-banner">
      {backgroundImage && (
        <div className="hero-background">
          <ImageWithFallback
            src={backgroundImage}
            alt="Hero background"
            fallbackSrc="/placeholder-hero.jpg"
            className="hero-background-image"
          />
        </div>
      )}
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