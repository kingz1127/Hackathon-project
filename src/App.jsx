import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/LandingPage/Home";
import About from "./Components/LandingPage/About";
import OurStaff from "./Components/LandingPage/OurStaff";
import News from "./Components/LandingPage/News";
import Gallery from "./Components/LandingPage/Gallery";
import Contact from "./Components/LandingPage/Contact";
import Login from "./Components/LandingPage/Login";
import Register from "./Components/LandingPage/Register";

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
      </Routes>
    </BrowserRouter>
  );
}
