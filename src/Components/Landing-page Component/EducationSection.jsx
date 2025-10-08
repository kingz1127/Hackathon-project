import React from "react";
import styles from "./EducationSection.module.css";
import {
  FaMusic,
  FaCalculator,
  FaBookOpen,
  FaBook,
  FaHistory,
  FaHeadphones,
} from "react-icons/fa";

const educationItems = [
  { id: 1, icon: <FaMusic />, title: "Music Class" },
  { id: 2, icon: <FaCalculator />, title: "Math Class" },
  { id: 3, icon: <FaBookOpen />, title: "English Class" },
  { id: 4, icon: <FaBook />, title: "Reading for Kids" },
  { id: 5, icon: <FaHistory />, title: "History Class" },
  { id: 6, icon: <FaHeadphones />, title: "Music" },
];

const EducationSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>We Have Best Education</h2>
        <p>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </p>
      </div>

      <div className={styles.grid}>
        {educationItems.map((item) => (
          <div className={styles.card} key={item.id}>
            <div className={styles.icon}>{item.icon}</div>
            <h3>{item.title}</h3>
            <p>
              Far far away, behind the word mountains, far from the countries
              Vokalia and Consonantia, there live the blind texts.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EducationSection;
