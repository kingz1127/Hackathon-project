import React from "react";
import styles from "./InstructorSection.module.css";
import { FaCheck } from "react-icons/fa";

const InstructorSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textContainer}>
          <h2>Become an Instructor</h2>
          <p>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts. Separated they
            live.
          </p>

          <ul className={styles.list}>
            <li>
              <FaCheck /> Behind the word Mountains.
            </li>
            <li>
              <FaCheck /> Far far away Mountains.
            </li>
            <li>
              <FaCheck /> Large language Ocean.
            </li>
          </ul>

          <button className={styles.button}>Get Started</button>
        </div>

        <div className={styles.imageContainer}>
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
            alt="Instructor"
          />
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
