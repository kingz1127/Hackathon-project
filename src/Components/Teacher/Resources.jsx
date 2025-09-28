// src/pages/Resources.jsx
import { useState } from "react";
import "./Teacher.css";

export default function Resources() {
  const [resources, setResources] = useState([
    {
      id: 1,
      name: "Math Textbook - Grade 10",
      description: "Official math textbook for grade 10 students.",
      link: "/downloads/math-grade10.pdf",
    },
    {
      id: 2,
      name: "Science Lab Manual",
      description: "Experiments and practical guide for science labs.",
      link: "/downloads/science-lab-manual.pdf",
    },
    {
      id: 3,
      name: "Exam Past Papers",
      description: "Previous exam question papers for practice.",
      link: "/downloads/past-papers.zip",
    },
  ]);

  const [newResource, setNewResource] = useState({
    name: "",
    description: "",
    link: "",
  });

  const handleChange = (e) => {
    setNewResource({ ...newResource, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newResource.name || !newResource.link) return;

    const newItem = {
      id: resources.length + 1,
      ...newResource,
    };

    setResources([...resources, newItem]);
    setNewResource({ name: "", description: "", link: "" });
  };

  return (
    <div className="resources-container">
      <h2>Resources</h2>

      {/* Form to add new resources */}
      <form className="resource-form" onSubmit={handleAdd}>
        <input
          type="text"
          name="name"
          placeholder="Resource Name"
          value={newResource.name}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Short description"
          value={newResource.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="link"
          placeholder="Resource Link (URL)"
          value={newResource.link}
          onChange={handleChange}
        />
        <button type="submit">Add Resource</button>
      </form>

      {/* Resource list */}
      <div className="resource-list">
        {resources.map((r) => (
          <div key={r.id} className="resource-card">
            <h4>{r.name}</h4>
            <p>{r.description}</p>
            <a href={r.link} download>
              📥 Download
            </a>
            <button className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
