import React, { useState, useEffect } from "react";
import styles from "./Navigation.module.css";

const Navigation = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`${styles.siteNav} ${isSticky ? styles.sticky : ""}`}>
      <div className={styles.container}>
        <div className={styles.siteNavigation}>
          <a href="/" className={styles.logo}>
            Learner<span className={styles.logoDot}>.</span>
          </a>
          <ul className={styles.siteMenu}>
            <li className={styles.active}>
              <a href="/">Home</a>
            </li>
            {/* ...Add other menu items here... */}
            <li>
              <a href="/ourstaff">Our Staff</a>
            </li>
            <li>
              <a href="/news">News</a>
            </li>
            <li>
              <a href="/gallery">Gallery</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
          <a href="#" className={styles.btnBook}>
            Enroll Now
          </a>
        </div>
      </div>
      <section className={styles.hero}>
            <div className={styles.overlay}></div>
      
            <div className={styles.content}>
              <p className={styles.subtitle}>WATCH THE VIDEO</p>
              <h1 className={styles.title}>Education for Tomorrow's Leaders</h1>
              <button className={styles.btn}>Enroll Now</button>
            </div>
          </section>
    </div>
  );
};
export default Navigation;
