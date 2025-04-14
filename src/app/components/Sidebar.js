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
          <Link href="/filter">フィルター</Link>
          <Link href="/category">カテゴリー</Link>
          <Link href="/tag">タグ</Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;