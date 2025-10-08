import { useEffect, useState } from "react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import { HiMail } from "react-icons/hi";
import { IoMdCall, IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Footer from "../Landing-page Component/Footer";
export default function Login() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [schoolID, setSchoolID] = useState("");
  const [schoolPassword, setSchoolPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAuthenticating(true);
      const response = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: schoolID.includes("@") ? undefined : schoolID,
          email: schoolID.includes("@") ? schoolID : undefined,
          password: schoolPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
      } else {
        localStorage.setItem("token", data.token);
        if (data.admin) {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("adminId", data.admin.id);
          navigate("/admindashboard");
        } else if (data.teacher) {
          localStorage.setItem("userRole", "teacher");
          localStorage.setItem("teacherId", data.teacher.id);
          localStorage.setItem("teacherName", data.teacher.fullName);
          navigate("/teachdashboard");
        } else if (data.student) {
          localStorage.setItem("userRole", "student");
          localStorage.setItem("studentId", data.studentId);
          setIsAuthenticating(false);
          navigate("/student");
        }
      }
    } catch (err) {
      console.error("Login failed", err);
      setError("Something went wrong. Try again.");
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={styles.header}>
        {/* Top bar */}
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

        {/* Main nav */}
        <nav
          className={`${styles.mainNav} ${isScrolled ? styles.scrolled : ""}`}
        >
          <div className={styles.logo}>Learner.</div>

          {/* Hamburger */}
          <div
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Nav Links */}
          <ul className={`${styles.navLinks} ${menuOpen ? styles.show : ""}`}>
            <li>
              <Link to="/">Home</Link>
            </li>

            {/* Dropdown */}
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
              <Link to="/staff">Our Staff</Link>
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

          <button onClick={() => navigate("/register")}>ENROLL NOW</button>
        </nav>
      </header>
      <div className={styles.login}>
        <h1>Login</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your ID number"
            value={schoolID}
            onChange={(e) => setSchoolID(e.target.value)}
            className={styles.formtext}
          />

          {/* Password with eye toggle */}
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={schoolPassword}
              onChange={(e) => setSchoolPassword(e.target.value)}
              className={styles.formtext}
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <div className={styles.remember}>
            <input type="checkbox" />
            <p>Remember me</p>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit">Login</button>
          <p>{isAuthenticating && "loading..."}</p>
        </form>
      </div>
      <Footer />
    </>
  );
}
