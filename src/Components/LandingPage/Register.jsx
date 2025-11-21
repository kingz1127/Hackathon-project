import { HiMail } from "react-icons/hi";
import { BiLockAlt } from "react-icons/bi";
import { AiOutlineMail } from "react-icons/ai";
import { IoMdCall } from "react-icons/io";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import styles from "./Register.module.css";
import { IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import Footer from "../Landing-page Component/Footer";

export default function Register() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    Country: "",
    Grade: "",
    PhoneNumber: "",
    Guardian: "",
    GuardianPhoneNumber: "",
    StateOfOrigin: "",
    Address: "",
    Gender: "",
  });

  const [passportPhoto, setPassportPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCountryChange = (selected) => {
    setForm({ ...form, Country: selected.label });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setFileError("Please upload a valid image (JPEG, JPG, or PNG)");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setFileError("Passport photo must be less than 2MB");
        return;
      }

      setPassportPhoto(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPassportPhoto(null);
    setPhotoPreview(null);
    setFileError("");
    const fileInput = document.getElementById("passportPhoto");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passportPhoto) {
      setFileError("Passport photo is required");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      formData.append("passportPhoto", passportPhoto);

      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", res.status);

      const result = await res.json();
      console.log("Response data:", result);

      if (res.ok) {
        alert(
          result.message ||
            "✅ Registration submitted! Check your mail for Admin feedback"
        );
        setForm({
          Email: "",
          FullName: "",
          DOfB: "",
          Course: "",
          Country: "",
          Grade: "",
          PhoneNumber: "",
          Guardian: "",
          GuardianPhoneNumber: "",
          StateOfOrigin: "",
          Address: "",
          Gender: "",
        });
        setPassportPhoto(null);
        setPhotoPreview(null);
        setFileError("");
        navigate("/login");
      } else {
        alert(result.message || "Error submitting registration");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Server error during registration: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const options = useMemo(() => countryList().getData(), []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.contactInfo}>
            <span>
              <AiOutlineQuestionCircle /> Have a question?
            </span>
            <span>
              <IoMdCall /> <a href="tel:+2349867435673">+2349867435673</a>
            </span>
            <span>
              <HiMail />{" "}
              <a href="mailto:info@NiitAdmin.com">info@NiitAdmin.com</a>
            </span>
          </div>
          <div className={styles.authLinks}>
            <Link to="/login">
              <BiLockAlt /> Login
            </Link>
            <Link to="/register">
              <IoMdPerson /> Register
            </Link>
          </div>
        </div>

        <hr className={styles.divider} />

        <nav
          className={`${styles.mainNav} ${isScrolled ? styles.scrolled : ""}`}
        >
          <div className={styles.logo}>Learner.</div>

          <div
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`${styles.navLinks} ${menuOpen ? styles.show : ""}`}>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li
              className={`${styles.dropdown} ${
                dropdownOpen ? styles.open : ""
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Link to="#">Dropdown</Link>
              <ul className={styles.dropdownMenu}>
                <li>
                  <Link to="/elements">Elements</Link>
                </li>
                <li>
                  <Link to="/menu2">Menu 2</Link>
                  <ul className={styles.dropdownMenu2}>
                    <li>
                      <Link to="/submenu1">Submenu 1</Link>
                    </li>
                    <li>
                      <Link to="/submenu2">Submenu 2</Link>
                    </li>
                    <li>
                      <Link to="/submenu3">Submenu 3</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/menu3">Menu 3</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/ourstaff">Our Staff</Link>
            </li>
            <li>
              <Link to="/news">News</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className={styles.login}>
        <h1>Register</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Fullname"
            name="FullName"
            value={form.FullName}
            onChange={handleChange}
            className={styles.formtext}
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="Email"
            value={form.Email}
            onChange={handleChange}
            className={styles.formtext}
            required
          />
          <input
            type="number"
            placeholder="Phone Number"
            name="PhoneNumber"
            value={form.PhoneNumber}
            onChange={handleChange}
            className={styles.formtext}
            required
          />

          <div className={styles.dobIn}>
            <label>Date of Birth:</label>
            <input
              type="date"
              placeholder="Date of Birth"
              name="DOfB"
              value={form.DOfB}
              onChange={handleChange}
              max={
                new Date(new Date().setFullYear(new Date().getFullYear() - 15))
                  .toISOString()
                  .split("T")[0]
              }
              min={
                new Date(new Date().setFullYear(new Date().getFullYear() - 60))
                  .toISOString()
                  .split("T")[0]
              }
              required
            />
          </div>

          <input
            type="text"
            placeholder="Grade"
            name="Grade"
            value={form.Grade}
            onChange={handleChange}
            className={styles.formtext}
            required
          />

          <input
            type="text"
            placeholder="Guardian"
            name="Guardian"
            value={form.Guardian}
            onChange={handleChange}
            className={styles.formtext}
            required
          />
          <input
            type="number"
            placeholder="Guardian Phone Number"
            name="GuardianPhoneNumber"
            value={form.GuardianPhoneNumber}
            onChange={handleChange}
            className={styles.formtext}
            required
          />

          <select
            name="Course"
            value={form.Course}
            onChange={handleChange}
            className={styles.formtext}
            required
          >
            <option value="">Preferred Course</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Networking">Networking</option>
            <option value="Python">Python</option>
            <option value="Software Engineering">
              Software Engineering / FullStack
            </option>
          </select>

          <div className={styles.selectCountry}>
            <Select
              options={options}
              onChange={handleCountryChange}
              placeholder="Nationality"
              value={options.find((opt) => opt.label === form.Country) || null}
              required
            />
          </div>

          <input
            type="text"
            placeholder="State of Origin"
            name="StateOfOrigin"
            value={form.StateOfOrigin}
            onChange={handleChange}
            className={styles.formtext}
            required
          />

          <input
            type="text"
            placeholder="Address"
            name="Address"
            value={form.Address}
            onChange={handleChange}
            className={styles.formtext}
            required
          />

          <select
            name="Gender"
            value={form.Gender}
            onChange={handleChange}
            className={styles.formtext}
            required
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <div className={styles.photoUploadSection}>
            <label className={styles.uploadLabel}>Passport Photo *</label>
            <div
              className={`${styles.uploadArea} ${
                fileError ? styles.uploadError : ""
              }`}
            >
              <input
                type="file"
                id="passportPhoto"
                onChange={handlePhotoUpload}
                accept=".jpg,.jpeg,.png"
                className={styles.fileInput}
                required
              />
              <label htmlFor="passportPhoto" className={styles.uploadButton}>
                <div className={styles.uploadIcon}>📷</div>
                <div>
                  <strong>Click to upload passport photo</strong>
                  <p>Supported formats: JPG, JPEG, PNG (Max 2MB)</p>
                  <p>Recommended: Square photo, clear face view</p>
                </div>
              </label>
            </div>

            {fileError && <div className={styles.fileError}>{fileError}</div>}

            {photoPreview && (
              <div className={styles.photoPreview}>
                <div className={styles.previewHeader}>
                  <span>Photo Preview</span>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className={styles.removePhoto}
                  >
                    Remove
                  </button>
                </div>
                <div className={styles.previewImage}>
                  <img src={photoPreview} alt="Passport preview" />
                </div>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{passportPhoto.name}</span>
                  <span className={styles.fileSize}>
                    {(passportPhoto.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.remember}>
            <input type="checkbox" required />
            <p>I agree to the terms and condition of the school</p>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={uploading}
          >
            {uploading ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
