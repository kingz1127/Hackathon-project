import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import { HiMail } from "react-icons/hi";
import {
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaPinterestP,
  FaDribbble,
  FaCheck,
  FaChevronDown,
} from "react-icons/fa";
import { IoMdCall, IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// <<<<<<< HEAD
// <<<<<<< HEAD
import Register from "./Register";
// =======
import styles from "./About.module.css";
// >>>>>>> 9a857a6 (update 11:52pm)
// =======

// import staff_1 from "../../assets/staff_1.jpg";
// import staff_2 from "../../assets/staff_2.jpg";
// import staff_3 from "./assets/staff_3.jpg";
// >>>>>>> 1adaaecfa738f3b1a895e02b003087c40016cf59

export default function About() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null); // 👈 added
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 2);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services = [
    { title: "Music Class", icon: "🎵" },
    { title: "Math Class", icon: "➗" },
    { title: "English Class", icon: "📘" },
    { title: "Reading for Kids", icon: "📖" },
    { title: "History Class", icon: "🏛️" },
    { title: "Music", icon: "🎶" },
  ];

  const teachers = [
    {
      name: "Mina Collins",
      subject: "Teacher in Math",
      description:
        "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      // image: staff_1,
    },
    {
      name: "Anderson Matthew",
      subject: "Teacher in Music",
      description:
        "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      // image: staff_2,
    },
    {
      name: "Cynthia Misso",
      subject: "Teacher in English",
      description:
        "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      // image: staff_3,
    },
  ];

  const features = [
    {
      title: "Good Teachers and Staffs",
      description:
        "Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.",
    },
    {
      title: "Modern Facilities",
      description:
        "We provide world-class facilities including libraries, labs, and digital classrooms.",
    },
    {
      title: "Quality Curriculum",
      description:
        "Our curriculum is designed to meet global standards while nurturing creativity.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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
          <div className={menuOpen ? styles.active : ""}>
            <p
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
            >
              Home
            </p>
            <p onClick={() => setMenuOpen(false)}>Dropdown</p>
            <p
              onClick={() => {
                navigate("/ourstaff");
                setMenuOpen(false);
              }}
            >
              Our Staff
            </p>
            <p
              onClick={() => {
                navigate("/news");
                setMenuOpen(false);
              }}
            >
              News
            </p>
            <p
              onClick={() => {
                navigate("/gallery");
                setMenuOpen(false);
              }}
            >
              Gallery
            </p>
            <p
              onClick={() => {
                navigate("/about");
                setMenuOpen(false);
              }}
            >
              About
            </p>
            <p
              onClick={() => {
                navigate("/contact");
                setMenuOpen(false);
              }}
            >
              Contact
            </p>
          </div>
          <button className={styles.io}>ENROLL NOW</button>
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Hero */}
        <div className={styles.introOverlay}>
          <h1>About Us</h1>
          <p>
            Another free template by Untree.co. Far far away, behind the word
            mountains, far from the countries Vokalia and Consonantia...
          </p>
          <button
            onClick={() => navigate("/courses")}
            className={styles.ctaBtn}
          >
            Explore Courses
          </button>
        </div>
      </div>

{/* <<<<<<< HEAD */}
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
{/* ======= */}
      {/* ---------- BECOME AN INSTRUCTOR ---------- */}
      <section className={styles.instructorSection}>
        <div className={styles.content}>
          {/* Left Side (Text) */}
          <div className={styles.textBlock}>
            <h2>Become an Instructor</h2>
            <p>
              Far far away, behind the word mountains, far from the countries
              Vokalia and Consonantia, there live the blind texts. Separated
              they live.
            </p>
            <ul>
              <li>
                <FaCheck className={styles.icon} /> Behind the word Mountains.
              </li>
              <li>
                <FaCheck className={styles.icon} /> Far far away Mountains.
              </li>
              <li>
                <FaCheck className={styles.icon} /> Large language Ocean.
              </li>
            </ul>
            <button className={styles.ctaBtn}>Get Started</button>
          </div>

          {/* Right Side (Image) */}
          <div className={styles.imageBlock}>
            <img
              src={
                "https://themewagon.github.io/learner/images/teacher-min.jpg"
              }
              alt="Instructor"
            />
          </div>
        </div>
      </section>

      {/* ---------- OUR STAFF ---------- */}
      <section className={styles.staffSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Staff</h2>
          <div className={styles.teachersGrid}>
            {teachers.map((teacher, index) => (
              <div key={index} className={styles.teacherCard}>
                <div className={styles.imageContainer}>
                  {teacher.image && (
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className={styles.teacherImage}
                    />
                  )}
                </div>
                <h3 className={styles.teacherName}>{teacher.name}</h3>
                <p className={styles.teacherSubject}>{teacher.subject}</p>
                <p className={styles.teacherDescription}>
                  {teacher.description}
                </p>
                <div className={styles.socials}>
                  <FaInstagram />
                  <FaTwitter />
                  <FaFacebookF />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.header}>
        <h2>We Have Best Education</h2>
        <p>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </p>
      </section>

      {/* Services Grid */}
      <section className={styles.grid}>
        {services.map((service, index) => (
          <div key={index} className={styles.card}>
            <span className={styles.icon}>{service.icon}</span>
            <h3>{service.title}</h3>
            <p>
              Far far away, behind the word mountains, far from the countries
              Vokalia and Consonantia, there live the blind texts.
            </p>
          </div>
        ))}
      </section>

      {/* Why Choose Us Section */}
      <section className={styles.whyChoose}>
        <div className={styles.imageWrapper}>
          <img
            src="https://themewagon.github.io/learner/images/img-school-5-min.jpg"
            alt="Child studying"
          />
        </div>
        <div className={styles.textWrapper}>
          <h2>Why Choose Us</h2>
          <p>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts.
          </p>

          <div className={styles.accordion}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${styles.featureBox} ${
                  activeIndex === index ? styles.active : ""
                }`}
                onClick={() => toggleAccordion(index)}
              >
                <div className={styles.featureHeader}>
                  <h4>{feature.title}</h4>
                  <FaChevronDown
                    className={`${styles.chevron} ${
                      activeIndex === index ? styles.rotate : ""
                    }`}
                  />
                </div>
                <div
                  className={`${styles.featureContent} ${
                    activeIndex === index ? styles.show : ""
                  }`}
                >
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          {/* About */}
          <div>
            <h3>About Us</h3>
            <p>
              Far far away, behind the word mountains, far from the countries
              Vokalia and Consonantia...
            </p>
            <h3>Connect</h3>
            <div className={styles.socialIcons}>
              <FaInstagram />
              <FaTwitter />
              <FaFacebookF />
              <FaLinkedinIn />
              <FaPinterestP />
              <FaDribbble />
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3>Projects</h3>
            <ul>
              <li>Web Design</li>
              <li>HTML5</li>
              <li>CSS3</li>
              <li>jQuery</li>
              <li>Bootstrap</li>
            </ul>
          </div>

          {/* Gallery */}
          <div>
            <h3>Gallery</h3>
            <div className={styles.gallery}>
              {["1", "2", "3", "4", "5", "6"].map((num) => (
                <img
                  key={num}
                  src={`https://themewagon.github.io/learner/images/gal_${num}.jpg`}
                  alt={`gallery-${num}`}
                />
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3>Contact</h3>
            <p>43 Raymouth Rd. Baltemoer, London 3910</p>
            <p>+1(123)-456-7890</p>
            <p>+1(123)-456-7890</p>
            <p>info@mydomain.com</p>
          </div>
        </div>

        <div className={styles.copyright}>
          Copyright ©2025. All Rights Reserved. — Designed with love by
          <span> Untree.co </span> Distributed by <span> ThemeWagon</span>
        </div>
      </footer>
{/* >>>>>>> 1adaaecfa738f3b1a895e02b003087c40016cf59 */}
    </>
  );
}
