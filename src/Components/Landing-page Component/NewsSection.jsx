import React from "react";
import styles from "./NewsSection.module.css";

const NewsSection = () => {
  const newsData = [
    {
      id: 1,
      title: "Education for Tomorrow's Leaders",
      date: "June 22, 2020",
      author: "Admin",
      desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      img: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
      link: "#",
    },
    {
      id: 2,
      title: "Enroll Your Kids This Summer to get 30% off",
      date: "June 22, 2020",
      author: "Admin",
      desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
      link: "#",
    },
  ];

  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        <h2 className={styles.heading}>School News</h2>
        <p className={styles.subheading}>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </p>

        <div className={styles.newsGrid}>
          {newsData.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.imgWrap}>
                <img
                  src={item.img}
                  alt={item.title}
                  className={styles.cardImg}
                />
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.date}>{item.date}</span>
                  <span className={styles.sep}> · </span>
                  <span className={styles.author}>{item.author}</span>
                </div>
                <p className={styles.desc}>{item.desc}</p>
                <a href={item.link} className={styles.link}>
                  Learn More
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
