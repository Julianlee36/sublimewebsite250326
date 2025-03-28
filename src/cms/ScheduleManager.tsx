import React, { useState, useEffect } from 'react';
import { useData, Event } from './DataContext';
import EventForm from './EventForm';
import './admin.css';

const ScheduleManager: React.FC = () => {
  const { events, setEvents, saveData } = useData();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState<Event | null>(null);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'event', 'campaign'
    status: 'all' // 'all', 'upcoming', 'current', 'past'
  });

  // Apply filters whenever events or filter settings change
  useEffect(() => {
    let result = [...events];
    
    // Filter by event type (event/campaign)
    if (filters.type !== 'all') {
      result = result.filter(event => event.eventType === filters.type);
    }
    
    // Filter by status (upcoming/current/past)
    if (filters.status !== 'all') {
      result = result.filter(event => event.type === filters.status);
    }
    
    setFilteredEvents(result);
  }, [events, filters]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create a new event
  const handleAddEvent = () => {
    const newEvent: Event = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      title: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      location: '',
      description: '',
      type: 'upcoming',
      eventType: 'event',
    };
    
    setEditItem(newEvent);
    setEditMode(true);
  };

  // Edit existing event
  const handleEditEvent = (event: Event) => {
    setEditItem({...event});
    setEditMode(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editItem) return;
    
    const { name, value } = e.target;
    setEditItem({
      ...editItem,
      [name]: value
    });
  };

  // Handle image upload
  const handleImageUpload = (imageUrl: string) => {
    if (!editItem) return;
    
    setEditItem({
      ...editItem,
      image: imageUrl
    });
  };

  // Save event changes
  const handleSaveEvent = async () => {
    if (!editItem) return;
    
    try {
      // Update events array
      let updatedEvents: Event[];
      
      if (events.find(e => e.id === editItem.id)) {
        // Update existing event
        updatedEvents = events.map(e => e.id === editItem.id ? editItem : e);
      } else {
        // Add new event
        updatedEvents = [...events, editItem];
      }
      
      // Update state
      setEvents(updatedEvents);
      
      // Save to Firestore via DataContext
      await saveData();
      
      // Reset form
      setEditItem(null);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  // Delete event
  const handleDeleteEvent = (id: number) => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }
    
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    saveData();
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditItem(null);
    setEditMode(false);
  };

  // Format date for display
  const formatDate = (dateString: string, endDateString?: string) => {
    if (!dateString) return 'No date';
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const startDate = new Date(dateString).toLocaleDateString('en-US', formatOptions);
    
    if (endDateString) {
      const endDate = new Date(endDateString).toLocaleDateString('en-US', formatOptions);
      return `${startDate} - ${endDate}`;
    }
    
    return startDate;
  };

  // Helper to get status text
  const getStatusText = (type: string) => {
    switch (type) {
      case 'upcoming': return 'Upcoming';
      case 'current': return 'Ongoing';
      case 'past': return 'Completed';
      default: return 'Unknown';
    }
  };

  // Helper to get status class
  const getStatusClass = (type: string) => {
    switch (type) {
      case 'upcoming': return 'status-upcoming';
      case 'current': return 'status-current';
      case 'past': return 'status-past';
      default: return '';
    }
  };

  // Helper to truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="schedule-manager">
      {editMode ? (
        <div className="edit-container">
          <h2>{editItem && editItem.id ? 'Edit' : 'Create New'} {editItem?.eventType === 'campaign' ? 'Campaign' : 'Event'}</h2>
          
          {editItem && (
            <EventForm
              event={editItem}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
            />
          )}
          
          <div className="edit-actions">
            <button onClick={handleSaveEvent} className="save-btn">Save</button>
            <button onClick={handleCancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="list-container">
          <div className="list-header">
            <h2>Schedule Manager</h2>
            <button onClick={handleAddEvent} className="add-btn">Add New</button>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Type:</label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="all">All Types</option>
                <option value="event">Events</option>
                <option value="campaign">Campaigns</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="current">Ongoing</option>
                <option value="past">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="schedule-grid">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div key={event.id} className="schedule-card">
                  {/* Card Header with Image */}
                  <div 
                    className="card-header"
                    style={{
                      backgroundImage: event.image ? `url(${event.image})` : 'linear-gradient(135deg, #1e90ff, #ff4500)'
                    }}
                  >
                    <div className="card-header-overlay">
                      <div className="card-badges">
                        <span className={`type-badge ${event.eventType === 'campaign' ? 'type-campaign' : 'type-event'}`}>
                          {event.eventType === 'campaign' ? 'Campaign' : 'Event'}
                        </span>
                        <span className={`status-badge ${getStatusClass(event.type)}`}>
                          {getStatusText(event.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="card-content">
                    <h3 className="card-title">{event.title}</h3>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span className="detail-text">
                          {formatDate(event.date, event.eventType === 'campaign' ? event.endDate : undefined)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span className="detail-text">{event.location}</span>
                      </div>
                      {event.eventType === 'campaign' && event.teamName && (
                        <div className="detail-item">
                          <span className="detail-icon">👥</span>
                          <span className="detail-text team-text">{event.teamName}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="card-description">
                      {truncateText(event.description)}
                    </p>
                    
                    <div className="card-actions">
                      <button onClick={() => handleEditEvent(event)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No events found. Add your first event using the "Add New" button.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;