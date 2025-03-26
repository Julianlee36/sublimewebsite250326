import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  type: 'upcoming' | 'past';
  result?: string;
  livestreamLink?: string;
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
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  pageContent: PageContent;
  setPageContent: React.Dispatch<React.SetStateAction<PageContent>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saveData: () => void;
  loadData: () => void;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample initial data
const initialPlayers: Player[] = [
  {
    id: 1,
    name: 'Alex Chen',
    position: 'Handler',
    number: 7,
    years: 4,
    bio: 'Team captain and primary handler. Known for precise throws and field vision.',
    isCaptain: true,
    image: null,
    team: 'A Team'
  },
  {
    id: 2,
    name: 'Taylor Smith',
    position: 'Cutter',
    number: 12,
    years: 3,
    bio: 'Deep threat with exceptional speed and jumping ability.',
    isCaptain: false,
    image: null,
    team: 'A Team'
  },
  {
    id: 3,
    name: 'Jordan Garcia',
    position: 'Handler',
    number: 21,
    years: 5,
    bio: 'Veteran handler with leadership experience and consistent throws.',
    isCaptain: true,
    image: null,
    team: 'B Team'
  }
];

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
    type: 'upcoming'
  },
  {
    id: 2,
    title: 'Winter Invitational',
    date: '2024-12-10',
    location: 'Indoor Sports Complex',
    description: 'Annual indoor tournament with top regional competition.',
    type: 'past',
    result: '3rd Place'
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
  
  const [pageContent, setPageContent] = useState<PageContent>(() => {
    const savedPageContent = localStorage.getItem('pageContent');
    return savedPageContent ? JSON.parse(savedPageContent) : initialPageContent;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    return savedSettings ? JSON.parse(savedSettings) : initialSiteSettings;
  });

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('alumni', JSON.stringify(alumni));
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('news', JSON.stringify(news));
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('pageContent', JSON.stringify(pageContent));
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
  };

  // Load data from localStorage
  const loadData = () => {
    const savedPlayers = localStorage.getItem('players');
    const savedAlumni = localStorage.getItem('alumni');
    const savedEvents = localStorage.getItem('events');
    const savedNews = localStorage.getItem('news');
    const savedTeams = localStorage.getItem('teams');
    const savedPageContent = localStorage.getItem('pageContent');
    const savedSettings = localStorage.getItem('siteSettings');

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedAlumni) setAlumni(JSON.parse(savedAlumni));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedNews) setNews(JSON.parse(savedNews));
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedPageContent) setPageContent(JSON.parse(savedPageContent));
    if (savedSettings) setSiteSettings(JSON.parse(savedSettings));
  };

  // Save data when it changes
  useEffect(() => {
    saveData();
  }, [players, alumni, events, news, teams, pageContent, siteSettings]);

  const value = {
    players,
    setPlayers,
    alumni,
    setAlumni,
    events,
    setEvents,
    news,
    setNews,
    teams,
    setTeams,
    pageContent,
    setPageContent,
    siteSettings,
    setSiteSettings,
    saveData,
    loadData,
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