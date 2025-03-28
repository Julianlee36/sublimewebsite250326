import React, { useState } from 'react';
import { useData, Event, SiteSettings, Team, Coach } from './DataContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImageDataUrl, uploadImageFile, uploadPlayerImageAndSave } from '../firebase/imageUtils';
import EventForm from './EventForm';
import SiteSettingsForm from './SiteSettingsForm';
import './admin.css';

const AdminPage: React.FC = () => {
  const { 
    players, setPlayers, 
    alumni, setAlumni, 
    events, setEvents, 
    news, setNews,
    teams, setTeams,
    pageContent, setPageContent,
    siteSettings, setSiteSettings,
    saveData
  } = useData();

  const [activeTab, setActiveTab] = useState<'alumni' | 'events' | 'news' | 'teams' | 'pages' | 'settings' | 'players'>('teams');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  // Form handling
  const handleEditClick = (item: any) => {
    setEditItem(item);
    setEditMode(true);
  };
  
  // Handle direct settings changes (used for file uploads)
  const handleSettingsChange = (updatedSettings: Partial<SiteSettings>) => {
    setEditItem(editItem ? {...editItem, ...updatedSettings} : updatedSettings);
  };
  
  // Handle player image upload
  const handlePlayerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // For preview we still use FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        // Store the base64 temporarily for preview only
        const base64String = reader.result as string;
        // We also store the original file for later upload
        if (editItem) {
          setEditItem({
            ...editItem, 
            image: base64String, 
            tempImageData: base64String,
            imageFile: file
          });
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle removal of player image
  const handleRemovePlayerImage = () => {
    if (editItem) {
      setEditItem({...editItem, image: null});
    }
  };
  
  // Handle about page image upload
  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        
        // Upload directly using the File object
        console.log("Uploading about page image to Firebase Storage");
        const fileName = `pages/about_${Date.now()}`;
        const imageUrl = await uploadImageFile(file, fileName);
        console.log("About image uploaded, URL:", imageUrl);
        
        // Update the page content with the URL
        setPageContent({
          ...pageContent,
          aboutImage: imageUrl,
          coaches: pageContent?.coaches || [] // Ensure coaches is defined
        });
        
        saveData();
      } catch (error) {
        console.error("Error uploading about image:", error);
        alert("There was an error uploading the image. Please try again.");
      }
    }
  };
  
  // Handle removal of about page image
  const handleRemoveAboutImage = () => {
    setPageContent({
      ...pageContent,
      aboutImage: '',
      coaches: pageContent?.coaches || [] // Ensure coaches is defined
    });
    
    saveData();
  };
  
  // Handle coach operations
  const handleAddCoach = () => {
    const coaches = pageContent?.coaches || [];
    const newCoach = {
      id: coaches.length > 0 
        ? Math.max(...coaches.map(c => c.id)) + 1 
        : 1,
      name: '',
      role: '',
      bio: '',
      image: null
    };
    
    console.log('Creating new coach:', newCoach);
    setEditItem(newCoach);
    setEditMode(true);
    setActiveTab('pages'); // Ensure we stay on the pages tab
  };
  
  const handleEditCoach = (coach: Coach) => {
    console.log('Editing coach:', coach);
    setEditItem({...coach});
    setEditMode(true);
    setActiveTab('pages'); // Ensure we stay on the pages tab
  };
  
  const handleSaveCoach = async () => {
    try {
      const coaches = pageContent?.coaches || [];
      
      // Handle image upload to Firebase Storage if there's a base64 image
      let updatedItem = { ...editItem };
      
      if (editItem && 'tempImageData' in editItem && typeof editItem.tempImageData === 'string' && editItem.tempImageData.startsWith('data:')) {
        try {
          console.log("Uploading coach image to Firebase Storage");
          const storagePath = `coaches/coach_${editItem && 'id' in editItem ? editItem.id : '0'}`;
          const imageUrl = await uploadImageDataUrl(
            editItem.tempImageData, 
            storagePath
          );
          console.log("Coach image uploaded, URL:", imageUrl);
          
          // Replace the base64 with the URL
          updatedItem.image = imageUrl;
          delete updatedItem.tempImageData; // Remove the temporary data
        } catch (uploadError) {
          console.error("Error uploading coach image to Firebase Storage:", uploadError);
          // Continue with saving the coach data even if image upload fails
        }
      }
      
      const itemId = editItem && 'id' in editItem ? editItem.id : null;
      const updatedCoaches = itemId 
        ? coaches.map(c => c.id === itemId ? updatedItem : c)
        : [...coaches, updatedItem];
      
      setPageContent({
        ...pageContent,
        coaches: updatedCoaches,
        aboutImage: pageContent?.aboutImage || '' // Ensure aboutImage is defined
      });
      
      setEditItem(null);
      setEditMode(false);
      saveData();
    } catch (error) {
      console.error("Error saving coach:", error);
      alert("There was an error saving the coach. Please try again.");
    }
  };
  
  const handleDeleteCoach = (id: number) => {
    if (!confirm('Are you sure you want to delete this coach?')) {
      return;
    }
    
    if (pageContent && pageContent.coaches) {
      setPageContent({
        ...pageContent,
        coaches: pageContent.coaches.filter(c => c.id !== id)
      });
      
      saveData();
    }
  };
  
  // Handle coach image upload
  const handleCoachImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Convert image to base64 data URL
        const base64String = reader.result as string;
        console.log('Coach image loaded, updating coach data');
        setEditItem((prevItem: any) => {
          if (!prevItem) return null;
          const updated = {...prevItem, image: base64String, tempImageData: base64String};
          console.log('Updated coach with image:', updated);
          return updated;
        });
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle removal of coach image
  const handleRemoveCoachImage = () => {
    console.log('Removing coach image');
    setEditItem((prevItem: any) => {
      if (!prevItem) return null;
      const updated = {...prevItem, image: null};
      console.log('Updated coach without image:', updated);
      return updated;
    });
  };

  // Handle adding a new player to a specific team
  const handleAddPlayerToTeam = () => {
    if (!selectedTeam) return;
    
    const newPlayer = {
      id: players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1,
      name: '',
      position: '',
      number: 0,
      years: 0,
      bio: '',
      isCaptain: false,
      image: null,
      team: selectedTeam.name
    };
    console.log('Creating new player:', newPlayer);
    setEditItem(newPlayer);
    setEditMode(true);
  };
  
  // Handle selecting a team to view/edit its players
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
  };
  
  // Handle going back from team details to team list
  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setEditMode(false);
    setEditItem(null);
  };

  const handleNewClick = () => {
    switch (activeTab) {
      case 'alumni':
        setEditItem({
          id: alumni.length > 0 ? Math.max(...alumni.map(a => a.id)) + 1 : 1,
          name: '',
          years: '',
          achievements: '',
          current: ''
        });
        break;
      case 'events':
        setEditItem({
          id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
          title: '',
          date: new Date().toISOString().split('T')[0], // Today's date
          location: '',
          description: '',
          type: 'upcoming',
          result: '',
          livestreamLink: '',
          image: ''
        });
        break;
      case 'news':
        setEditItem({
          id: news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1,
          title: '',
          date: new Date().toISOString().split('T')[0],
          content: '',
          author: '',
          image: ''
        });
        break;
      case 'teams':
        setEditItem({
          id: teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1,
          name: '',
          description: '',
          color: '#1e90ff' // Default to primary color
        });
        break;
      case 'settings':
        // For settings, we edit the existing settings rather than creating new ones
        setEditItem({...siteSettings});
        break;
    }
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditItem(null);
    setEditMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let newValue = value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked as any;
    } else if (type === 'number') {
      newValue = parseInt(value) as any;
    }
    
    console.log(`Updating editItem field ${name} to:`, newValue);
    if (editItem) {
      setEditItem({ ...editItem, [name]: newValue });
    }
  };

  const handleSaveItem = async () => {
    try {
      console.log("Saving item:", editItem);
      
      // For player editing in team management
      if (editItem && typeof editItem === 'object' && 'team' in (editItem ?? {}) && 'isCaptain' in (editItem ?? {})) {
        console.log("Saving player:", editItem);
        
        // Handle image upload to Firebase Storage if there's a base64 image
        let updatedItem = { ...editItem };
        
        // Check if we have a file to upload (preferred method)
        if (editItem && 'imageFile' in editItem && editItem.imageFile instanceof File) {
          try {
            console.log("Uploading player image to Firebase Storage using File API");
            
            // Use the uploadPlayerImageAndSave function for the complete workflow
            const imageUrl = await uploadPlayerImageAndSave(
              editItem.imageFile, 
              editItem && 'id' in editItem ? editItem.id.toString() : '0'
            );
            console.log("Player image workflow completed successfully. URL:", imageUrl);
            
            // Replace the base64 with the URL from getDownloadURL()
            updatedItem.image = imageUrl;
            delete updatedItem.tempImageData; // Remove the temporary data
            delete updatedItem.imageFile; // Remove the file object
          } catch (uploadError) {
            console.error("Error in player image upload workflow:", uploadError);
            console.error("Upload error details:", uploadError);
          }
        }
        // Fallback to base64 upload if no File object is available
        else if (editItem && 'tempImageData' in editItem && typeof editItem.tempImageData === 'string' && editItem.tempImageData.startsWith('data:')) {
          try {
            console.log("Uploading player image to Firebase Storage using base64 data");
            // Use a consistent path format with timestamp
            const storagePath = `players/player_${editItem && 'id' in editItem ? editItem.id : '0'}_${Date.now()}`;
            
            // Use our improved uploadImageDataUrl function that handles CORS properly
            const imageUrl = await uploadImageDataUrl(
              editItem && 'tempImageData' in editItem ? editItem.tempImageData : '', 
              storagePath
            );
            console.log("Image uploaded URL:", imageUrl);
            
            // Replace the base64 with the URL from getDownloadURL()
            updatedItem.image = imageUrl;
            delete updatedItem.tempImageData; // Remove the temporary data
            
            // Log the final player object that will be saved
            console.log("Player with image URL to be saved:", updatedItem);
          } catch (uploadError) {
            console.error("Error uploading image to Firebase Storage:", uploadError);
            console.error("Error details:", uploadError);
            // Continue with saving the player data even if image upload fails
          }
        }
        
        const itemId = editItem && 'id' in editItem ? editItem.id : null;
        if (itemId && players.find(p => p.id === itemId)) {
          const updatedPlayers = players.map(p => p.id === itemId ? updatedItem : p);
          console.log("Updating existing player, new players array:", updatedPlayers);
          setPlayers(updatedPlayers);
        } else {
          const newPlayers = [...players, updatedItem];
          console.log("Adding new player, new players array:", newPlayers);
          setPlayers(newPlayers);
        }
        
        // Save players to Firestore (URLs instead of Base64)
        let playersToSave;
        if (itemId && players.find(p => p.id === itemId)) {
          playersToSave = players.map(p => p.id === itemId ? updatedItem : p);
        } else {
          playersToSave = [...players, updatedItem];
        }
        
        await setDoc(doc(db, 'website', 'players'), { data: playersToSave });
        
        // Save to localStorage as well for backup
        localStorage.setItem('players', JSON.stringify(playersToSave));
        console.log("Players saved to Firestore and localStorage");
      } else {
        let needsDirectFirestoreUpdate = false;
        
        // Handle other data types
        switch (activeTab) {
          case 'alumni':
            if (alumni.find(a => a.id === editItem.id)) {
              setAlumni(alumni.map(a => a.id === editItem.id ? editItem : a));
            } else {
              setAlumni([...alumni, editItem]);
            }
            break;
          case 'events':
            if (events.find(e => e.id === editItem.id)) {
              setEvents(events.map(e => e.id === editItem.id ? editItem : e));
            } else {
              setEvents([...events, editItem]);
            }
            needsDirectFirestoreUpdate = true;
            break;
          case 'news':
            if (news.find(n => n.id === editItem.id)) {
              setNews(news.map(n => n.id === editItem.id ? editItem : n));
            } else {
              setNews([...news, editItem]);
            }
            break;
          case 'teams':
            if (teams.find(t => t.id === editItem.id)) {
              setTeams(teams.map(t => t.id === editItem.id ? editItem : t));
            } else {
              setTeams([...teams, editItem]);
            }
            break;
          case 'settings':
            // Update the site settings
            setSiteSettings(editItem);
            break;
          case 'players':
            if (players.find(p => p.id === editItem.id)) {
              setPlayers(players.map(p => p.id === editItem.id ? editItem : p));
            } else {
              setPlayers([...players, editItem]);
            }
            break;
        }
        
        // For other data types that still use the saveData method
        console.log("Calling saveData for other data types...");
        await saveData();
        
        // For events, also update Firestore directly to ensure immediate consistency
        if (needsDirectFirestoreUpdate && activeTab === 'events') {
          const updatedEvents = events.find(e => e.id === editItem.id)
            ? events.map(e => e.id === editItem.id ? editItem : e)
            : [...events, editItem];
            
          // Update Firestore directly
          await setDoc(doc(db, 'website', 'events'), { data: updatedEvents });
          
          // Update localStorage as well
          localStorage.setItem('events', JSON.stringify(updatedEvents));
          
          console.log("Events updated directly in Firestore and localStorage for immediate consistency");
        }
        
        console.log("Save completed via saveData");
      }
      
      setEditItem(null);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving item:", error);
      alert("There was an error saving. Please try again.");
    }
  };

  const handleDeleteItem = (id: number) => {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      return;
    }
    
    switch (activeTab) {
      case 'players':
        setPlayers(players.filter(p => p.id !== id));
        break;
      case 'alumni':
        setAlumni(alumni.filter(a => a.id !== id));
        break;
      case 'events':
        setEvents(events.filter(e => e.id !== id));
        break;
      case 'news':
        setNews(news.filter(n => n.id !== id));
        break;
      case 'teams':
        // Check if any players are assigned to this team
        const playersInTeam = players.filter(p => {
          const teamToDelete = teams.find(t => t.id === id);
          return p.team === teamToDelete?.name;
        });
        
        if (playersInTeam.length > 0) {
          if (!confirm(`This team has ${playersInTeam.length} player(s) assigned to it. Deleting will unassign these players. Continue?`)) {
            return;
          }
          
          // Unassign players from this team
          setPlayers(players.map(p => {
            const teamToDelete = teams.find(t => t.id === id);
            if (p.team === teamToDelete?.name) {
              return { ...p, team: '' };
            }
            return p;
          }));
        }
        
        setTeams(teams.filter(t => t.id !== id));
        break;
    }
    saveData();
  };

  // Render form for editing
  const renderForm = () => {
    if (!editItem) return null;

    // Player editing form (can be accessed from team management)
    if (typeof editItem === 'object' && 'team' in editItem && 'isCaptain' in editItem) {
      return (
        <div className="edit-form">
          <div className="form-group">
            <label>Name:</label>
            <input type="text" name="name" value={editItem && 'name' in editItem ? editItem.name : ''} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Number:</label>
            <input type="number" name="number" value={editItem && 'number' in editItem ? editItem.number : 0} onChange={handleInputChange} />
          </div>
          {!selectedTeam && (
            <div className="form-group">
              <label>Team:</label>
              <select name="team" value={editItem && 'team' in editItem ? editItem.team : ''} onChange={handleInputChange}>
                <option value="">Select team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Bio:</label>
            <textarea name="bio" value={editItem && 'bio' in editItem ? editItem.bio : ''} onChange={handleInputChange} rows={4} />
          </div>
          <div className="form-group checkbox">
            <input type="checkbox" name="isCaptain" checked={editItem && 'isCaptain' in editItem ? editItem.isCaptain : false} onChange={handleInputChange} />
            <label>Is Captain</label>
          </div>
          
          <div className="form-group">
            <label>Player Photo:</label>
            <div className="file-upload-container">
              <input 
                type="file" 
                onChange={handlePlayerImageUpload} 
                accept="image/*"
                id="player-image-upload"
                className="file-input"
              />
              <label htmlFor="player-image-upload" className="file-upload-button">
                Choose Image
              </label>
              {editItem && 'image' in editItem && editItem.image && (
                <button 
                  type="button" 
                  onClick={handleRemovePlayerImage}
                  className="remove-image-btn"
                >
                  Remove Image
                </button>
              )}
            </div>
            <small className="input-help">
              Upload a photo of the player. Recommended: square photo focused on face/upper body.
            </small>
            
            {editItem && 'image' in editItem && editItem.image && (
              <div className="image-preview-container">
                <div className="player-image-preview">
                  <div 
                    className="preview-image" 
                    style={{ backgroundImage: `url(${editItem.image})` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'alumni':
        return (
          <div className="edit-form">
            <div className="form-group">
              <label>Name:</label>
              <input type="text" name="name" value={editItem.name} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Years with team:</label>
              <input type="text" name="years" value={editItem.years} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Achievements:</label>
              <textarea name="achievements" value={editItem.achievements} onChange={handleInputChange} rows={3} />
            </div>
            <div className="form-group">
              <label>Current:</label>
              <input type="text" name="current" value={editItem.current} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 'events':
        return (
          <EventForm 
            event={editItem as Event}
            onInputChange={handleInputChange}
            onImageUpload={(imageUrl) => setEditItem({...editItem, image: imageUrl})}
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
          />
        );
      case 'news':
        return (
          <div className="edit-form">
            <div className="form-group">
              <label>Title:</label>
              <input type="text" name="title" value={editItem.title} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input type="date" name="date" value={editItem.date} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Content:</label>
              <textarea name="content" value={editItem.content} onChange={handleInputChange} rows={6} />
            </div>
            <div className="form-group">
              <label>Author:</label>
              <input type="text" name="author" value={editItem.author} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 'teams':
        return (
          <div className="edit-form">
            <div className="form-group">
              <label>Team Name:</label>
              <input 
                type="text" 
                name="name" 
                value={editItem.name} 
                onChange={handleInputChange}
                placeholder="e.g., A Team, Development Squad, etc."
                required 
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea 
                name="description" 
                value={editItem.description} 
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of the team"
                required
              />
            </div>
            <div className="form-group">
              <label>Team Color:</label>
              <div className="color-picker-container">
                <input 
                  type="color" 
                  name="color" 
                  value={editItem.color} 
                  onChange={handleInputChange}
                  className="color-picker"
                />
                <span className="color-value">{editItem.color}</span>
              </div>
              <small className="input-help">
                Select a color that represents this team. This will be used for visual identification.
              </small>
            </div>
          </div>
        );
      case 'settings':
        return (
          <SiteSettingsForm 
            settings={editItem as SiteSettings}
            onInputChange={handleInputChange}
            onSettingsChange={handleSettingsChange}
            _onSave={handleSaveItem}
            _onCancel={handleCancelEdit}
          />
        );
      default:
        return null;
    }
  };

  // Render list items based on active tab
  const renderItems = () => {
    switch (activeTab) {
      case 'players':
        return players.map((player) => (
          <div key={player.id} className="data-item">
            <div className="item-header">
              {player.image && (
                <div 
                  className="item-thumbnail" 
                  style={{ backgroundImage: `url(${player.image})` }}
                ></div>
              )}
              <div className="item-title">
                <h3>{player.name} - #{player.number}</h3>
                {player.team && <div className="team-tag">{player.team}</div>}
                {player.isCaptain && <span className="captain-tag">Captain</span>}
              </div>
            </div>
            <div className="item-actions">
              <button onClick={() => handleEditClick(player)}>Edit</button>
              <button onClick={() => handleDeleteItem(player.id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ));
      case 'alumni':
        return alumni.map((alum) => (
          <div key={alum.id} className="data-item">
            <h3>{alum.name}</h3>
            <p>Years: {alum.years}</p>
            <p>Achievements: {alum.achievements}</p>
            <div className="item-actions">
              <button onClick={() => handleEditClick(alum)}>Edit</button>
              <button onClick={() => handleDeleteItem(alum.id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ));
      case 'events':
        return events.map((event) => (
          <div key={event.id} className="data-item">
            <div className={`event-badge ${event.type === 'past' ? 'past-event' : ''}`}>
              {event.type === 'upcoming' ? 'Upcoming' : 'Past'}
            </div>
            <div className="event-header">
              {event.image && (
                <div 
                  className="event-image" 
                  style={{ backgroundImage: `url(${event.image})`, width: '100px', height: '100px', backgroundSize: 'cover', marginRight: '10px' }}
                ></div>
              )}
              <div className="event-details">
                <h3>{event.title}</h3>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
              </div>
            </div>
            <p className="item-description">{event.description}</p>
            {event.result && <p><strong>Result:</strong> {event.result}</p>}
            {event.livestreamLink && (
              <p><strong>Livestream:</strong> <a href={event.livestreamLink} target="_blank" rel="noopener noreferrer">View</a></p>
            )}
            <div className="item-actions">
              <button onClick={() => handleEditClick(event)}>Edit</button>
              <button onClick={() => handleDeleteItem(event.id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ));
      case 'news':
        return news.map((item) => (
          <div key={item.id} className="data-item">
            <h3>{item.title}</h3>
            <p>Date: {new Date(item.date).toLocaleDateString()}</p>
            <p>Author: {item.author}</p>
            <div className="item-actions">
              <button onClick={() => handleEditClick(item)}>Edit</button>
              <button onClick={() => handleDeleteItem(item.id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ));
      case 'teams':
        if (selectedTeam) {
          // Show team details with players
          const teamPlayers = players.filter(player => player.team === selectedTeam.name);
          
          return (
            <div className="team-detail-view">
              <div className="team-detail-header">
                <button className="back-btn" onClick={handleBackToTeams}>
                  ← Back to Teams
                </button>
                <div className="team-header">
                  <div className="team-color-indicator" style={{ backgroundColor: selectedTeam.color }}></div>
                  <h2>{selectedTeam.name}</h2>
                </div>
                <p className="team-description">{selectedTeam.description}</p>
              </div>
              
              <div className="team-management-tabs">
                <div className="team-tab active">Players</div>
                {/* These would be actual tabs in a more complete implementation */}
                <div className="team-tab disabled">Coaches</div>
                <div className="team-tab disabled">Captains</div>
              </div>
              
              <div className="team-players-section">
                <div className="section-header">
                  <h3>Team Players</h3>
                  <button className="add-btn" onClick={handleAddPlayerToTeam}>
                    Add Player
                  </button>
                </div>
                
                <div className="players-list">
                  {teamPlayers.length > 0 ? (
                    teamPlayers.map((player) => (
                      <div key={player.id} className="data-item">
                        <div className="item-header">
                          {player.image && (
                            <div 
                              className="item-thumbnail" 
                              style={{ backgroundImage: `url(${player.image})` }}
                            ></div>
                          )}
                          <div className="item-title">
                            <h3>{player.name} - #{player.number}</h3>
                            {player.isCaptain && <span className="captain-tag">Captain</span>}
                          </div>
                        </div>
                        <div className="item-actions">
                          <button onClick={() => handleEditClick(player)}>Edit</button>
                          <button onClick={() => handleDeleteItem(player.id)} className="delete-btn">Delete</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No players assigned to this team yet. Add your first player using the button above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
        
        // Show team list
        return teams.map((team) => (
          <div key={team.id} className="data-item team-card">
            <div 
              className="team-card-content"
              onClick={() => handleSelectTeam(team)}
            >
              <div className="team-color-indicator" style={{ backgroundColor: team.color }}></div>
              <h3>{team.name}</h3>
              <p className="team-description">{team.description}</p>
              
              {/* Count players in this team */}
              <p className="team-player-count">
                {players.filter(player => player.team === team.name).length} players assigned
              </p>
            </div>
            
            <div className="item-actions">
              <button onClick={(e) => { e.stopPropagation(); handleEditClick(team); }}>Edit Team</button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(team.id); }} className="delete-btn">Delete</button>
            </div>
          </div>
        ));
      case 'pages':
        // For pages tab, we don't need to return a form here since we handle coaches in the main render method
        if (editItem && typeof editItem === 'object' && 'role' in (editItem ?? {})) {
          // Return null for coaches, as we're handling them in the main render method
          return null;
        }
        
        // Regular page content view
        return (
          <div className="pages-section">
            {/* About Image Section */}
            <div className="data-item page-editor">
              <h3>About Page</h3>
              <div className="page-section">
                <h4>Team History Image</h4>
                {pageContent?.aboutImage ? (
                  <div className="page-image-preview">
                    <div 
                      className="page-image" 
                      style={{ backgroundImage: `url(${pageContent?.aboutImage})` }}
                    ></div>
                    <button 
                      className="remove-image-btn" 
                      onClick={handleRemoveAboutImage}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-section">
                    <p>No image uploaded yet. Add an image for the About page.</p>
                    <div className="file-upload-container">
                      <input 
                        type="file" 
                        onChange={handleAboutImageUpload} 
                        accept="image/*"
                        id="about-image-upload"
                        className="file-input"
                      />
                      <label htmlFor="about-image-upload" className="file-upload-button">
                        Choose Image
                      </label>
                    </div>
                  </div>
                )}
                <small className="input-help">
                  This image will appear in the "Team History & Mission" section of the About page.
                  Recommended dimensions: at least 800x600 pixels.
                </small>
              </div>
            </div>
            
            {/* Coaches Section */}
            <div className="data-item page-editor">
              <div className="section-header">
                <h3>Coaching Staff</h3>
                <button 
                  className="add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCoach();
                  }}
                >
                  Add New Coach
                </button>
              </div>
              
              <div className="coaches-list">
                {(pageContent?.coaches || []).map(coach => (
                  <div key={coach.id} className="coach-item">
                    <div className="coach-preview">
                      {coach.image ? (
                        <div 
                          className="coach-thumbnail" 
                          style={{ backgroundImage: `url(${coach.image})` }}
                        ></div>
                      ) : (
                        <div className="coach-thumbnail-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                      <div className="coach-details">
                        <h4>{coach.name}</h4>
                        <p className="coach-role-tag">{coach.role}</p>
                        <p className="coach-bio-preview">{coach.bio.substring(0, 100)}...</p>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleEditCoach(coach);
                      }}>Edit</button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCoach(coach.id);
                      }} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
                
                {(!pageContent?.coaches || pageContent?.coaches.length === 0) && (
                  <div className="empty-state">
                    <p>No coaches added yet. Add your first coach using the button above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="data-item site-settings-preview">
            <h3>Hero Banner Settings</h3>
            <div 
              className="hero-preview" 
              style={{ 
                backgroundImage: siteSettings.heroBackgroundImage ? 
                  `url(${siteSettings.heroBackgroundImage})` : 
                  'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
              }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <h4>{siteSettings.heroTitle}</h4>
                <p>{siteSettings.heroSubtitle}</p>
                <button>{siteSettings.heroCtaText}</button>
              </div>
            </div>
            <p><strong>Title:</strong> {siteSettings.heroTitle}</p>
            <p><strong>Subtitle:</strong> {siteSettings.heroSubtitle}</p>
            <p><strong>CTA Text:</strong> {siteSettings.heroCtaText}</p>
            <p><strong>CTA Link:</strong> {siteSettings.heroCtaLink}</p>
            {siteSettings.heroBackgroundImage && (
              <div className="image-thumbnail-container">
                <p><strong>Background Image:</strong></p>
                <div 
                  className="image-thumbnail" 
                  style={{ backgroundImage: `url(${siteSettings.heroBackgroundImage})` }}
                ></div>
              </div>
            )}
            <div className="item-actions">
              <button onClick={() => handleEditClick(siteSettings)}>Edit</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button 
          className={activeTab === 'alumni' ? 'active' : ''}
          onClick={() => setActiveTab('alumni')}
        >
          Alumni
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button 
          className={activeTab === 'news' ? 'active' : ''}
          onClick={() => setActiveTab('news')}
        >
          News
        </button>
        <button 
          className={activeTab === 'teams' ? 'active' : ''}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
        <button 
          className={activeTab === 'pages' ? 'active' : ''}
          onClick={() => setActiveTab('pages')}
        >
          Pages
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Site Settings
        </button>
      </div>

      <div className="admin-content">
        {editMode && activeTab === 'pages' && editItem && typeof editItem === 'object' && 'role' in (editItem ?? {}) ? (
          // Special case for coach editing (use dedicated coach form)
          <div className="edit-container">
            <h2>{editItem && 'id' in editItem ? 'Edit' : 'Add New'} Coach</h2>
            <div className="edit-form">
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editItem && 'name' in editItem ? editItem.name : ''}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <input 
                  type="text" 
                  name="role" 
                  value={editItem && 'role' in editItem ? editItem.role : ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Head Coach, Assistant Coach, etc."
                  required
                />
              </div>
              <div className="form-group">
                <label>Bio:</label>
                <textarea 
                  name="bio" 
                  value={editItem && 'bio' in editItem ? editItem.bio : ''}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Brief biography"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Coach Photo:</label>
                <div className="file-upload-container">
                  <input 
                    type="file" 
                    onChange={handleCoachImageUpload} 
                    accept="image/*"
                    id="coach-image-upload"
                    className="file-input"
                    key={`coach-upload-${Date.now()}`} /* Force re-render of input */
                  />
                  <label htmlFor="coach-image-upload" className="file-upload-button">
                    Choose Image
                  </label>
                  {editItem && 'image' in editItem && editItem.image && (
                    <button 
                      type="button" 
                      onClick={handleRemoveCoachImage}
                      className="remove-image-btn"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                <small className="input-help">
                  Upload a photo of the coach. Square images work best.
                </small>
                
                {editItem && 'image' in editItem && editItem.image && (
                  <div className="image-preview-container">
                    <div className="player-image-preview">
                      <div 
                        className="preview-image" 
                        style={{ backgroundImage: `url(${editItem.image})` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="edit-actions">
              <button onClick={handleSaveCoach} className="save-btn">Save Coach</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        ) : editMode ? (
          <div className="edit-container">
            <h2>
              {activeTab === 'settings' ? 
                'Edit Site Settings' : 
                `${editItem && 'id' in editItem ? 'Edit' : 'Add New'} ${activeTab.slice(0, -1)}`
              }
            </h2>
            {renderForm()}
            <div className="edit-actions">
              <button onClick={handleSaveItem} className="save-btn">Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="data-list">
            <div className="data-header">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <button onClick={handleNewClick} className="add-btn">Add New</button>
            </div>
            <div className="data-items">
              {renderItems()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;