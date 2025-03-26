import React from 'react';
import { useData } from '../cms/DataContext';

const News: React.FC = () => {
  const { news } = useData();
  
  // Sort news items by date (newest first)
  const sortedNews = [...news].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="news-page">
      <h1>News & Updates</h1>
      
      <section className="news-content">
        {sortedNews.length > 0 ? (
          <div className="news-grid">
            {sortedNews.map(item => (
              <article key={item.id} className="news-card">
                {item.image && (
                  <div className="news-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                )}
                <div className="news-text">
                  <h2>{item.title}</h2>
                  <div className="news-meta">
                    <span className="news-date">{new Date(item.date).toLocaleDateString()}</span>
                    <span className="news-author">By {item.author}</span>
                  </div>
                  <div className="news-content">
                    {item.content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No news items available at this time. Check back soon for updates!</p>
        )}
      </section>

      <section className="social-feed">
        <h2>Social Media Feed</h2>
        <p>Follow us on social media for the latest updates, photos, and more!</p>
        <div className="social-links">
          <a href="https://twitter.com/sublimeultimate" className="social-button" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com/sublimeultimate" className="social-button" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://facebook.com/sublimeultimate" className="social-button" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </section>
    </div>
  );
};

export default News;
