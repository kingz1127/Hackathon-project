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
    Grade: "",
    PhoneNumber: "",
    Guardian: "",
    GuardianPhoneNumber: "",
    StateOfOrigin: "",
    Address: "",
    Gender: "",
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
          <button onClick={() => navigate("/register")}>ENROLL NOW</button>
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
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 15)
                  )
                    .toISOString()
                    .split("T")[0]
                } // max = 15 years ago
                min={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 60)
                  )
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
              <option value="AI & Machine Learning">
                AI & Machine Learning
              </option>
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
                value={
                  options.find((opt) => opt.label === form.Country) || null
                }
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
      </div>
    </>
  );
}
