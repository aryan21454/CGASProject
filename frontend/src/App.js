import React, { useState } from "react";
import axios from "axios";

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // Handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    } else {
      alert("Please upload a valid video file.");
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!videoFile) {
      alert("Please upload a video file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      setUploadStatus("Uploading...");
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus(`Upload successful: ${response.data.message}`);
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadStatus("Error uploading video. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Video Upload App</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Upload a Video File:
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ marginLeft: "10px" }}
            />
          </label>
        </div>
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Submit
        </button>
      </form>
      {uploadStatus && <p style={{ marginTop: "20px" }}>{uploadStatus}</p>}
      {videoFile && (
        <div style={{ marginTop: "20px" }}>
          <h3>Preview:</h3>
          <video
            controls
            style={{ width: "100%", maxWidth: "600px", marginTop: "10px" }}
            src={URL.createObjectURL(videoFile)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export default App;
