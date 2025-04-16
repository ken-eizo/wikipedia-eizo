"use client";

import './Header.css'
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { signInWithPopup } from "firebase/auth";
import React, { useState, useEffect, useRef } from 'react';
import { auth, provider } from "../firebase";
import { useRouter } from 'next/navigation';  // navigationからインポート

export default function Header() {
    return (
        <nav className="header">
            <div className='HeaderGroup'>
            <div className='links'>
                    <Link href="/">Wikipedia</Link>
                    <Link href="/post">Post</Link>
                    <Link href="/search">Search</Link>
                    <Link href="/Forum">Forum</Link>
                    <Link href="/news">News</Link>
            </div>
            <div className="auth-buttons">
                <AuthInfo />
            </div>
            </div>
        </nav> 
    );
}

const AuthInfo = dynamic(
    // 非同期関数を使う
    async () => {
        // React Firebase Hooks をここでインポート
        const { useAuthState } = await import('react-firebase-hooks/auth');
        return function AuthInfo() {
            const [user] = useAuthState(auth);
            return user ? (
                    <div className="user">
                        <UserInfo />
                    </div>
                ) : (
                    <div className='user'>
                        <SignInButton />
                    </div>
                );
        }
    }, { ssr: false }
);

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
    const router = useRouter();  // next/navigationのuseRouter

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
                    <button 
                        className='dropdown-button' 
                        onClick={() => {
                            router.push('/profile');
                            setIsDropdownOpen(false);
                        }}
                    >
                        プロフィール
                    </button>
                    <button className='dropdown-button'>設定</button>
                    <button className='dropdown-button' onClick={handleSignOut}>サインアウト</button>
                </div>
            )}
        </div>
    );
}