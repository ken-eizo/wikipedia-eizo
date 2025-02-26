"use client";

import './Header.css'
import Link from 'next/link';
import {useAuthState} from 'react-firebase-hooks/auth';
import { signInWithPopup } from "firebase/auth";
import React, { useState, useEffect, useRef } from 'react';
import { auth, provider } from "../firebase";


export default function Header() {
    const [user] = useAuthState(auth);

    return (
        <nav className="header">
            <div className='links'>
                    <Link href="/">Wikipedia</Link>
                    <Link href="/post">Post</Link>
                    <Link href="/search">Search</Link>
                    <Link href="/Forum">Forum</Link>
            </div>
            <div className="auth-buttons">
                { user ? (
                    <div className="user">
                        <UserInfo />
                    </div>
                ) : (
                    <div className='user'>
                    <SignInButton />
                    </div>
                )}
            </div>
        </nav> 
    );
}

//サインイン
function SignInButton() {
    const SiginInWithGoogle = () => {
        //firebaseを使ってグーグルでサインイン
        signInWithPopup(auth, provider);
};
    return (
        <button className="white-button" onClick={SiginInWithGoogle}>
            サインイン
        </button>
    );
}

function UserInfo() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null); // ドロップダウン要素への参照

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSignOut = () => {
        auth.signOut();
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // ドロップダウンが開いていて、クリックされた要素がドロップダウンの内部でなければ閉じる
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        // ドキュメント全体にクリックイベントリスナーを追加
        document.addEventListener('mousedown', handleClickOutside);

        // クリーンアップ関数 (コンポーネントがアンマウントされたときにイベントリスナーを削除)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]); // isDropdownOpen が変更されたときだけ useEffect を再実行

    return (
        <div className="userinfo" ref={dropdownRef}> {/* ref を設定 */}
            <img
                className="userimg"
                src={auth.currentUser.photoURL}
                alt={auth.currentUser.displayName}
                onClick={toggleDropdown}
            />
            {isDropdownOpen && (
                <div className="dropdown-content">
                    <button className='dropdown-button'>プロフィール</button>
                    <button className='dropdown-button'>設定</button>
                    <button className='dropdown-button' onClick={handleSignOut}>サインアウト</button>
                </div>
            )}
        </div>
    );
}