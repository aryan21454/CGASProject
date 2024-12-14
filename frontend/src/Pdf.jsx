import React from 'react';
import { jsPDF } from 'jspdf';

const Pdf = ({ structuredData }) => {
  // console.log(structuredData)
  const handleDownloadPDF = () => {
    
   try {
     const doc = new jsPDF();
     const pageHeight = doc.internal.pageSize.height; // Page height
     let yPosition = 10; // Start position for the first line of text
 
     const addText = (text, x, y, wrapWidth = 180) => {
       const lines = doc.splitTextToSize(text, wrapWidth); // Split long text into multiple lines
       lines.forEach((line) => {
         if (y > pageHeight - 10) { // Check if the current yPosition exceeds the page height
           doc.addPage();
           y = 10; // Reset yPosition for the new page
         }
         doc.text(line, x, y);
         y += 8; // Increment yPosition for the next line
       });
       return y;
     };
 
     // Add a title
     doc.setFontSize(16);
     yPosition = addText('Recipe Information', 10, yPosition);
 
     // Add Recipe Details
     doc.setFontSize(12);
     yPosition = addText(`Recipe Name: ${structuredData.recipe_name || 'N/A'}`, 10, yPosition);
 
     yPosition = addText('Ingredients:', 10, yPosition);
     structuredData.ingredients.forEach((ingredient) => {
       yPosition = addText(`- ${ingredient}`, 15, yPosition);
     });
 
     yPosition = addText('Preparation Steps:', 10, yPosition);
     structuredData.preparation_steps.forEach((step, index) => {
       yPosition = addText(`${step}`, 15, yPosition); // Use indexing for numbered steps
     });
 
     yPosition = addText('Cooking Techniques:', 10, yPosition);
     structuredData.cooking_techniques.forEach((technique) => {
       yPosition = addText(`- ${technique}`, 15, yPosition);
     });
 
     yPosition = addText('Equipment Needed:', 10, yPosition);
     structuredData.equipment_needed.forEach((equipment) => {
       yPosition = addText(`- ${equipment}`, 15, yPosition);
     });
 
     yPosition = addText(`Nutritional Information: ${structuredData.nutritional_information || 'N/A'}`, 10, yPosition);
 
     yPosition = addText(`Serving Size: ${structuredData.serving_size || 'N/A'}`, 10, yPosition);
 
     yPosition = addText('Special Notes:', 10, yPosition);
     structuredData.special_notes.forEach((note) => {
       yPosition = addText(`- ${note}`, 15, yPosition);
     });
 
     yPosition = addText(`Festive Relevance: ${structuredData.festive_relevance || 'N/A'}`, 10, yPosition);
 
     // Save the PDF
     doc.save(`${structuredData.recipe_name || 'recipe'}.pdf`);
   } catch (error) {
    alert("Upload a pdf file")
    
   }
  };

  return (
    <div>
      <button
        onClick={handleDownloadPDF}
        className="w-full bg-black font-bold text-white py-2 rounded-lg hover:bg-gray-700 ease-in-out duration-300 transition-colors"
      >
        Download PDF
      </button>
    </div>
  );
};

export default Pdf;
