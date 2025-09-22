import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import { HiMail } from "react-icons/hi";
import { IoMdCall, IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// <<<<<<< HEAD
import Register from "./Register";
// =======
import styles from "./About.module.css";
// >>>>>>> 9a857a6 (update 11:52pm)

export default function About() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 2) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ---------- HEADER / NAVBAR ---------- */}
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

      {/* ---------- BECOME AN INSTRUCTOR SECTION ---------- */}
      <section className={styles.instructorContainer}>
        {/* Left Content */}
        <div className={styles.instructorContent}>
          <h2 className={styles.instructorTitle}>Become an Instructor</h2>
          <p className={styles.instructorDescription}>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts. Separated they
            live.
          </p>

          <ul className={styles.instructorList}>
            <li>✔ Behind the word Mountains.</li>
            <li>✔ Far far away Mountains.</li>
            <li>✔ Large language Ocean.</li>
          </ul>

          <button className={styles.instructorButton}>Get Started</button>
        </div>

        {/* Right Image */}
        <div className={styles.instructorImageWrapper}>
          <img
            src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Instructor"
            className={styles.instructorImage}
          />
        </div>
      </section>
    </>
  );
}
