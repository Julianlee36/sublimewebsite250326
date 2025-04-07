import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Define types for our data
export interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
  years: number;
  bio: string;
  isCaptain: boolean;
  image: string | null;
  team: string;
}

export interface Alumni {
  id: number;
  name: string;
  years: string;
  achievements: string;
  current: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'upcoming' | 'current' | 'past';
  eventType: 'event' | 'campaign'; // New field to differentiate between events and campaigns
  result?: string;
  livestreamLink?: string;
  image?: string;
  endDate?: string; // For campaign date ranges
  roster?: Player[]; // For campaign rosters
  gallery?: string[]; // For completed event/campaign images
  teamName?: string; // The name of the team participating in the campaign
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  content: string;
  author: string;
  image?: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  color: string;
}

// Campaigns are now integrated into the Event interface
// This interface is kept for backward compatibility
export interface Campaign {
  id: number;
  title: string;
  description: string;
  goalAmount?: number;
  currentAmount?: number;
  endDate?: string;
  image?: string;
}

export interface Coach {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string | null;
}

export interface PageContent {
  aboutImage: string; // Base64 data URL of the about page image
  coaches: Coach[];
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroBackgroundImage: string; // This will store the base64 data URL of the uploaded image
}

// Define the shape of our context
interface DataContextType {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  alumni: Alumni[];
  setAlumni: React.Dispatch<React.SetStateAction<Alumni[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  news: NewsItem[];
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  pageContent: PageContent;
  setPageContent: React.Dispatch<React.SetStateAction<PageContent>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saveData: () => void;
  loadData: () => void;
  refreshData: () => void;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Empty initial players
const initialPlayers: Player[] = [];

const initialAlumni: Alumni[] = [
  {
    id: 1,
    name: 'Jamie Williams',
    years: '2018-2023',
    achievements: 'Team MVP (2020, 2022), All-Region (2021-2023)',
    current: 'Playing professionally for the Seattle Cascades'
  },
  {
    id: 2,
    name: 'Drew Martinez',
    years: '2018-2022',
    achievements: 'Team Captain (2020-2022), Defensive Player of the Year (2021)',
    current: 'Assistant coach for local college team'
  }
];

const initialEvents: Event[] = [
  {
    id: 1,
    title: 'Spring Tournament',
    date: '2025-04-15',
    location: 'Central Park Fields',
    description: 'Season opener tournament with 8 regional teams competing.',
    type: 'upcoming',
    eventType: 'event'
  },
  {
    id: 2,
    title: 'Regional Championship',
    date: '2025-03-22',
    location: 'City Sports Complex',
    description: 'Ongoing championship tournament with teams from across the region.',
    type: 'current',
    eventType: 'event',
    result: 'In Group Stage - Won 2, Lost 1',
    livestreamLink: 'https://livestream.example.com/regional-championship'
  },
  {
    id: 3,
    title: 'Winter Invitational',
    date: '2024-12-10',
    location: 'Indoor Sports Complex',
    description: 'Annual indoor tournament with top regional competition.',
    type: 'past',
    eventType: 'event',
    result: '3rd Place'
  },
  {
    id: 4,
    title: 'National Championship Campaign',
    date: '2025-05-01',
    endDate: '2025-07-31',
    location: 'Multiple Locations, Australia',
    description: 'Three-month training and competition campaign leading to the National Championships.',
    type: 'upcoming',
    eventType: 'campaign'
  },
  {
    id: 5,
    title: 'Winter Training Campaign',
    date: '2024-11-01',
    endDate: '2025-02-28',
    location: 'Brisbane, QLD',
    description: 'Intensive winter training program with regional competitions.',
    type: 'current',
    eventType: 'campaign',
    result: 'Month 2 of 4 - Completed first regional tournament'
  }
];

const initialNews: NewsItem[] = [
  {
    id: 1,
    title: 'Team Announcement for Spring Season',
    date: '2025-02-01',
    content: 'We are excited to announce our roster for the upcoming spring season!',
    author: 'Coaching Staff'
  },
  {
    id: 2,
    title: 'Fundraising Success',
    date: '2025-01-15',
    content: 'Thanks to our supporters, we exceeded our fundraising goal for the season.',
    author: 'Fundraising Committee'
  }
];

const initialTeams: Team[] = [
  {
    id: 1,
    name: 'A Team',
    description: 'Our elite competitive team that competes at the highest level.',
    color: '#1e90ff' // Dodger Blue - matches primary color
  },
  {
    id: 2,
    name: 'B Team',
    description: 'Our second competitive team focused on development and competition.',
    color: '#ff4500' // Orange Red - matches secondary color
  },
  {
    id: 3,
    name: 'Development Team',
    description: 'For newer players looking to develop their skills and game knowledge.',
    color: '#32cd32' // Lime Green
  }
];

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    title: 'Tournament Travel Fund',
    description: 'Help our team travel to the national tournament this summer! Your contributions will help cover travel expenses, accommodation, and tournament fees.',
    goalAmount: 5000,
    currentAmount: 2750,
    endDate: '2025-06-01'
  },
  {
    id: 2,
    title: 'New Team Uniforms',
    description: 'We need new uniforms for the upcoming season. Support our team by contributing to our uniform fund!',
    goalAmount: 2000,
    currentAmount: 800,
    endDate: '2025-05-15'
  }
];

const initialPageContent: PageContent = {
  aboutImage: '', // Empty by default
  coaches: [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Head Coach',
      bio: 'Sarah has been coaching Ultimate for over 10 years and has led teams to national championships. She brings strategic expertise and passion to Sublime Ultimate.',
      image: null
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Assistant Coach',
      bio: 'Former professional Ultimate player with 5 years of coaching experience. Michael specializes in offensive strategies and player development.',
      image: null
    },
    {
      id: 3,
      name: 'David Chen',
      role: 'Conditioning Coach',
      bio: 'Certified strength and conditioning specialist who helps our athletes reach peak physical performance through customized training programs.',
      image: null
    }
  ]
};

const initialSiteSettings: SiteSettings = {
  heroTitle: 'Sublime Ultimate',
  heroSubtitle: 'Excellence in Ultimate Frisbee',
  heroCtaText: 'Learn More About Us',
  heroCtaLink: '/about',
  heroBackgroundImage: '' // Default empty, will use gradient fallback
};

interface DataProviderProps {
  children: ReactNode;
}

// Create a provider component
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    const savedPlayers = localStorage.getItem('players');
    return savedPlayers ? JSON.parse(savedPlayers) : initialPlayers;
  });

  const [alumni, setAlumni] = useState<Alumni[]>(() => {
    const savedAlumni = localStorage.getItem('alumni');
    return savedAlumni ? JSON.parse(savedAlumni) : initialAlumni;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('events');
    return savedEvents ? JSON.parse(savedEvents) : initialEvents;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const savedNews = localStorage.getItem('news');
    return savedNews ? JSON.parse(savedNews) : initialNews;
  });
  
  const [teams, setTeams] = useState<Team[]>(() => {
    const savedTeams = localStorage.getItem('teams');
    return savedTeams ? JSON.parse(savedTeams) : initialTeams;
  });
  
  // Campaigns are now managed as events with eventType: 'campaign'
  // This state is kept for backward compatibility but not actively updated
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  
  const [pageContent, setPageContent] = useState<PageContent>(() => {
    const savedPageContent = localStorage.getItem('pageContent');
    return savedPageContent ? JSON.parse(savedPageContent) : initialPageContent;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    return savedSettings ? JSON.parse(savedSettings) : initialSiteSettings;
  });

  // Save data to Firebase Firestore
  const saveData = async () => {
    try {
      console.log('Saving data to Firestore...');
      
      // CRITICAL: First, check if there's any existing coach data in Firestore that we should preserve
      try {
        const existingPageContentDoc = await getDoc(doc(db, 'website', 'pageContent'));
        if (existingPageContentDoc.exists() && existingPageContentDoc.data()?.data) {
          const existingData = existingPageContentDoc.data()?.data;
          const existingCoaches = existingData?.coaches || [];
          
          if (existingCoaches.length > 0 && (!pageContent.coaches || pageContent.coaches.length === 0)) {
            console.log(`IMPORTANT: Found ${existingCoaches.length} coaches in Firestore but none in memory. Preserving Firestore data.`);
            // Update our in-memory state to include the coaches from Firestore
            setPageContent({
              ...pageContent,
              coaches: existingCoaches
            });
          }
        }
      } catch (checkError) {
        console.error("Error checking existing pageContent:", checkError);
      }
      
      // Sanitize data for Firestore to avoid "invalid nested entity" errors
      const sanitizeData = (data: any[]): any[] => {
        return data.map(item => {
          const sanitized: any = { ...item };
          
          // Handle large image strings by storing a placeholder in Firestore
          if (sanitized.image && typeof sanitized.image === 'string' && sanitized.image.length > 10000) {
            sanitized.image = '[Image data stored locally]';
          }
          
          return sanitized;
        });
      };
      
      // Store data collections in Firestore with sanitization
      // Players are handled specially in AdminPage.tsx
      await setDoc(doc(db, 'website', 'alumni'), { data: sanitizeData(alumni) });
      
      // Log events before saving to Firestore
      console.log(`Saving ${events.length} events/campaigns to Firestore:`, 
        events.map(e => ({id: e.id, title: e.title, type: e.type, eventType: e.eventType})));
      
      await setDoc(doc(db, 'website', 'events'), { data: events }); // Events don't have image data
      console.log("Events document saved to Firestore");
      
      await setDoc(doc(db, 'website', 'news'), { data: sanitizeData(news) });
      // No longer saving campaigns separately as they're included in events
      // await setDoc(doc(db, 'website', 'campaigns'), { data: sanitizeData(campaigns) });
      await setDoc(doc(db, 'website', 'teams'), { data: teams }); // Teams don't have complex data
      
      // IMPORTANT: For pageContent, we need to ensure we're not wiping out coaches
      const coachesToSave = pageContent.coaches && pageContent.coaches.length > 0 
        ? pageContent.coaches 
        : (await getDoc(doc(db, 'website', 'pageContent'))).data()?.data?.coaches || [];
        
      console.log(`Saving pageContent with ${coachesToSave.length} coaches`);
      
      // Special handling for pageContent with images
      const sanitizedPageContent = { 
        ...pageContent,
        coaches: coachesToSave.length > 0 ? sanitizeData(coachesToSave) : [],
        // We now store image URLs in Firebase Storage, so we just use the URL
        aboutImage: pageContent.aboutImage
      };
      
      await setDoc(doc(db, 'website', 'pageContent'), { data: sanitizedPageContent });
      
      // special handling for site settings with hero image
      const siteSettingsToSave = { ...siteSettings };
      
      // We now store image URLs in Firebase Storage, so no need to sanitize
      // The heroBackgroundImage field should contain a URL now, not base64 data
      
      await setDoc(doc(db, 'website', 'siteSettings'), { data: siteSettingsToSave });
      
      // Also save FULL data to localStorage for quicker access
      localStorage.setItem('players', JSON.stringify(players));
      localStorage.setItem('alumni', JSON.stringify(alumni));
      localStorage.setItem('events', JSON.stringify(events));
      localStorage.setItem('news', JSON.stringify(news));
      // No longer storing campaigns separately in localStorage
      // localStorage.setItem('campaigns', JSON.stringify(campaigns));
      localStorage.setItem('teams', JSON.stringify(teams));
      localStorage.setItem('pageContent', JSON.stringify(pageContent));
      localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
      
      // Special case to clear existing test players if needed
      if (players.length === 0) {
        console.log('Clearing any test players from both localStorage and Firestore');
        localStorage.removeItem('players');
        await setDoc(doc(db, 'website', 'players'), { data: [] });
      }
      
      console.log('Data saved to Firestore successfully (sanitized) and localStorage (full)');
      
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
      throw error; // Re-throw to allow handling in the calling component
    }
  };

  // Load data from Firestore (with localStorage fallback)
  const loadData = async () => {
    try {
      // Try to load from Firestore first
      const playersDoc = await getDoc(doc(db, 'website', 'players'));
      const alumniDoc = await getDoc(doc(db, 'website', 'alumni'));
      const eventsDoc = await getDoc(doc(db, 'website', 'events'));
      const newsDoc = await getDoc(doc(db, 'website', 'news'));
      // No longer loading campaigns separately
      // const campaignsDoc = await getDoc(doc(db, 'website', 'campaigns'));
      const teamsDoc = await getDoc(doc(db, 'website', 'teams'));
      const pageContentDoc = await getDoc(doc(db, 'website', 'pageContent'));
      const siteSettingsDoc = await getDoc(doc(db, 'website', 'siteSettings'));
      
      // Update state with Firestore data
      if (playersDoc.exists()) setPlayers(playersDoc.data()?.data || []);
      if (alumniDoc.exists()) setAlumni(alumniDoc.data()?.data || []);
      if (eventsDoc.exists()) setEvents(eventsDoc.data()?.data || []);
      if (newsDoc.exists()) setNews(newsDoc.data()?.data || []);
      // if (campaignsDoc.exists()) setCampaigns(campaignsDoc.data()?.data || []);
      if (teamsDoc.exists()) setTeams(teamsDoc.data()?.data || []);
      if (pageContentDoc.exists()) {
        const pageData = pageContentDoc.data()?.data;
        // Make sure all required fields exist
        setPageContent({
          aboutImage: pageData?.aboutImage || '',
          coaches: pageData?.coaches || initialPageContent.coaches
        });
      }
      if (siteSettingsDoc.exists() && siteSettingsDoc.data()?.data) {
        setSiteSettings(siteSettingsDoc.data().data);
      } else {
        setSiteSettings(initialSiteSettings);
      }
      
    } catch (error) {
      console.error("Error loading data from Firestore:", error);
      
      // Fall back to localStorage if Firestore fails
      const savedPlayers = localStorage.getItem('players');
      const savedAlumni = localStorage.getItem('alumni');
      const savedEvents = localStorage.getItem('events');
      const savedNews = localStorage.getItem('news');
      // No longer using campaigns in localStorage
      // const savedCampaigns = localStorage.getItem('campaigns');
      const savedTeams = localStorage.getItem('teams');
      const savedPageContent = localStorage.getItem('pageContent');
      const savedSettings = localStorage.getItem('siteSettings');

      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedAlumni) setAlumni(JSON.parse(savedAlumni));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedNews) setNews(JSON.parse(savedNews));
      // if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
      if (savedTeams) setTeams(JSON.parse(savedTeams));
      if (savedPageContent) setPageContent(JSON.parse(savedPageContent));
      if (savedSettings) setSiteSettings(JSON.parse(savedSettings));
    }
  };

  // Force refresh data from Firestore - use this function after saving
  const refreshData = async () => {
    try {
      console.log('Refreshing data from Firestore and localStorage...');
      
      // Check Firestore first for latest data
      try {
        console.log('Checking Firestore for latest data...');
        
        const playersDoc = await getDoc(doc(db, 'website', 'players'));
        if (playersDoc.exists() && playersDoc.data()?.data) {
          console.log('Firestore players data exists:', 
            `${playersDoc.data()?.data.length} players found`);
          setPlayers(playersDoc.data().data);
        }
        
        const pageContentDoc = await getDoc(doc(db, 'website', 'pageContent'));
        if (pageContentDoc.exists() && pageContentDoc.data()?.data) {
          console.log('Firestore pageContent data exists, includes coaches:', 
            `${pageContentDoc.data()?.data.coaches?.length || 0} coaches found`);
          
          // Make sure we have complete data structure even if some parts are missing
          const pageData = pageContentDoc.data()?.data;
          
          // Ensure we handle coaches data properly
          const coaches = pageData?.coaches || [];
          console.log(`Found ${coaches.length} coaches in Firestore during refresh`);
          
          const updatedPageContent = {
            aboutImage: pageData?.aboutImage || '',
            coaches: coaches
          };
          
          // Update state
          setPageContent(updatedPageContent);
          
          // Update localStorage with this data too for consistency
          localStorage.setItem('pageContent', JSON.stringify(updatedPageContent));
          
          // Log the updated data to confirm
          console.log('Updated pageContent with coaches:', updatedPageContent);
        } else {
          console.log('No pageContent document in Firestore or missing data structure');
        }
        
        // Continue loading other data types from Firestore
        const alumniDoc = await getDoc(doc(db, 'website', 'alumni'));
        if (alumniDoc.exists() && alumniDoc.data()?.data) {
          setAlumni(alumniDoc.data().data);
        }
        
        const eventsDoc = await getDoc(doc(db, 'website', 'events'));
        if (eventsDoc.exists() && eventsDoc.data()?.data) {
          console.log(`Found ${eventsDoc.data()?.data.length} events in Firestore:`, 
            eventsDoc.data().data.map((e: any) => ({id: e.id, title: e.title, type: e.type, eventType: e.eventType})));
          setEvents(eventsDoc.data().data);
        } else {
          console.warn("No events document in Firestore or missing data structure");
        }
        
        const newsDoc = await getDoc(doc(db, 'website', 'news'));
        if (newsDoc.exists() && newsDoc.data()?.data) {
          setNews(newsDoc.data().data);
        }
        
        // No longer loading campaigns separately as they're part of events
        // const campaignsDoc = await getDoc(doc(db, 'website', 'campaigns'));
        // if (campaignsDoc.exists() && campaignsDoc.data()?.data) {
        //   setCampaigns(campaignsDoc.data().data);
        // }
        
        const teamsDoc = await getDoc(doc(db, 'website', 'teams'));
        if (teamsDoc.exists() && teamsDoc.data()?.data) {
          setTeams(teamsDoc.data().data);
        }
        
        const siteSettingsDoc = await getDoc(doc(db, 'website', 'siteSettings'));
        if (siteSettingsDoc.exists() && siteSettingsDoc.data()?.data) {
          setSiteSettings(siteSettingsDoc.data().data);
        }
        
      } catch (firestoreError) {
        console.error("Error fetching data from Firestore:", firestoreError);
        
        // If Firestore fails, fall back to localStorage
        console.log('Falling back to localStorage...');
        loadFromLocalStorage();
      }
      
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };
  
  // Helper function to load from localStorage
  const loadFromLocalStorage = () => {
    try {
      // Primary data loading from localStorage as fallback
      const loadData = (key: string, setter: React.Dispatch<React.SetStateAction<any>>): boolean => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            setter(parsedData);
            console.log(`Loaded ${key} from localStorage:`, 
              Array.isArray(parsedData) ? `${parsedData.length} items` : 'object');
            return true;
          }
        } catch (error) {
          console.error(`Error loading ${key} from localStorage:`, error);
        }
        return false;
      };
      
      // Try to load from localStorage for each data type
      const playersLoaded = loadData('players', setPlayers);
      const teamsLoaded = loadData('teams', setTeams);
      const alumniLoaded = loadData('alumni', setAlumni);
      const eventsLoaded = loadData('events', setEvents);
      const newsLoaded = loadData('news', setNews);
      // No longer loading campaigns separately
      // const campaignsLoaded = loadData('campaigns', setCampaigns);
      const pageContentLoaded = loadData('pageContent', setPageContent);
      const settingsLoaded = loadData('siteSettings', setSiteSettings);
      
      console.log('Data loaded from localStorage:', { 
        playersLoaded, teamsLoaded, alumniLoaded, eventsLoaded, 
        newsLoaded, /* campaignsLoaded, */ pageContentLoaded, settingsLoaded 
      });
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  // Setup initial data loading only
  useEffect(() => {
    // Initial load
    loadData();
    
    // Explicitly refresh the data after initial load, especially needed for coaches
    setTimeout(() => {
      console.log("Initial data load timeout completed, refreshing again to ensure latest data");
      refreshData();
    }, 2000);
    
    // No real-time listeners to avoid constant updates and errors
  }, []);
  
  // Save data when it changes
  // Disable the automatic save that might be causing issues
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     saveData();
  //   }, 1000); // Increased debounce time to ensure complete saves
  //   
  //   return () => clearTimeout(timeoutId);
  // }, [players, alumni, events, news, teams, pageContent, siteSettings]);

  const value = {
    players,
    setPlayers,
    alumni,
    setAlumni,
    events,
    setEvents,
    news,
    setNews,
    campaigns,
    setCampaigns,
    teams,
    setTeams,
    pageContent,
    setPageContent,
    siteSettings,
    setSiteSettings,
    saveData,
    loadData,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Create a hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};