import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [searchResults, setSearchResults] = useState([]); // Search results

  // Cloudinary Configuration
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqp1z12my/upload";
  const CLOUDINARY_PRESET = "ml-model";

  // Handle file change
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type.startsWith("video/") || selectedFile.type === "audio/wav")) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid video or .wav file.");
    }
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Cloudinary upload failed.");
    }
  };

  // Fetch and process data
  const fetchAndProcessData = async (cloudinaryUrl) => {
    try {
      const response = await axios.post("https://goodml-dishdecode.hf.space/process-audio", {
        audioUrl: cloudinaryUrl,
      });

      const rawData = response.data;

      const structuredData = {
        recipe_name: extractSection(rawData, "1. Recipe Name:"),
        ingredients: extractList(rawData, "2. Ingredients List:"),
        preparation_steps: extractList(rawData, "3. Steps for Preparation:"),
        cooking_techniques: extractList(rawData, "4. Cooking Techniques Used:"),
        equipment_needed: extractList(rawData, "5. Equipment Needed:"),
        nutritional_information: extractSection(rawData, "6. Nutritional Information (Inferred):"),
        serving_size: extractSection(rawData, "7. Serving Size:"),
        special_notes: extractList(rawData, "8. Special Notes or Variations:"),
        festive_relevance: extractSection(rawData, "9. Festive or Thematic Relevance:"),
      };

      return structuredData;
    } catch (error) {
      console.error("Error fetching or structuring data:", error);
      throw new Error("Failed to fetch or process data.");
    }
  };

  // Extract section or list from raw data
  function extractSection(data, sectionHeader) {
    const regex = new RegExp(`\\*\\*${sectionHeader}\\*\\*\\s*(.+)`);
    const match = data.match(regex);
    return match ? match[1].trim() : null;
  }

  function extractList(data, sectionHeader) {
    const regex = new RegExp(`\\*\\*${sectionHeader}\\*\\*\\n\\n([\\s\\S]*?)\\n\\n\\*\\*`, "m");
    const match = data.match(regex);
    if (match) {
      return match[1]
        .split("\n")
        .map((line) => line.replace(/^\*\s*/, "").trim())
        .filter((line) => line);
    }
    return [];
  }

  // Handle form submission for file upload
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please upload a file before submitting.");
      return;
    }

    setIsLoading(true); // Start loading
    try {
      setUploadStatus("Uploading to Cloudinary...");
      const cloudinaryUrl = await uploadToCloudinary();

      setUploadStatus("Fetching and structuring data...");
      const structuredData = await fetchAndProcessData(cloudinaryUrl);

      setUploadStatus("Uploading structured data to the backend...");
      await axios.post("http://localhost:5000/api/recipes/structured", structuredData);

      setUploadStatus("Data uploaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("Error uploading data. Please try again.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Handle search functionality
  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchQuery) {
      alert("Please enter a search query.");
      return;
    }

    setIsLoading(true); // Start loading for search
    try {
      const response = await axios.get(`http://localhost:5000/recipes?search=${searchQuery}`);
      setSearchResults(response.data); // Update search results
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes. Please try again.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Effect to manage loading screen
  useEffect(() => {
    const body = document.querySelector("body");
    if (isLoading) {
      body.style.overflow = "hidden"; // Prevent scrolling during loading
    } else {
      body.style.overflow = "auto";
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between bg-cover bg-[url('https://res.cloudinary.com/dqp1z12my/image/upload/v1733843142/kk_dkbncz.webp')]">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl font-semibold">
            <svg
              className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C6.477 0 0 6.477 0 12h4z"
              ></path>
            </svg>
            Processing your request...
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center py-10">
        <div className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-lg p-8 shadow-lg max-w-lg w-full">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">File Upload App</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Upload a Video or .wav File:</label>
              <input
                type="file"
                accept="video/*,audio/wav"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black font-bold text-white py-2 rounded-lg hover:bg-gray-700 ease-in-out duration-300 transition-colors"
            >
              SUBMIT
            </button>
          </form>
          {uploadStatus && (
            <p className="mt-4 text-center text-gray-700 font-semibold">{uploadStatus}</p>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Search Results:</h2>
          <ul className="space-y-4">
            {searchResults.map((recipe) => (
              <li key={recipe._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">{recipe.recipe_name}</h3>
                <p className="text-gray-700">Ingredients: {recipe.ingredients.join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white text-center py-4">
        <p>© 2024 Recipe App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
