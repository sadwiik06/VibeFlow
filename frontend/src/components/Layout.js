import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="app-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
