import React from "react";

const RecipeModal = ({ recipe, onClose }) => {
  if (!recipe) return null; // If no recipe is provided, return null to hide the modal

  return (
    <div className="inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[70%] lg:w-[50%] overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{recipe.recipe_name}</h2>

        {/* Ingredients */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Ingredients:</h3>
          <ul className="list-disc list-inside">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-600">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {/* Preparation Steps */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Preparation Steps:</h3>
          <ol className="list-decimal list-inside">
            {recipe.preparation_steps.map((step, index) => (
              <li key={index} className="text-gray-600">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Cooking Techniques */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Cooking Techniques:</h3>
          <ul className="list-disc list-inside">
            {recipe.cooking_techniques.map((technique, index) => (
              <li key={index} className="text-gray-600">
                {technique}
              </li>
            ))}
          </ul>
        </div>

        {/* Equipment Needed */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Equipment Needed:</h3>
          <ul className="list-disc list-inside">
            {recipe.equipment_needed.map((equipment, index) => (
              <li key={index} className="text-gray-600">
                {equipment}
              </li>
            ))}
          </ul>
        </div>

        {/* Nutritional Information */}
        <p className="text-gray-700 mb-4">
          <span className="font-semibold">Nutritional Information:</span>{" "}
          {recipe.nutritional_information || "N/A"}
        </p>

        {/* Serving Size */}
        <p className="text-gray-700 mb-4">
          <span className="font-semibold">Serving Size:</span> {recipe.serving_size || "N/A"}
        </p>

        {/* Special Notes */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Special Notes:</h3>
          <ul className="list-disc list-inside">
            {recipe.special_notes.map((note, index) => (
              <li key={index} className="text-gray-600">
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Festive Relevance */}
        <p className="text-gray-700">
          <span className="font-semibold">Festive Relevance:</span>{" "}
          {recipe.festive_relevance || "N/A"}
        </p>

        {/* Close Button */}
        <button
          className="w-full bg-black font-bold text-white py-2 rounded-lg hover:bg-gray-700 ease-in-out duration-300 transition-colors"
          onClick={()=>onClose(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RecipeModal;
