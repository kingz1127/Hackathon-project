import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineQuestionCircle } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import { HiMail } from "react-icons/hi";
import { IoMdCall, IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

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
    const handleScroll = () => setScrolled(window.scrollY > 2);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Header */}
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
      </div>

      {/* Login Form */}
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
          {/* <button type="submit">
            Login
          </button> */}
          <p>{isAuthenticating && "loading..."}</p>
        </form>
      </div>
    </>
  );
}