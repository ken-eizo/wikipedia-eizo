"use client";

import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, provider } from "../firebase";


export default function SiginInButton() {
    const SiginInWithGoogle = () => {
        //firebaseを使ってグーグルでサインイン
        signInWithPopup(auth, provider);
};
    return (
        <button onClick={SiginInWithGoogle}>
            Googleでログイン
        </button>
    );
}