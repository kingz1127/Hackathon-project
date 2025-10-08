import React from "react";
import styles from "./Hero.module.css";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <p className={styles.subtitle}>WATCH THE VIDEO</p>
        <h1 className={styles.title}>Education for Tomorrow's Leaders</h1>
        <button className={styles.btn}>Enroll Now</button>
      </div>
    </section>
  );
};

export default Hero;
