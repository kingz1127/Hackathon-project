import React, { useState } from "react";
import styles from "./WhyChooseUs.module.css";

const WhyChooseUs = () => {
  const [active, setActive] = useState(0);

  const faqs = [
    {
      title: "Good Teachers and Staffs",
      content:
        "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.",
      image: "https://themewagon.github.io/learner/images/img-school-1-min.jpg",
    },
    {
      title: "We Value Good Characters",
      content:
        "Character building is essential, and we place great emphasis on instilling positive values in our students.",
      image: "https://themewagon.github.io/learner/images/img-school-2-min.jpg",
    },
    {
      title: "Your Children are Safe",
      content:
        "We ensure a safe and secure environment where children can focus on learning and growing without worry.",
      image: "https://themewagon.github.io/learner/images/img-school-3-min.jpg",
    },
  ];

  return (
    <section className={styles.whyChoose}>
      <div className={styles.container}>
        {/* Left Image */}
        <div className={styles.imageBox}>
          <img
            src="https://themewagon.github.io/learner/images/img-school-5-min.jpg"
            alt="Why Choose Us"
          />
        </div>

        {/* Right Content */}
        <div className={styles.contentBox}>
          <h2>Why Choose Us</h2>
          <p>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts.
          </p>

          <div className={styles.accordion}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`${styles.item} ${
                  active === index ? styles.active : ""
                }`}
                onClick={() => setActive(index)}
              >
                <div className={styles.title}>
                  {faq.title}
                  <span>{active === index ? "−" : "+"}</span>
                </div>
                {active === index && (
                  <div className={styles.content}>
                    <div className={styles.contentInner}>
                      <img src={faq.image} alt={faq.title} />
                      <p>{faq.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
