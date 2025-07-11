import React from 'react';

export default function UserProfile({ profile, loading, error }) {
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile.</div>;
  if (!profile) return <div>No profile data found.</div>;

  return (
    <div className="user-profile">
      <h2>Welcome, {profile.displayName || profile.email}</h2>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role || 'student'}</p>
      {/* Add more fields as needed */}
    </div>
  );
} 