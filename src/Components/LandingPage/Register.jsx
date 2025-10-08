import { HiMail } from "react-icons/hi";
import { BiLockAlt } from "react-icons/bi";
import { AiOutlineMail } from "react-icons/ai";
import { IoMdCall } from "react-icons/io";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import styles from "./Register.module.css";
import { IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import Footer from "../Landing-page Component/Footer";
export default function Register() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    Country: "",
    Grade: "",
    PhoneNumber: "",
    Guardian: "",
    GuardianPhoneNumber: "",
    StateOfOrigin: "",
    Address: "",
    Gender: "",
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCountryChange = (selected) => {
    setForm({ ...form, Country: selected.label });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert(
          "✅ Registration submitted! also check your mail for Admin feedback"
        );
        navigate("/login");
      } else {
        alert("Error submitting registration");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const options = useMemo(() => countryList().getData(), []);

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
        <h1>Register</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Fullname"
            name="FullName"
            value={form.FullName}
            onChange={handleChange}
            className={styles.formtext}
          />
          <input
            type="email"
            placeholder="Email"
            name="Email"
            value={form.Email}
            onChange={handleChange}
            className={styles.formtext}
          />
          <input
            type="number"
            placeholder="Phone Number"
            name="PhoneNumber"
            value={form.PhoneNumber}
            onChange={handleChange}
            className={styles.formtext}
          />

          <div className={styles.dobIn}>
            <label>Date of Birth:</label>
            <input
              type="date"
              placeholder="Date of Birth"
              name="DOfB"
              value={form.DOfB}
              onChange={handleChange}
              max={
                new Date(new Date().setFullYear(new Date().getFullYear() - 15))
                  .toISOString()
                  .split("T")[0]
              } // max = 15 years ago
              min={
                new Date(new Date().setFullYear(new Date().getFullYear() - 60))
                  .toISOString()
                  .split("T")[0]
              } // min = 60 years ago
            />
          </div>

          <input
            type="text"
            placeholder="Grade"
            name="Grade"
            value={form.Grade}
            onChange={handleChange}
            className={styles.formtext}
          />

          <input
            type="text"
            placeholder="Guardian"
            name="Guardian"
            value={form.Guardian}
            onChange={handleChange}
            className={styles.formtext}
          />
          <input
            type="number"
            placeholder="Guardian Phone Number"
            name="GuardianPhoneNumber"
            value={form.GuardianPhoneNumber}
            onChange={handleChange}
            className={styles.formtext}
          />

          <select
            placeholder="Course"
            name="Course"
            value={form.Course}
            onChange={handleChange}
            className={styles.formtext}
          >
            <option value="">Preferred Course</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Networking">Networking</option>
            <option value="Python">Python</option>
            <option value="Software Engineering">
              Software Engineering / FullStack
            </option>
          </select>

          {/* ✅ Searchable Country Select */}
          <div className={styles.selectCountry}>
            <Select
              options={options}
              onChange={handleCountryChange}
              placeholder="Nationality"
              value={options.find((opt) => opt.label === form.Country) || null}
            />
          </div>
          <input
            type="text"
            placeholder="State of Origin"
            name="StateOfOrigin"
            value={form.StateOfOrigin}
            onChange={handleChange}
            className={styles.formtext}
          />
          <input
            type="text"
            placeholder="Address"
            name="Address"
            value={form.Address}
            onChange={handleChange}
            className={styles.formtext}
          />

          <select
            name="Gender"
            value={form.Gender}
            onChange={handleChange}
            className={styles.formtext}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <div className={styles.remember}>
            <input type="checkbox" required />
            <p>I agree to the terms and condition of the school</p>
          </div>

          <button type="submit">Register</button>
        </form>
      </div>
      <Footer />
    </>
  );
}
