import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import AdminDashboard1 from "./Components/AdminDashboard/AdminDashboard1";
import AdminStudent from "./Components/AdminDashboard/AdminStudent";
import AdminTeacher from "./Components/AdminDashboard/AdminTeacher";
import About from "./Components/LandingPage/About";
import Contact from "./Components/LandingPage/Contact";
import Gallery from "./Components/LandingPage/Gallery";
import Home from "./Components/LandingPage/Home";
import Login from "./Components/LandingPage/Login";
import News from "./Components/LandingPage/News";
import OurStaff from "./Components/LandingPage/OurStaff";
import Register from "./Components/LandingPage/Register";
import Announcements from "./Components/Teacher/Announcements";
import Attendance from "./Components/Teacher/Attendance";
import MyClasses from "./Components/Teacher/MyClasses";
import MyProfile from "./Components/Teacher/Profile";
import Resources from "./Components/Teacher/Resources";
import Settings from "./Components/Teacher/Settings";
import Student from "./Components/Teacher/Student";
import TeacherDashboard from "./Components/Teacher/TeacherDashboard";
import TeacherDashboardLayout from "./Components/Teacher/TeacherDashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This is the Landing Page Route */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/ourstaff" element={<OurStaff />} />
        <Route path="/news" element={<News />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Other routes stay below */}

        {/* Admin page routes */}

        <Route path="/admindashboard" element={<AdminDashboard />}>
          <Route path="admindashboard1" element={<AdminDashboard1 />} />
          <Route path="adminstudent" element={<AdminStudent />} />

          <Route path="adminteacher" element={<AdminTeacher />} />
          <Route path="*" element={<p>Invalid route (404 Not Found)!!!</p>} />
        </Route>

        {/* Teacher page routes */}
          <Route path= "/" element={<TeacherDashboardLayout/>}>
      <Route path= "teachdashboard" element={<TeacherDashboard/>}/>
       <Route path= "teachclasses" element={<MyClasses/>}/>
       <Route path= "teachprofile" element={<MyProfile/>}/>
        <Route path= "teachattendance" element={<Attendance/>}/>
        <Route path= "teachstudent" element={<Student/>}/>
        <Route path= "teachannouncements" element={<Announcements/>}/>
        <Route path= "teachresources" element={<Resources/>}/>
        <Route path= "teachsettings" element={<Settings/>}/>
      </Route>

        {/* Student page routes */}
        <Route path="/student" element={<Student />} />
      </Routes>
    </BrowserRouter>
  );
}
