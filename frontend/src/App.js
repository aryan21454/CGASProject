import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Fuse from 'fuse.js';
import RecipeModal from "./RecipeModal";
import Pdf from "./Pdf";
import { FaFilePdf } from "react-icons/fa6";
import { MdPreview } from "react-icons/md";
import { jsPDF } from 'jspdf';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [allData, setAllData]=useState([]);
  const [preferableData, setpreferableData]=useState([]);
  const [modelResponse,setModelResponse]=useState({});
  const [pdfData,setPdfData]=useState({});
  const [recipe,setRecipe]=useState(null);
  const [onClose,SetOnClose]=useState(false);
  
  

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
  useEffect( ()=>{
    async function  timatar(){
      const response=await axios.get('http://localhost:5000/recipes');
      console.log(response.data);
      setAllData(response.data);
      
    }
    timatar();

  },[searchQuery])




  // Handle search functionality
  const handleSearch = async (event) => {
    console.log(allData,'all data');
    event.preventDefault(); // Prevent default form submission behavior
    if (!searchQuery) {
      alert("Please enter a search query.");
      return;
    }

    setIsLoading(true); // Start loading
    try {
      const response = await axios.get(`http://localhost:5000/recipes?search=${searchQuery}`);
      setSearchResults(response.data); // Update search results

      const fuse = new Fuse(allData, {
        keys: ['recipe_name'], // Specify the object key to search (name in this case)
        threshold: 0.3, // Controls the fuzziness, 0 is exact match, 1 is any match
      });
      
      const results = fuse.search(searchQuery).map(result => result.item);
      console.log(results,'resultdata*************');
      setpreferableData(results);

    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes. Please try again.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

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

      setUploadStatus("Processing data...");
      const response=await axios.post("https://goodml-dishdecode.hf.space/process-audio", { audioUrl: cloudinaryUrl });

      setUploadStatus("Data uploaded successfully!");
      const rawData=response.data;
      
      console.log(rawData,'rawData');
      const strucData = {
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
      console.log(strucData,'structure data');
      setPdfData(strucData);
      setModelResponse(strucData);
      const response2=await axios.post('http://localhost:5000/api/recipes/structured',strucData); // goes into
      
      console.log(response2,'model-response');
      // <Pdf structuredData={strucData}/>

    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("Error uploading data. Please try again.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  function extractSection(data, sectionHeader) {
    const regex = new RegExp(`\\*\\*${sectionHeader}\\*\\*\\s*(.+)`);
    const match = data.match(regex);
    return match ? match[1].trim() : null;
  }
  
  // Utility to extract a multi-line list section
  function extractList(data, sectionHeader) {
    const regex = new RegExp(`\\*\\*${sectionHeader}\\*\\*\\n\\n([\\s\\S]*?)\\n\\n\\*\\*`, 'm');
    const match = data.match(regex);
    if (match) {
      return match[1]
        .split('\n')
        .map((line) => line.replace(/^\*+|\s+$/g, '').trim()) // Remove leading '*', trim spaces
        .filter((line) => line); // Remove empty lines
    }
    return [];
  }
  
  useEffect(() => {
    const body = document.querySelector("body");
    if (isLoading) {
      body.style.overflow = "hidden"; // Prevent scrolling during loading
    } else {
      body.style.overflow = "auto";
    }
  }, [isLoading]);
     
  const PdfDownloder = (structuredData ) => {
    
      const doc = new jsPDF();
      let yPosition = 10; // Start position for the first line of text
  
      // Add a title
      doc.setFontSize(16);
      doc.text('Recipe Information', 10, yPosition);
      yPosition += 10;
  
      // Add Recipe Details
      doc.setFontSize(12);
      doc.text(`Recipe Name: ${structuredData.recipe_name || 'N/A'}`, 10, yPosition);
      yPosition += 8;
  
      doc.text('Ingredients:', 10, yPosition);
      yPosition += 8;
      structuredData.ingredients.forEach((ingredient) => {
        doc.text(`- ${ingredient}`, 15, yPosition);
        yPosition += 8;
      });
  
      doc.text('Preparation Steps:', 10, yPosition);
      yPosition += 8;
      structuredData.preparation_steps.forEach((step, index) => {
        doc.text(`${step}`, 15, yPosition);
        yPosition += 8;
      });
  
      doc.text('Cooking Techniques:', 10, yPosition);
      yPosition += 8;
      structuredData.cooking_techniques.forEach((technique) => {
        doc.text(`- ${technique}`, 15, yPosition);
        yPosition += 8;
      });
  
      doc.text('Equipment Needed:', 10, yPosition);
      yPosition += 8;
      structuredData.equipment_needed.forEach((equipment) => {
        doc.text(`- ${equipment}`, 15, yPosition);
        yPosition += 8;
      });
  
      doc.text(`Nutritional Information: ${structuredData.nutritional_information || 'N/A'}`, 10, yPosition);
      yPosition += 8;
  
      doc.text(`Serving Size: ${structuredData.serving_size || 'N/A'}`, 10, yPosition);
      yPosition += 8;
  
      doc.text('Special Notes:', 10, yPosition);
      yPosition += 8;
      structuredData.special_notes.forEach((note) => {
        doc.text(`- ${note}`, 15, yPosition);
        yPosition += 8;
      });
  
      doc.text(`Festive Relevance: ${structuredData.festive_relevance || 'N/A'}`, 10, yPosition);
  
      // Save the PDF
      doc.save(`${structuredData.recipe_name || 'recipe'}.pdf`);
    
  }

  

  return (
    <div className="min-h-screen bg-cover bg-center bg-[url('https://res.cloudinary.com/dqp1z12my/image/upload/v1733843142/kk_dkbncz.webp')] flex flex-col justify-between">
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
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Upload File</h1>
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
            {pdfData && <Pdf structuredData={pdfData}/>}
            
          </form>
          {uploadStatus && (
            <p className="mt-4 text-center text-gray-700 font-semibold">{uploadStatus}</p>
          )}
        </div>
      </div>

      {/* Search Results */}
      {preferableData.length > 0 && (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Search Results:</h2>
          <ul className="space-y-4">
            {preferableData.map((recipe,index) => (
              <li key={recipe._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                <div className="flex flex-row justify-between">
                  <div><h3 className="text-lg font-semibold">{recipe.recipe_name}</h3></div>
        
                  <div className="flex flex-row gap-4">
                    <div><FaFilePdf className="text-[20px] cursor-pointer" onClick={()=>PdfDownloder(preferableData[index])} /></div>
                    <div><MdPreview className="text-[20px] cursor-pointer" onClick={()=>{setRecipe(preferableData[index]);SetOnClose(true)}} /></div>
                    
                  </div>
                  
                </div>
          
                <p className="text-gray-700">Ingredients: {recipe.ingredients.join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      
     
      {onClose && <RecipeModal recipe={recipe} onClose={SetOnClose} />}
      {/* Footer */}

      <footer className="bg-black text-white text-center py-4">
        <p>© 2024 DishDecode. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
