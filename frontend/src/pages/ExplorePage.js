import React from 'react';
import SearchBar from '../components/searchBar';

const ExplorePage = () => {
  return (
    <>
      <style>{`
        .explore-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .explore-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 24px;
          color: #0A0A0A;
        }
        /* Make the SearchBar wider when inside this page */
        .explore-page > div {
          width: 100%;
        }
        .explore-page input {
          width: 100% !important;
          padding: 14px 16px !important;
          font-size: 16px !important;
          border-radius: 12px !important;
          border: 1px solid #E4E4E2 !important;
          outline: none;
          transition: border-color 0.2s;
        }
        .explore-page input:focus {
          border-color: #6C63FF !important;
        }
        .explore-page > div > div {
          width: 100% !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
          border: none !important;
          border-radius: 12px !important;
          margin-top: 8px;
        }
        .explore-page a {
          padding: 12px 16px !important;
          transition: background 0.15s;
        }
        .explore-page a:hover {
          background: #F7F7F5 !important;
        }
      `}</style>
      <div className="explore-page">
        <div className="explore-title">Search Users</div>
        <SearchBar />
      </div>
    </>
  );
};

export default ExplorePage;
