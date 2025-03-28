import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './App.css';

// CMS
import { DataProvider } from './cms/DataContext';
import { adminRoutes } from './cms/routes';

// Layout
import MainLayout from './layouts/MainLayout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded Page Components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Roster = lazy(() => import('./pages/Roster'));
const Campaigns = lazy(() => import('./pages/Schedule'));
const News = lazy(() => import('./pages/News'));
const Media = lazy(() => import('./pages/Media'));
const Playbook = lazy(() => import('./pages/Playbook'));
const Sponsors = lazy(() => import('./pages/Sponsors'));
const Recruitment = lazy(() => import('./pages/Recruitment'));
const Contact = lazy(() => import('./pages/Contact'));
const EventDetail = lazy(() => import('./pages/EventDetail'));

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
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Home />
              </Suspense>
            } />
            <Route path="about" element={
              <Suspense fallback={<LoadingSpinner />}>
                <About />
              </Suspense>
            } />
            <Route path="roster" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Roster />
              </Suspense>
            } />
            <Route path="campaigns" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Campaigns />
              </Suspense>
            } />
            <Route path="news" element={
              <Suspense fallback={<LoadingSpinner />}>
                <News />
              </Suspense>
            } />
            <Route path="media" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Media />
              </Suspense>
            } />
            <Route path="playbook" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Playbook />
              </Suspense>
            } />
            <Route path="sponsors" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Sponsors />
              </Suspense>
            } />
            <Route path="recruitment" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Recruitment />
              </Suspense>
            } />
            <Route path="contact" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Contact />
              </Suspense>
            } />
            <Route path="event/:eventId" element={
              <Suspense fallback={<LoadingSpinner />}>
                <EventDetail />
              </Suspense>
            } />
          </Route>
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;