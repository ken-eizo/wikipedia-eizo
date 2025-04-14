"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import '../page.css';

export default function News() {
    return (
        <div className="news">
            <h1>最新のNews</h1>
        </div>
    );
}

