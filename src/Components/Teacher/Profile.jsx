// src/pages/MyProfile.jsx
import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // get teacherId saved after login
    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId) {
      console.error("No teacherId found in localStorage. User not logged in?");
      setLoading(false);
      return;
    }

    // fetch teacher info from backend
    fetch(`http://localhost:5000/admin/teachers/${teacherId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teacher profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching teacher profile:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile found</p>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-section">
        <h3>Personal Information</h3>
        <div className="profile-info">
          <p><strong>Name:</strong> {profile.FullName}</p>
          <p><strong>Email:</strong> {profile.Email}</p>
          <p><strong>Role:</strong> {profile.Course + " Teacher"|| "Teacher"}</p>
          <p><strong>Country:</strong> {profile.Country}</p>
          <p><strong>Date-of-Birth:</strong> {profile.DOfB || "Not provided"}</p>
          <p><strong>Date Joined:</strong> {profile.DateJoined}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Assigned Courses & Grades</h3>
        {profile.courses && profile.courses.length > 0 ? (
          <ul className="courses-list">
            {profile.courses.map((c, index) => (
              <li key={index}>
                <strong>{c.name}</strong> — {c.grade}
              </li>
            ))}
          </ul>
        ) : (
          <p>No courses assigned yet.</p>
        )}
      </div>
    </div>
  );
}
