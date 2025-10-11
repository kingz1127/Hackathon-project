import { BiDownload } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useState, useEffect } from "react";
import { AiFillFileZip } from "react-icons/ai";

export default function Resources() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [resources, setResources] = useState([]);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 8;

  // ✅ Retrieve teacher ID from localStorage
  const teacherId = localStorage.getItem("teacherId");

  // ✅ Fetch existing uploaded resources
  useEffect(() => {
    if (!teacherId) return;

    const fetchResources = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/resources/${teacherId}`);
        if (!res.ok) throw new Error("Failed to fetch resources");
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      }
    };

    fetchResources();
  }, [teacherId]);

  // ✅ Handle upload
  const handleAdd = async (e) => {
    e.preventDefault();

    if (!teacherId) {
      setMessage("❌ Teacher not logged in.");
      return;
    }

    if (!file) {
      setMessage("❌ Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:5000/api/resources/upload/${teacherId}`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (res.ok) {
        setMessage("✅ Resource uploaded successfully!");
        setTitle("");
        setDescription("");
        setFile(null);

        // ✅ Add new resource and stay on current page
        setResources((prev) => [...prev, data.resource]);
      } else {
        setMessage(`❌ ${data.message || "Upload failed"}`);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("⚠️ Error uploading resource. Check server connection.");
    }
  };

  // ✅ Handle Delete
  const handleDelete = async (filename) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/resources/delete/${teacherId}/${filename}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setResources((prev) => prev.filter((r) => !r.fileUrl.endsWith(filename)));
        setMessage("🗑️ Resource deleted successfully.");
      } else {
        setMessage("❌ Failed to delete resource.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("⚠️ Error deleting resource.");
    }
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(resources.length / resourcesPerPage);
  const startIndex = (currentPage - 1) * resourcesPerPage;
  const currentResources = resources.slice(startIndex, startIndex + resourcesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="resources" style={{ padding: "20px" }}>
      <h1>📚 Resources</h1>
      <h2>📤 Add Resource</h2>

      <form onSubmit={handleAdd} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Resource Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload</button>
      </form>

      {message && <p>{message}</p>}

      <hr />

      <h3 style={{marginTop: "1rem"}}>📚 Uploaded Resources ({resources.length}) </h3>
      

      {resources.length === 0 ? (
        <p>No resources uploaded yet.</p>
      ) : (
        <>
          <div
           className="resource-list"
          >
            {currentResources.map((res, index) => {
              const filename = res.fileUrl?.split("/").pop();
              return (
                <div
                  key={index}
                  className="resource-card"
                >
                  <AiFillFileZip />
                  <h4>Title: {res.title}</h4>
                  <p>Description: {res.description || "No description"}</p>

<div className="downloadDelete">
                  <a
                    href={`http://localhost:5000/api/resources/download/${filename}`}
                    download
                   
                  >
                    <BiDownload /> Download
                  </a>

                  <button
                    onClick={() => handleDelete(filename)}
                    className="delete-btn"
                  >
                    <RiDeleteBin5Line /> Delete
                  </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  style={{
                    fontWeight: currentPage === i + 1 ? "bold" : "normal",
                    background:
                      currentPage === i + 1 ? "#007bff" : "white",
                    color:
                      currentPage === i + 1 ? "white" : "black",
                    border: "1px solid #007bff",
                    borderRadius: "5px",
                    padding: "5px 10px",
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
