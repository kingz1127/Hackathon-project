// // src/pages/MyProfile.jsx
// import { useState } from "react";
// import "../styles/teacher.css";

// export default function MyProfile() {
//   // Dummy data (later you can fetch from backend)
//   const [profile, setProfile] = useState({
//     name: "Mr. Christopher",
//     role: "React/Spring Boot Teacher",
//     email: "christopher@example.com",
//     phone: "+234 901 234 5678",
//   });

//   const [editing, setEditing] = useState(false);

//   const [courses] = useState([
//     { id: 1, name: "ReactJS Fundamentals", grade: "Grade 10" },
//     { id: 2, name: "Spring Boot Advanced", grade: "Grade 11" },
//     { id: 3, name: "Fullstack Capstone Project", grade: "Grade 12" },
//   ]);

//   const handleChange = (e) => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//   const handleSave = () => {
//     setEditing(false);
//     // later connect to API here
//     alert("Profile updated!");
//   };

//   return (
//     <div className="profile-page">
//       <h2>My Profile</h2>

//       <div className="profile-section">
//         <h3>Personal Information</h3>
//         {editing ? (
//           <div className="profile-form">
//             <label>
//               Full Name:
//               <input
//                 type="text"
//                 name="name"
//                 value={profile.name}
//                 onChange={handleChange}
//               />
//             </label>
//             <label>
//               Role:
//               <input
//                 type="text"
//                 name="role"
//                 value={profile.role}
//                 onChange={handleChange}
//               />
//             </label>
//             <label>
//               Email:
//               <input
//                 type="email"
//                 name="email"
//                 value={profile.email}
//                 onChange={handleChange}
//               />
//             </label>
//             <label>
//               Phone:
//               <input
//                 type="text"
//                 name="phone"
//                 value={profile.phone}
//                 onChange={handleChange}
//               />
//             </label>
//             <button onClick={handleSave}>Save</button>
//             <button onClick={() => setEditing(false)}>Cancel</button>
//           </div>
//         ) : (
//           <div className="profile-info">
//             <p><strong>Name:</strong> {profile.name}</p>
//             <p><strong>Role:</strong> {profile.role}</p>
//             <p><strong>Email:</strong> {profile.email}</p>
//             <p><strong>Phone:</strong> {profile.phone}</p>
//             <button onClick={() => setEditing(true)}>Edit Info</button>
//           </div>
//         )}
//       </div>

//       <div className="profile-section">
//         <h3>Assigned Courses & Grades</h3>
//         <ul className="courses-list">
//           {courses.map((c) => (
//             <li key={c.id}>
//               <strong>{c.name}</strong> — {c.grade}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import "./Teacher.css";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Replace with a real teacher _id from your DB
    fetch("http://localhost:5000/api/teachers/64b2e9f12345abcd6789ef01")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-section">
        <h3>Personal Information</h3>
        <div className="profile-info">
          <p><strong>Name:</strong> {profile.fullName}</p>
          <p><strong>Role:</strong> {profile.course}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Date Joined:</strong> {profile.dateJoined}</p>
        </div>
      </div>
    </div>
  );
}
