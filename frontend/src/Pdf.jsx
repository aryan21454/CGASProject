import React from 'react';
import { jsPDF } from 'jspdf';

const Pdf = ({ structuredData }) => {
  const handleDownloadPDF = () => {
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
