import React from "react";
import styles from "./NewsPage.module.css";

const newsItems = [
  {
    title: "Education for Tomorrow’s Leaders",
    date: "June 22, 2020",
    author: "Untreno.co",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: "https://themewagon.github.io/learner/images/img-school-4-min.jpg",
  },
  {
    title: "Enroll Your Kids This Summer to get 30% off",
    date: "June 22, 2020",
    author: "Untreno.co",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: "https://themewagon.github.io/learner/images/img-school-3-min.jpg",
  },
  {
    title: "Education for Tomorrow’s Leaders",
    date: "June 22, 2020",
    author: "Untreno.co",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: "https://themewagon.github.io/learner/images/img-school-2-min.jpg",
  },
  {
    title: "Enroll Your Kids This Summer to get 30% off",
    date: "June 22, 2020",
    author: "Untreno.co",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: "https://themewagon.github.io/learner/images/img-school-1-min.jpg",
  },
  {
    title: "Education for Tomorrow’s Leaders",
    date: "June 22, 2020",
    author: "Untreno.co",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: "https://themewagon.github.io/learner/images/img-school-5-min.jpg",
  },
  {
    title: "Enroll Your Kids This Summer to get 30% off",
    date: "June 22, 2020",
    author: "Untreno.co",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: "https://themewagon.github.io/learner/images/img-school-6-min.jpg",
  },
];

const NewsPage = () => {
  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Our News</h2>

        <div className={styles.grid}>
          {newsItems.map((item, index) => (
            <div className={styles.card} key={index}>
              <img src={item.img} alt={item.title} className={styles.image} />
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.meta}>
                  <span>{item.date}</span> • <span>{item.author}</span>
                </p>
                <p className={styles.desc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          <button className={styles.pageBtn}>1</button>
          <button className={`${styles.pageBtn} ${styles.active}`}>2</button>
          <button className={styles.pageBtn}>3</button>
          <button className={styles.pageBtn}>4</button>
        </div>
      </div>
    </section>
  );
};

export default NewsPage;
