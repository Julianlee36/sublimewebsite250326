import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// CMS
import { DataProvider } from './cms/DataContext';
import { adminRoutes } from './cms/routes';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Roster from './pages/Roster';
import Schedule from './pages/Schedule';
import News from './pages/News';
import Media from './pages/Media';
import Playbook from './pages/Playbook';
import Sponsors from './pages/Sponsors';
import Recruitment from './pages/Recruitment';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          {/* Admin routes */}
          {adminRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="roster" element={<Roster />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="news" element={<News />} />
            <Route path="media" element={<Media />} />
            <Route path="playbook" element={<Playbook />} />
            <Route path="sponsors" element={<Sponsors />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;