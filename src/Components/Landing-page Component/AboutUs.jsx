import React from "react";
import styles from "./AboutUs.module.css";

const AboutUs = () => {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.heading}>About Us</h2>
          <p className={styles.text}>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts. Separated they
            live in Bookmarksgrove right at the coast of the Semantics, a large
            language ocean.
          </p>

          <ul className={styles.list}>
            <li>Separated they live</li>
            <li>Bookmarksgrove right at the coast</li>
            <li>large language ocean</li>
          </ul>

          <div className={styles.stats}>
            <div>
              <h3>12,023+</h3>
              <p>No. Students</p>
            </div>
            <div>
              <h3>49</h3>
              <p>No. Teachers</p>
            </div>
            <div>
              <h3>12</h3>
              <p>No. Awards</p>
            </div>
          </div>

          <div className={styles.buttons}>
            <button className={styles.primaryBtn}>Admission</button>
            <button className={styles.secondaryBtn}>Learn More</button>
          </div>
        </div>

        <div className={styles.imageWrapper}>
          <div className={styles.bgBox}></div>
          <img
            src="https://images.pexels.com/photos/4144222/pexels-photo-4144222.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="About Us"
            className={styles.image}
          />
          <div className={styles.playIcon}>▶</div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
