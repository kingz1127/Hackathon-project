//   import { useState } from "react";
// import About from "../LandingPage/About.jsx"; // Import your existing landing page
// import Sidebar from "./Sidebar.jsx";
// import Assignments from "./StudentViews/Assignments.jsx";
// import Attendance from "./StudentViews/Attendance.jsx";
// import Courses from "./StudentViews/Courses.jsx";
// import Dashboard from "./StudentViews/Dashboard.jsx";
// import Grades from "./StudentViews/Grades.jsx";
// import Resources from "./StudentViews/Resources.jsx";
// import Schedule from "./StudentViews/Schedule.jsx";
// import Settings from "./StudentViews/Settings.jsx";

// const views = {
//   Dashboard,
//   Courses,
//   Assignments,
//   Schedule,
//   Grades,
//   Attendance,
//   Resources,
//   Settings,
//   Landing: About, 
// };

// export default function StudentDashboard() {
//   const [active, setActive] = useState("Dashboard");
//   const loggedInName = "John";
  
//   const renderActiveComponent = () => {
//     if (active === "Dashboard") {
//       return <Dashboard studentName={loggedInName} setActive={setActive} />;
//     }
    
//     if (active === "Landing") {
//       return <About setActive={setActive} />; // Use your About component
//     }
    
//     // For Settings, pass setActive if needed
//     if (active === "Settings") {
//       return <Settings setActive={setActive} />;
//     }
    
//     const Component = views[active];
//     return Component ? <Component setActive={setActive} /> : <Dashboard studentName={loggedInName} setActive={setActive} />;
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       {/* Hide sidebar when on Landing page */}
//       {active !== "Landing" && <Sidebar active={active} setActive={setActive} />}
      
//       <div
//         style={{
//           flex: 1,
//           marginLeft: active !== "Landing" ? "21rem" : "0", // No margin for Landing page
//           padding: active !== "Landing" ? "2rem" : "0", // No padding for Landing page
//           overflowY: "auto",
//         }}
//       >
//         {renderActiveComponent()}
//       </div>
//     </div>
//   );
// }

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  return (
    <div className="student-dashboard">
      <Sidebar />
      <div className="student-main">
        <Outlet />
      </div>
    </div>
  );
}
