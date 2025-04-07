import React, { useState, useEffect } from 'react';
import { useData, Event } from './DataContext';
import EventForm from './EventForm';
import './admin.css';

const EventsAdmin: React.FC = () => {
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
      console.log("Saving event/campaign:", editItem);
      
      // Update events array
      let updatedEvents: Event[];
      
      if (events.find(e => e.id === editItem.id)) {
        // Update existing event
        updatedEvents = events.map(e => e.id === editItem.id ? editItem : e);
      } else {
        // Add new event
        updatedEvents = [...events, editItem];
      }
      
      console.log("Updated events array:", updatedEvents);
      
      // Update state - IMPORTANT: This needs to happen before saveData is called
      setEvents(updatedEvents);
      
      // Make sure the state update propagates before saving
      setTimeout(async () => {
        try {
          // Save to Firestore via DataContext
          console.log("Calling saveData() to persist to Firestore");
          await saveData();
          console.log("Save completed");
          
          // Reset form
          setEditItem(null);
          setEditMode(false);
        } catch (saveError) {
          console.error("Error in delayed save:", saveError);
          alert("Failed to save event. Please try again.");
        }
      }, 500);
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

  return (
    <div className="events-admin">
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
            <h2>Events & Campaigns</h2>
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
          
          <div className="events-list">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => (
                    <tr key={event.id} className="event-row">
                      <td className="event-title">
                        <div className="event-info">
                          {event.image && (
                            <div 
                              className="event-thumbnail" 
                              style={{ backgroundImage: `url(${event.image})` }}
                            ></div>
                          )}
                          <span>{event.title}</span>
                        </div>
                      </td>
                      <td>{event.eventType === 'campaign' ? 'Campaign' : 'Event'}</td>
                      <td>{formatDate(event.date, event.eventType === 'campaign' ? event.endDate : undefined)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(event.type)}`}>
                          {getStatusText(event.type)}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button onClick={() => handleEditEvent(event)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-message">
                      No events found. Add your first event using the "Add New" button.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsAdmin;