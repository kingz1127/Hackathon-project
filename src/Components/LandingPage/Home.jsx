import { useEffect, useState } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import { HiMail } from "react-icons/hi";
import { IoMdCall, IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import AboutUs from "../Landing-page Component/AboutUs";
import BrowseCategory from "../Landing-page Component/BrowseCategory";
import CourseSection from "../Landing-page Component/CourseSection";
import EducationSection from "../Landing-page Component/EducationSection";
import Footer from "../Landing-page Component/Footer";
import InstructorSection from "../Landing-page Component/InstructorSection";
import NewsSection from "../Landing-page Component/NewsSection";
import Pricing from "../Landing-page Component/Pricing";
import Testimonials from "../Landing-page Component/Testimonials";
import WhyChooseUs from "../Landing-page Component/WhyChooseUs";
import styles from "./Home.module.css";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={styles.header}>
        {/* ============ 🟦 Top Bar ============ */}
        <div className={styles.topBar}>
          <div className={styles.contactInfo}>
            <span>
              <AiOutlineQuestionCircle /> Have a question?
            </span>
            <span>
              <IoMdCall /> <a href="tel:+2349867435673">+2349867435673</a>
            </span>
            <span>
              <HiMail />{" "}
              <a href="mailto:info@NiitAdmin.com">info@NiitAdmin.com</a>
            </span>
          </div>

          <div className={styles.authLinks}>
            <Link to="/login">
              <BiLockAlt /> Login
            </Link>
            <Link to="/register">
              <IoMdPerson /> Register
            </Link>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* ============ 🟨 Main Navigation ============ */}
        <nav
          className={`${styles.mainNav} ${isScrolled ? styles.scrolled : ""}`}
        >
          {/* Logo */}
          <div className={styles.logo}>Learner.</div>

          {/* Hamburger Menu */}
          <div
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Navigation Links */}
          <ul className={`${styles.navLinks} ${menuOpen ? styles.show : ""}`}>
            <li>
              <Link to="/">Home</Link>
            </li>

            {/* Dropdown Menu */}
            <li
              className={`${styles.dropdown} ${
                dropdownOpen ? styles.open : "" 
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Link to="#">Dropdown</Link>

              <ul className={styles.dropdownMenu}>
                <li>
                  <Link to="/elements">Elements</Link>
                </li>
                <li>
                  <Link to="/menu2">Menu 2</Link>
                  <ul className={styles.dropdownMenu2}>
                    <li>
                      <Link to="/submenu1">Submenu 1</Link>
                    </li>
                    <li>
                      <Link to="/submenu2">Submenu 2</Link>
                    </li>
                    <li>
                      <Link to="/submenu3">Submenu 3</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/menu3">Menu 3</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/ourstaff">Our Staff</Link>
            </li>
            <li>
              <Link to="/news">News</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>

          {/* Enroll Button */}
          <button onClick={() => navigate("/register")}>ENROLL NOW</button>
        </nav>

        {/* ============ 🟩 Hero Section ============ */}
        <div className={styles.spacer}>
          <p>Watch the video</p>
          <h2>Learn Anywhere, Anytime</h2>
          <button onClick={() => navigate("/register")}>Explore Courses</button>
        </div>
      </header>

      <BrowseCategory />
      <InstructorSection />
      <EducationSection />
      <CourseSection />
      <AboutUs />
      <NewsSection />
      <Pricing />
      <Testimonials />
      <WhyChooseUs />
      <Footer />
    </>
  );
}
