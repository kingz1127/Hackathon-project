import React from 'react';
import styles from './TopBar.module.css';

const TopBar = () => (
  <div className={styles.topBar}>
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.leftCol}>
          <a href="#" className={styles.contactLink}>
            <i className="icon-question-circle-o"></i>
            <span className={styles.hideOnMobile}>Have a questions?</span>
          </a>
          <a href="#" className={styles.contactLink}>
            <i className="icon-phone"></i>
            <span className={styles.hideOnMobile}>10 20 123 456</span>
          </a>
          <a href="#" className={styles.contactLink}>
            <i className="icon-envelope"></i>
            <span className={styles.hideOnMobile}>info@mydomain.com</span>
          </a>
        </div>
        <div className={styles.rightCol}>
          <a href="/login" className={styles.authLink}>
            <i className="icon-lock"></i>
            Log In
          </a>
          <a href="/register" className={styles.authLink}>
            <i className="icon-person"></i>
            Register
          </a>
        </div>
      </div>
    </div>
  </div>
);
export default TopBar;
