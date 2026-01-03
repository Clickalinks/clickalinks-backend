import React, { useState } from 'react';  // Fixed - added useState import
import './ContactForm.css';  // Fixed import - should be ContactForm.css, not About.css

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const { name, email, subject, message } = formData;
      
      const response = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, message })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage('✅ Your message has been sent successfully! We will get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitMessage(`❌ Error: ${result.error || 'Failed to send message. Please try again later.'}`);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitMessage('❌ Error: Failed to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-content">
        <div className="contact-header">
          <h1>📧 Contact CLICKaLINKS</h1>
          <p>Get in touch with us - we're here to help your business grow!</p>
        </div>

        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="contact-form-container">
              <h2>💬 Send us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? '⏳ Sending...' : '📨 Send Message'}
                </button>
                {submitMessage && (
                  <div className={`submit-message ${submitMessage.startsWith('✅') ? 'success' : 'error'}`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <h3>📞 Get In Touch</h3>
              
              <div className="contact-method">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <strong>Email Us</strong>
                  <p><a href="mailto:support@clickalinks.com" style={{ color: 'inherit', textDecoration: 'none' }}>support@clickalinks.com</a></p>
                  <small>We typically reply within 24 hours</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🕒</div>
                <div className="contact-details">
                  <strong>Business Hours</strong>
                  <p>Monday - Friday: 9AM - 6PM</p>
                  <p>Saturday: 10AM - 4PM</p>
                  <small>GMT Time Zone</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🚀</div>
                <div className="contact-details">
                  <strong>Advertising Support</strong>
                  <p>Need help with your campaign?</p>
                  <small>We're here to help you succeed</small>
                </div>
              </div>

              <div className="contact-features">
                <h4>Why Choose CLICKaLINKS?</h4>
                <ul className="contact-features-list">
                  <li>✅ Affordable advertising from £1/day</li>
                  <li>✅ Direct customer connections</li>
                  <li>✅ 2000+ advertising squares</li>
                  <li>✅ Automatic square shuffling</li>
                  <li>✅ Secure payment processing</li>
                  <li>✅ Premium visibility for your business</li>
                </ul>
              </div>

              <div className="contact-method" style={{marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0'}}>
                <div className="contact-icon">🏢</div>
                <div className="contact-details">
                  <strong>Company Information</strong>
                  <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>
                    <strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong>
                  </p>
                  <p style={{fontSize: '0.85rem', marginTop: '0.25rem', color: '#666'}}>
                    Registered in England & Wales, Registration Number: 16904433
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;