import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      
      <section className="contact-info">
        <h2>Contact Information</h2>
        <p>Get in touch with Sublime Ultimate:</p>
        <ul>
          <li>Email: info@sublimeultimate.com</li>
          <li>Social Media: @sublimeultimate</li>
        </ul>
      </section>

      <section className="contact-form">
        <h2>Contact Form</h2>
        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required rows={5}></textarea>
          </div>
          
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default Contact;
