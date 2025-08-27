import { HiMail } from "react-icons/hi";
import { BiLockAlt } from "react-icons/bi";
import { AiOutlineMail } from "react-icons/ai";
import { IoMdCall } from "react-icons/io";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import styles from "./Register.module.css";
import { IoMdPerson } from "react-icons/io";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.regHeader}>
        <div className={styles.div0}>
          <div className={styles.div1}>
            <AiOutlineQuestionCircle />
            <p>Have a questions?</p>
            <IoMdCall />
            <a href="tel:+2349867435673">+2349867435673</a>
            <HiMail />
            <a href="mailto:">info@NiitAdmin.com</a>
          </div>
          <div className={styles.div2}>
            <Link to="/login">
              <BiLockAlt />
              <p>Login</p>
            </Link>
            <Link to="/register">
              <IoMdPerson />
              <p>Register</p>
            </Link>
          </div>
        </div>
        <hr />
        <div className={styles.div3}>
          <h2>Learner</h2>
          <div>
            <p onClick={() => navigate("/")}>Home</p>

            <p>Dropdown</p>
            <p onClick={() => navigate("/ourstaff")}>Our Staff</p>
            <p onClick={() => navigate("/news")}>News</p>
            <p onClick={() => navigate("/gallery")}>Gallery</p>
            <p onClick={() => navigate("/about")}>About</p>
            <p onClick={() => navigate("/contact")}>Contact</p>
          </div>
          <button>ENROLL NOW</button>
        </div>
      </div>
    </>
  );
}
