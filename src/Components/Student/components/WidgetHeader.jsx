// import { useEffect, useState } from "react";
// import "../Widget.css";

// const WidgetHeader = ({ onClose, studentId }) => {
//   const studentId = localStorage.getItem("studentId");
//   const [studentName, setStudentName] = useState("Loading...");
//   const [studentImg, setStudentImg] = useState(null);

//   useEffect(() => {
//     if (!studentId) return;

//     fetch(`http://localhost:5000/admin/students/${studentId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setStudentName(data.fullName || "Unknown Student");
//         setStudentImg(data.studentImg || null);
//         setStudentCourse(data.course || "Unknown course");
//       })
//       .catch((err) => {
//         console.error("Error fetching student:", err);
//         setStudentName("Error loading student");
//       });
//   }, [studentId]);
//    function getInitials(name) {
//     if (!name) return "";
//     const parts = name.split(" ");
//     return parts.map(p => p.charAt(0).toUpperCase()).join("");
//   }

  

//   // const initials = student?.initials || "S";
//   // const firstName = students?.FullName?.split(" ")[0] || "Student";

//   return (
//     <div className="widget-header">
//       <div className="header-content">
//         <div className="logo">
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//             <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
//           </svg>
//           <span>Learner</span>
//         </div>
//         <div className="header-actions">
//           <div className="avatar">{initials}</div>
//           <button className="close-btn" onClick={onClose}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <line x1="18" y1="6" x2="6" y2="18"></line>
//               <line x1="6" y1="6" x2="18" y2="18"></line>
//             </svg>
//           </button>
//         </div>
//       </div>
//       <div className="greeting">
//         <h2>Hello {fullName}!</h2>
//         <p>How can we help?</p>
//       </div>
//     </div>
//   );
// };

// export default WidgetHeader;


import { useEffect, useState } from "react";
import "../Widget.css";

const WidgetHeader = ({ onClose, studentId: propStudentId }) => {
  const studentId = propStudentId || localStorage.getItem("studentId");
  const [studentName, setStudentName] = useState("Loading...");
  const [studentImg, setStudentImg] = useState(null);

  useEffect(() => {
    if (!studentId) return;

    fetch(`http://localhost:5000/admin/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentName(data.fullName || "Unknown Student");
        setStudentImg(data.studentImg || null);
      })
      .catch((err) => {
        console.error("Error fetching student:", err);
        setStudentName("Error loading student");
      });
  }, [studentId]);

  function getInitials(name) {
    if (!name) return "S";
    const parts = name.split(" ");
    return parts.map((p) => p.charAt(0).toUpperCase()).join("");
  }

  const initials = getInitials(studentName);

  return (
    <div className="widget-header">
      <div className="header-content">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
          <span>Learner</span>
        </div>
        <div className="header-actions">
          <div className="avatar">{initials}</div>
          <button className="close-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="greeting">
        <h2>Hello {studentName.split(" ")[0]}!</h2>
        <p>How can we help?</p>
      </div>
    </div>
  );
};

export default WidgetHeader;
