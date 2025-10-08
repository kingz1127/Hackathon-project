import React from "react";
import styles from "./ContactForm.module.css";
import { FaMapMarkerAlt, FaClock, FaEnvelope, FaPhone } from "react-icons/fa";

const ContactForm = () => {
  return (
    <section className={styles.contactSection}>
      <div className={styles.container}>
        {/* Contact Form */}
        <div className={styles.formContainer}>
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Your Name"
                className={styles.input}
              />
              <input
                type="email"
                placeholder="Your Email"
                className={styles.input}
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className={styles.fullInput}
            />
            <textarea
              placeholder="Message"
              className={styles.textarea}
              rows="5"
            />
            <button type="submit" className={styles.button}>
              SEND MESSAGE
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className={styles.infoContainer}>
          <div className={styles.infoItem}>
            <FaMapMarkerAlt className={styles.icon} />
            <div>
              <h4>Location:</h4>
              <p>43 Raymouth Rd. Baltemoer, London 3910</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <FaClock className={styles.icon} />
            <div>
              <h4>Open Hours:</h4>
              <p>Sunday–Friday: 11:00 AM – 23:00 PM</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <FaEnvelope className={styles.icon} />
            <div>
              <h4>Email:</h4>
              <p>info@untree.co</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <FaPhone className={styles.icon} />
            <div>
              <h4>Call:</h4>
              <p>+1 1234 55488 55</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
