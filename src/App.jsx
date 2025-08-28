import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/LandingPage/Home";
import About from "./Components/LandingPage/About";
import OurStaff from "./Components/LandingPage/OurStaff";
import News from "./Components/LandingPage/News";
import Gallery from "./Components/LandingPage/Gallery";
import Contact from "./Components/LandingPage/Contact";
import Login from "./Components/LandingPage/Login";
import Register from "./Components/LandingPage/Register";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import AdminTeacher from "./Components/AdminDashboard/AdminTeacher";
import AdminDashboard1 from "./Components/AdminDashboard/AdminDashboard1";
import AdminStudent from "./Components/AdminDashboard/AdminStudent";
import TeacherDashboard from "./Components/Teacher/TeacherDashboard";

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

        <Route path="/teacherdashboard" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
