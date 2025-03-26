import React from 'react';
import { Event } from './DataContext';

interface EventFormProps {
  event: Event;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onInputChange, onSave, onCancel }) => {
  return (
    <div className="edit-form">
      <div className="form-group">
        <label>Title:</label>
        <input 
          type="text" 
          name="title" 
          value={event.title} 
          onChange={onInputChange} 
          placeholder="Tournament name or event title"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Date:</label>
        <input 
          type="date" 
          name="date" 
          value={event.date} 
          onChange={onInputChange} 
          required
        />
      </div>
      
      <div className="form-group">
        <label>Location:</label>
        <input 
          type="text" 
          name="location" 
          value={event.location} 
          onChange={onInputChange} 
          placeholder="Event venue or field name"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description:</label>
        <textarea 
          name="description" 
          value={event.description} 
          onChange={onInputChange} 
          rows={3} 
          placeholder="Tournament details, competing teams, format, etc."
          required
        />
      </div>
      
      <div className="form-group">
        <label>Event Type:</label>
        <select 
          name="type" 
          value={event.type} 
          onChange={onInputChange}
          required
        >
          <option value="upcoming">Upcoming Event</option>
          <option value="past">Past Event</option>
        </select>
      </div>
      
      {event.type === 'past' && (
        <div className="form-group">
          <label>Result:</label>
          <input 
            type="text" 
            name="result" 
            value={event.result || ''} 
            onChange={onInputChange} 
            placeholder="e.g., '1st Place', '3-2 Record', etc."
          />
        </div>
      )}
      
      <div className="form-group">
        <label>Livestream Link (optional):</label>
        <input 
          type="url" 
          name="livestreamLink" 
          value={event.livestreamLink || ''} 
          onChange={onInputChange} 
          placeholder="https://livestream-url.com"
        />
      </div>

    </div>
  );
};

export default EventForm;