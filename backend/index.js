const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config()
const app = express();
const allowedOrigins = [process.env.FRONTEND_URI, 'https://your-frontend-domain.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific methods
  credentials: true, // If you need to send cookies or HTTP authentication
  allowedHeaders: 'Content-Type,Authorization', // Specify allowed headers
}));
app.use(bodyParser.json());

// MongoDB Connection String
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Recipe Schema and Model
const recipeSchema = new mongoose.Schema({
  recipe_name: { type: String, required: true },
  ingredients: [String],
  preparation_steps: [String],
  cooking_techniques: [String],
  equipment_needed: [String],
  nutritional_information: String,
  serving_size: String,
  special_notes: [String],
  festive_relevance: String,
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// Routes

// Add a Recipe
app.post("/add-recipe", async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).send("Recipe added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding recipe!");
  }
});

app.post("/api/recipes/structured", async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body); // Assuming req.body contains structured data
    await newRecipe.save();
    res.status(201).send("Recipe data uploaded successfully!");
  } catch (error) {
    console.error("Error saving structured data:", error);
    res.status(500).send("Failed to upload recipe data.");
  }
});


// Get All Recipes
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching recipes!");
  }
});

// Get a Single Recipe by ID
app.get("/recipe/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).send("Recipe not found!");
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching recipe!");
  }
});

// Update a Recipe by ID
app.put("/recipe/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecipe) {
      return res.status(404).send("Recipe not found!");
    }
    res.status(200).send("Recipe updated successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating recipe!");
  }
});

// Delete a Recipe by ID
app.delete("/recipe/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).send("Recipe not found!");
    }
    res.status(200).send("Recipe deleted successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting recipe!");
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
