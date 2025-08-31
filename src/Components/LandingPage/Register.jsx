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

export default function Register() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    Country: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 2);
    };
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
      const res = await fetch("http://localhost:3000/api/students/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Registration submitted! Waiting for admin approval.");
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
      <div className={styles.regHeader}>
        <div className={styles.div0}>
          <div className={styles.div1}>
            <AiOutlineQuestionCircle />
            <p>Have a questions?</p>
            <IoMdCall />
            <a href="tel:+2349867435673">+2349867435673</a>
            <HiMail />
            <a href="mailto:">info@NiitAdmin.com</a>
          </div>
          <div className={styles.div2}>
            <Link to="/login">
              <BiLockAlt />
              <p>Login</p>
            </Link>
            <Link to="/register">
              <IoMdPerson />
              <p>Register</p>
            </Link>
          </div>
        </div>
        <hr />
        <div className={`${styles.div3} ${scrolled ? styles.scrolled : ""}`}>
          <h2>Learner.</h2>
          <div>
            <p onClick={() => navigate("/")}>Home</p>
            <p>Dropdown</p>
            <p onClick={() => navigate("/ourstaff")}>Our Staff</p>
            <p onClick={() => navigate("/news")}>News</p>
            <p onClick={() => navigate("/gallery")}>Gallery</p>
            <p onClick={() => navigate("/about")}>About</p>
            <p onClick={() => navigate("/contact")}>Contact</p>
          </div>
          <button>ENROLL NOW</button>
        </div>

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
            />
            <input type="number" name="" id="" />
            <input
              type="date"
              placeholder="Date of birth"
              name="DOfB"
              value={form.DOfB}
              onChange={handleChange}
              className={styles.formtext}
            />
            <input
              type="text"
              placeholder="Course"
              name="Course"
              value={form.Course}
              onChange={handleChange}
              className={styles.formtext}
            />
            {/* ✅ Searchable Country Select */}
            <Select
              options={options}
              onChange={handleCountryChange}
              placeholder="Select Country"
              value={options.find((opt) => opt.label === form.Country) || null}
            />
            <div className={styles.remember}>
              <input type="checkbox" />
              <p>I agree to the terms and condition of the school</p>
            </div>

            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </>
  );
}
