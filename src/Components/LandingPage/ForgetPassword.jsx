import { useEffect, useState } from "react";
import { AiOutlineQuestionCircle, AiOutlineMail } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import { HiMail } from "react-icons/hi";
import { IoMdCall, IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ForgetPassword.module.css";
import Footer from "../Landing-page Component/Footer";

export default function ForgetPassword() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
      } else {
        setMessage("Password reset link has been sent to your email!");
        setEmail("");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
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
        <nav
          className={`${styles.mainNav} ${isScrolled ? styles.scrolled : ""}`}
        >
          <div className={styles.logo}>Learner.</div>

          <div
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`${styles.navLinks} ${menuOpen ? styles.show : ""}`}>
            <li>
              <Link to="/">Home</Link>
            </li>

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
        </nav>
      </header>

      <div className={styles.forgotPasswordContainer}>
        <div className={styles.forgotPasswordBox}>
          <div className={styles.iconWrapper}>
            <AiOutlineMail className={styles.mailIcon} />
          </div>

          <h1>Forgot Password?</h1>
          <p className={styles.description}>
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <HiMail className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formtext}
                required
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className={styles.successMessage}>
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className={styles.backToLogin}>
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
