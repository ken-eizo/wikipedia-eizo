'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Searchbar from '@/app/components/Searchbar';
import '../search/page.css';

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        router.push(`/search/${encodeURIComponent(searchQuery)}`);
    };

    return (
        <div className="search-page">
            <h1>Search 場</h1>
            <Searchbar />
        </div>
    );
}