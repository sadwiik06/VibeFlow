import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CreatePost from './CreatePost';

const Layout = ({ children }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAFA' }}>
      <Sidebar onOpenCreate={() => setIsCreateOpen(true)} />
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
      <CreatePost hideTrigger forceOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onPostCreated={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default Layout;