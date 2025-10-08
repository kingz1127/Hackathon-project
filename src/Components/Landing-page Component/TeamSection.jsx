import React from "react";
import styles from "./TeamSection.module.css";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const teamMembers = [
  {
    name: "Mina Collins",
    role: "Teacher in Math",
    img: "https://themewagon.github.io/learner/images/staff_1.jpg",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
  },
  {
    name: "Anderson Matthew",
    role: "Teacher in Music",
    img: "https://themewagon.github.io/learner/images/staff_2.jpg",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
  },
  {
    name: "Cynthia Misso",
    role: "Teacher English",
    img: "https://themewagon.github.io/learner/images/staff_3.jpg",
    desc: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
  },
];

const TeamSection = () => {
  return (
    <section className={styles.teamSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Our Team</h2>
        <p className={styles.subtitle}>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </p>

        <div className={styles.grid}>
          {teamMembers.map((member, index) => (
            <div key={index} className={styles.card}>
              <img
                src={member.img}
                alt={member.name}
                className={styles.image}
              />
              <h3 className={styles.name}>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              <p className={styles.desc}>{member.desc}</p>

              <div className={styles.socials}>
                <a href="#">
                  <FaFacebookF />
                </a>
                <a href="#">
                  <FaTwitter />
                </a>
                <a href="#">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
