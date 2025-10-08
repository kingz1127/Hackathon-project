import React from "react";
import styles from "./GalleryContent.module.css";

const images = [
  "https://themewagon.github.io/learner/images/img-school-5-min.jpg",
  "https://themewagon.github.io/learner/images/img-school-1-min.jpg",
  "https://themewagon.github.io/learner/images/img-school-2-min.jpg",
  "https://themewagon.github.io/learner/images/img_1.jpg",
  "https://themewagon.github.io/learner/images/img_4.jpg",
  "https://themewagon.github.io/learner/images/img_9.jpg",
  "https://themewagon.github.io/learner/images/img_2.jpg",
  "https://themewagon.github.io/learner/images/img_5.jpg",
  "https://themewagon.github.io/learner/images/img_6.jpg",
  "https://themewagon.github.io/learner/images/img_3.jpg",
  "https://themewagon.github.io/learner/images/img_8.jpg",
  "https://themewagon.github.io/learner/images/img_8.jpg",
  "https://themewagon.github.io/learner/images/img_10.jpg",
];

const GalleryContent = () => {
  return (
    <section className={styles.gallerySection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Gallery</h2>
        <p className={styles.subtitle}>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </p>

        <div className={styles.galleryGrid}>
          {images.map((src, index) => (
            <div key={index} className={styles.imageWrapper}>
              <img
                src={src}
                alt={`Gallery ${index + 1}`}
                className={styles.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GalleryContent;
