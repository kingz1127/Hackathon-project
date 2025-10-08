import React from "react";
import styles from "./BrowseCategory.module.css";
import {
  FaFlask,
  FaBriefcase,
  FaCalculator,
  FaPencilAlt,
  FaMusic,
  FaChartPie,
  FaCamera,
  FaPencilRuler,
} from "react-icons/fa";

const categories = [
  { icon: <FaFlask />, title: "Science", courses: "1,391 courses" },
  { icon: <FaBriefcase />, title: "Business", courses: "3,234 courses" },
  {
    icon: <FaCalculator />,
    title: "Finance Accounting",
    courses: "931 courses",
  },
  { icon: <FaPencilAlt />, title: "Design", courses: "7,291 courses" },
  { icon: <FaMusic />, title: "Music", courses: "9,114 courses" },
  { icon: <FaChartPie />, title: "Marketing", courses: "2,391 courses" },
  { icon: <FaCamera />, title: "Photography", courses: "7,991 courses" },
  { icon: <FaPencilRuler />, title: "Animation", courses: "6,491 courses" },
];

const BrowseCategory = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Browse Top Category</h2>

        <div className={styles.grid}>
          {categories.map((cat, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>{cat.icon}</div>
              <h3>{cat.title}</h3>
              <p>{cat.courses}</p>
            </div>
          ))}
        </div>

        <p className={styles.footerText}>
          We have more category here.{" "}
          <a href="#" className={styles.link}>
            Browse all
          </a>
        </p>
      </div>
    </section>
  );
};

export default BrowseCategory;
