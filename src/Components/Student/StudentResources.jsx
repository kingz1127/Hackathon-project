import { AiFillFileZip } from "react-icons/ai"; 
import { AiFillFile } from "react-icons/ai"; 
import { AiOutlineDownload } from "react-icons/ai";  
import { useEffect, useState } from "react";
import styles from "./StudentResources.module.css";

export default function StudentResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 16; // ✅ 4x4 grid per page

  // Get logged-in student's ID from localStorage
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        if (!studentId) {
          setError("Student ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:5000/api/resources/student/${studentId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load resources.");
        }

        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [studentId]);

  if (loading) return <p className={styles.loading}>Loading resources...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  // ✅ Pagination logic
  const indexOfLast = currentPage * resourcesPerPage;
  const indexOfFirst = indexOfLast - resourcesPerPage;
  const currentResources = resources.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(resources.length / resourcesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.studentResources}>
      
      <div className={styles.resCount}>
      <h1>📚 Resources </h1>
      <p>({resources.length})</p>
      </div>

      <hr />

      {resources.length === 0 ? (
        <p>No resources available yet.</p>
      ) : (
        <>
          <div className={styles.resourceList}>
            {currentResources.map((res, index) => (
              <div key={index} className={styles.resourceCard}>
                <AiFillFileZip />
                <h4>Title: {res.title}</h4>
                {res.description && <p>Description: {res.description}</p>}
                {res.fileUrl ? (
                  <a
                    href={`http://localhost:5000/api/resources/download/${res.fileUrl.split("/").pop()}`}
                    download
                    className={styles.downloadBtn}
                  >
                    <AiOutlineDownload /> Download
                  </a>
                ) : (
                  <p>No file attached.</p>
                )}
              </div>
            ))}
          </div>

          {/* ✅ Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ⬅ Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? styles.activePage : ""}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next ➡
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
