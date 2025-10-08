import React from "react";
import { Link } from "react-router-dom"; // ✅ Use this if you’re using React Router
import styles from "./Footer.module.css";
import {
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaPinterestP,
  FaDribbble,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* About Us */}
        <div className={styles.column}>
          <h3>About Us</h3>
          <p>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts.
          </p>

          <h4>Connect</h4>
          <div className={styles.socials}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
            >
              <FaPinterestP />
            </a>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dribbble"
            >
              <FaDribbble />
            </a>
          </div>
        </div>

        {/* Projects */}
        <div className={styles.column}>
          <h3>Projects</h3>
          <ul>
            <li>
              <Link to="/web-design">Web Design</Link>
            </li>
            <li>
              <Link to="/html5">HTML5</Link>
            </li>
            <li>
              <Link to="/css3">CSS3</Link>
            </li>
            <li>
              <Link to="/jquery">jQuery</Link>
            </li>
            <li>
              <Link to="/bootstrap">Bootstrap</Link>
            </li>
          </ul>
        </div>

        {/* Gallery */}
        <div className={styles.column}>
          <h3>Gallery</h3>
          <div className={styles.gallery}>
            {Array.from({ length: 6 }).map((_, i) => (
              <img
                key={i}
                src={`https://themewagon.github.io/learner/images/gal_${
                  i + 1
                }.jpg`}
                alt={`Gallery ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className={styles.column}>
          <h3>Contact</h3>
          <p>
            43 Raymouth Rd. Baltemoer,
            <br /> London 3910
          </p>
          <p>+1 (123) 456-7890</p>
          <p>info@mydomain.com</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} All Rights Reserved. Designed with love
          by{" "}
          <a href="https://untree.co" target="_blank" rel="noopener noreferrer">
            Untree.co
          </a>{" "}
          — Distributed by{" "}
          <a
            href="https://themewagon.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            ThemeWagon
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
