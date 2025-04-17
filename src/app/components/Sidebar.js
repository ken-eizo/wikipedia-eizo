'use client';

import React from 'react';
import Link from 'next/link';
import './Sidebar.css';
// ...existing code...

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <Link href="/readme">readme</Link>
          <Link href="/newrelease">今後追加予定</Link>
          <Link href="https://eizo.mov/">eizo.mov</Link>
          <Link href="https://team.eizo.mov/">team.eizo.mov</Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;