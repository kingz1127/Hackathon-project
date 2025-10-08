import React from "react";
import styles from "./Pricing.module.css";

const plans = [
  {
    name: "Starter",
    price: "$50.99",
    period: "month",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    primary: false,
  },
  {
    name: "Business",
    price: "$99.99",
    period: "month",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    primary: true,
  },
  {
    name: "Premium",
    price: "$199.99",
    period: "month",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    primary: false,
  },
];

export default function Pricing() {
  return (
    <section className={styles.pricing}>
      <div className={styles.container}>
        <h2 className={styles.title}>Pricing</h2>
        <p className={styles.subtitle}>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </p>

        <div className={styles.grid}>
          {plans.map((plan, idx) => (
            <div key={idx} className={styles.card}>
              <h3 className={styles.plan}>{plan.name}</h3>
              <div className={styles.price}>
                {plan.price}
                <span className={styles.period}>/{plan.period}</span>
              </div>
              <p className={styles.desc}>{plan.desc}</p>
              <button
                className={`${styles.button} ${
                  plan.primary ? styles.primary : styles.outline
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
