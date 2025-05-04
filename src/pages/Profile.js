import React, { useState, useEffect } from 'react';
import './Profile.css';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase.js';

const db = getFirestore(app);
const auth = getAuth();

export default function Profile() {
  const [profileData, setProfileData] = useState({
    username: '',
    birthdate: '',
    bestFriend: '',
    favoriteSong: '',
    favoriteColor: '',
    hobby: '',
    dreamJob: ''
  });

  const [editMode, setEditMode] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, profileData, { merge: true });
    setEditMode(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-box">
        <h1 className="profile-title">🎉 Welcome, {profileData.username || 'Friend'}!</h1>
        <p className="profile-sub">Here’s your personalized corner:</p>

        {editMode ? (
          <div className="profile-edit">
            <label>Username:
              <input type="text" name="username" value={profileData.username} onChange={handleChange} />
            </label>
            <label>Birthdate:
              <input type="date" name="birthdate" value={profileData.birthdate} onChange={handleChange} />
            </label>
            <label>Best Friend:
              <input type="text" name="bestFriend" value={profileData.bestFriend} onChange={handleChange} />
            </label>
            <label>Favorite Song:
              <input type="text" name="favoriteSong" value={profileData.favoriteSong} onChange={handleChange} />
            </label>
            <label>Favorite Color:
              <input type="text" name="favoriteColor" value={profileData.favoriteColor} onChange={handleChange} />
            </label>
            <label>Hobby:
              <input type="text" name="hobby" value={profileData.hobby} onChange={handleChange} />
            </label>
            <label>Dream Job:
              <input type="text" name="dreamJob" value={profileData.dreamJob} onChange={handleChange} />
            </label>
            <button onClick={handleSave}>Save</button>
          </div>
        ) : (
          <div className="profile-info">
            <p><strong>👤 Username:</strong> {profileData.username || 'Not set'}</p>
            <p><strong>🎂 Birthdate:</strong> {profileData.birthdate || 'Not set'}</p>
            <p><strong>👯 Best Friend:</strong> {profileData.bestFriend || 'Not set'}</p>
            <p><strong>🎵 Favorite Song:</strong> {profileData.favoriteSong || 'Not set'}</p>
            <p><strong>🎨 Favorite Color:</strong> {profileData.favoriteColor || 'Not set'}</p>
            <p><strong>🏓 Hobby:</strong> {profileData.hobby || 'Not set'}</p>
            <p><strong>💼 Dream Job:</strong> {profileData.dreamJob || 'Not set'}</p>
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}
