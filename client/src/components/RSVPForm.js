import React, { useState } from 'react';
import './RSVPForm.css';
import { addRSVP } from '../services/githubGist';

const RSVPForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    child_name: '',
    going: null,
    num_adults: 0,
    num_kids: 0,
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleGoingChange = (going) => {
    setFormData(prev => ({
      ...prev,
      going: going
    }));
  };

  const getCalendarLink = () => {
    // Event details
    const title = encodeURIComponent("Skye's 4th Birthday Party");
    const location = encodeURIComponent("Arne Hanna Aquatic Center, Bellingham WA");
    const description = encodeURIComponent("Please RSVP so we can plan for pizza and cupcakes! 🍕🧁");
    
    // Date: March 22, 2026, 10:30 AM - 12:30 PM Pacific Time
    // Format: YYYYMMDDTHHMMSS (in UTC, but we'll use local time and let calendar handle it)
    // Pacific Time is UTC-8, so 10:30 AM PST = 6:30 PM UTC (18:30), 12:30 PM PST = 8:30 PM UTC (20:30)
    // But for simplicity, we'll use the date format that works with Google Calendar
    // Format: YYYYMMDDTHHMMSSZ for UTC or without Z for local time
    const startDate = "20260322T103000"; // March 22, 2026, 10:30 AM
    const endDate = "20260322T123000";   // March 22, 2026, 12:30 PM
    
    // Google Calendar URL
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      setError('Please enter your name.');
      setSubmitting(false);
      return;
    }

    if (!formData.email || formData.email.trim() === '') {
      setError('Please enter your email.');
      setSubmitting(false);
      return;
    }

    if (formData.going === null) {
      setError('Please indicate if you are going or not.');
      setSubmitting(false);
      return;
    }

    try {
      const rsvpData = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        child_name: formData.child_name ? formData.child_name.trim() : null,
        going: formData.going,
        num_adults: formData.num_adults || 0,
        num_kids: formData.num_kids || 0,
        message: formData.message ? formData.message.trim() : null
      };

      await addRSVP(rsvpData);
      setMessage('Thank you! Your RSVP has been submitted successfully! 🎉');
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        child_name: '',
        going: null,
        num_adults: 0,
        num_kids: 0,
        message: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rsvp-container">
      <div className="rsvp-card">
        <div className="rsvp-header">
          <h1>🎉 Skye's 4th Birthday Party 🎉</h1>
          <div className="party-details">
            <p><strong>📅 Date:</strong> Saturday, March 22nd, 2026</p>
            <p><strong>⏰ Time:</strong> 10:30 AM - 12:30 PM</p>
            <p><strong>📍 Location:</strong> Arne Hanna Aquatic Center, Bellingham WA</p>
            <p className="calendar-link-container">
              <a 
                href={getCalendarLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="calendar-link"
              >
                📅 Add to Calendar
              </a>
            </p>
          </div>
          <p className="subtitle">Please RSVP so we can plan for pizza and cupcakes! 🍕🧁</p>
          <p className="gifts-notice">Gifts not expected</p>
        </div>

        <div className="pool-rules-notice">
          <p><strong>🏊 Pool Safety Reminder:</strong></p>
          <p>All swimmers under 7 years old must be within arm's reach of a parent while in the pool.</p>
          <p><a href="https://cob.org/services/safety/education-safety/rules-and-regulations" target="_blank" rel="noopener noreferrer">View full pool rules</a></p>
        </div>

        {message && (
          <div className="success-message">
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rsvp-form">
          <div className="form-group">
            <label htmlFor="name">Your Name <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="child_name">Child's Name (optional)</label>
            <input
              type="text"
              id="child_name"
              name="child_name"
              value={formData.child_name}
              onChange={handleChange}
              placeholder="Enter child's name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Your Email <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Will you be attending? <span className="required">*</span></label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="going"
                  checked={formData.going === true}
                  onChange={() => handleGoingChange(true)}
                />
                <span>Yes, I'll be there! 🎉</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="going"
                  checked={formData.going === false}
                  onChange={() => handleGoingChange(false)}
                />
                <span>Sorry, I can't make it</span>
              </label>
            </div>
          </div>

          {formData.going === true && (
            <div className="attending-details">
              <div className="form-group">
                <label htmlFor="num_adults">Number of Adults</label>
                <input
                  type="number"
                  id="num_adults"
                  name="num_adults"
                  value={formData.num_adults}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="num_kids">Number of Kids</label>
                <input
                  type="number"
                  id="num_kids"
                  name="num_kids"
                  value={formData.num_kids}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="message">Message (optional)</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Add any additional message or notes..."
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting || formData.going === null || !formData.name.trim() || !formData.email.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit RSVP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RSVPForm;

