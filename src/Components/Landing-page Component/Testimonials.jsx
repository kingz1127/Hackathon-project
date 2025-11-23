import React, { useState, useEffect, useRef } from "react";
import styles from "./Testimonials.module.css";

const slides = [
  {
    quote:
      "A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.",
    name: "Rob Smith",
    role: "Product Designer at Twitter",
    avatar: "https://themewagon.github.io/learner/images/person_1.jpg",
  },
  {
    quote:
      "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    name: "Jane Doe",
    role: "Senior Teacher",
    avatar: "https://themewagon.github.io/learner/images/person_2.jpg",
  },
  {
    quote:
      "Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.",
    name: "John Doe",
    role: "Head of Design",
    avatar: "https://themewagon.github.io/learner/images/person_3.jpg",
  },
];

export default function Testimonials({ autoPlay = true, interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval]);

  const goTo = (i) => {
    setIndex(i);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <section className={styles.testimonials}>
      <div className={styles.inner}>
        <h3 className={styles.title}>Testimonials</h3>

        <div className={styles.slideWrap}>
          {slides.map((s, i) => (
            <div
              key={i}
              className={`${styles.slide} ${i === index ? styles.active : ""}`}
              aria-hidden={i !== index}
            >
              <p className={styles.quote}>&ldquo;{s.quote}&rdquo;</p>
              <img
                src={s.avatar}
                alt={`${s.name} avatar`}
                className={styles.avatar}
              />
              <a href="#" className={styles.name}>
                {s.name}
              </a>
              <div className={styles.role}>{s.role}</div>
            </div>
          ))}
        </div>

        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
