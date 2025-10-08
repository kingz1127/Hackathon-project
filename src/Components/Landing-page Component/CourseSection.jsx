import React from "react";
import styles from "./CourseSection.module.css";
import { FaStar } from "react-icons/fa";
import { PiBookOpenText } from "react-icons/pi";

const courses = [
  {
    id: 1,
    title: "Education Program Title",
    lessons: 43,
    rating: 4.8,
    price: 87,
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Education Program Title",
    lessons: 43,
    rating: 4.8,
    price: 93,
    img: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Education Program Title",
    lessons: 43,
    rating: 4.8,
    price: 65,
    img: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=800&q=80",
  },
];

const CoursesSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>The Right Course For You</h2>
        <p>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </p>
      </div>

      <div className={styles.cards}>
        {courses.map((course) => (
          <div className={styles.card} key={course.id}>
            <img src={course.img} alt={course.title} className={styles.image} />

            <div className={styles.content}>
              <div className={styles.info}>
                <span>
                  <PiBookOpenText /> {course.lessons} lessons
                </span>
                <span className={styles.rating}>
                  <FaStar /> {course.rating}
                </span>
              </div>

              <h3>{course.title}</h3>
              <p>
                Lorem ipsum dolor sit amet once is consectetur adipisicing elit
                optio.
              </p>

              <div className={styles.footer}>
                <span className={styles.price}>${course.price.toFixed(2)}</span>
                <a href="#">Learn More</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoursesSection;
