import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import FollowRequestsPage from './pages/FollowRequestsPage';
import ReelsPage from './pages/ReelsPage';
import ChatPage from './pages/ChatPage';
import GuildsPage from './pages/GuildsPage';
import GuildDetailPage from './pages/GuildDetailPage';
import JoinGuildPage from './pages/JoinGuildPage';
import Layout from './components/Layout';
import ExplorePage from './pages/ExplorePage';
import NotificationsPage from './pages/NotificationsPage';
import LandingPage from './pages/LandingPage';
import './styles/global.css';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Root route: Shows Landing if guest, Home if auth */}
      <Route path="/" element={
        user ? (
          <PrivateRoute>
            <Layout>
              <HomePage />
            </Layout>
          </PrivateRoute>
        ) : (
          <LandingPage />
        )
      } />

      <Route path="/profile/:username" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
      <Route path="/accounts/edit" element={<PrivateRoute><Layout><EditProfilePage /></Layout></PrivateRoute>} />
      <Route path="/guilds" element={<PrivateRoute><Layout><GuildsPage /></Layout></PrivateRoute>} />
      <Route path="/guilds/:guildId" element={<PrivateRoute><Layout><GuildDetailPage /></Layout></PrivateRoute>} />
      <Route path="/guilds/join/:token" element={<PrivateRoute><Layout><JoinGuildPage /></Layout></PrivateRoute>} />
      <Route path="/follow-requests" element={<PrivateRoute><Layout><FollowRequestsPage /></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Layout><NotificationsPage /></Layout></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><Layout><ExplorePage /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><EditProfilePage /></Layout></PrivateRoute>} />
      <Route path="/reels" element={<PrivateRoute><Layout><ReelsPage /></Layout></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;