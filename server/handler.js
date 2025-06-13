const tf = require('@tensorflow/tfjs-node');
const path = require('path');
let {labelMap, wordIndex} = require('./data_labels');
const label_map = require('./label_map.json');
const word_index = require('./word_index.json');
const pool = require('./pool');
let model;

const loadPrediction = async () => {
    try{
        const dirPath = path.resolve(__dirname,'./tfjs_model_fix/model.json');
        model = await tf.loadLayersModel(`file://${dirPath}`);
        return model;
    }catch(error){
        console.log(`Error loading model : ${error}`);
        return `Error loading model : ${error}`;
    }
}

async function loadLabelMap() {
  try {
    labelMap = label_map;
    console.log("label_map loaded successfully")
  } catch (error) {
    console.error("Failed to load label_map:", error)
    console.log("Gagal memuat label_map.json")
  }
}

async function loadWordIndex() {
  try {
    wordIndex = word_index;
    console.log("word_index loaded successfully")
  } catch (error) {
    console.error("Failed to load word_index:", error)
    console.log("Gagal memuat word_index.json. Pastikan file tersedia.")
  }
}

function preprocessText(text) {
  const words = text.toLowerCase().split(/\s+/)
  const sequence = words.map((word) => {
    return wordIndex[word] || wordIndex["<OOV>"] || 0
  })

  // Padding post (seperti pad_sequences(..., padding='post'))
  const maxLen = 100
  if (sequence.length < maxLen) {
    const padded = Array(maxLen).fill(0)
    for (let i = 0; i < sequence.length; i++) {
      padded[i] = sequence[i]
    }
    return padded
  } else {
    return sequence.slice(0, maxLen)
  }
}

async function predict(request, h) {

  try{
    const models = await loadPrediction();
    loadLabelMap();
    loadWordIndex();

    const requestValue = request.payload;
    const tokens = preprocessText(requestValue.text);
    const inputTensor = tf.tensor2d([tokens], [1, tokens.length]);
    const prediction = models.predict(inputTensor);
    const predictedClass = prediction.argMax(-1).dataSync()[0];
    const predictedLabel = labelMap[predictedClass];

    pool.query('INSERT INTO texts (text, result) VALUES ($1,$2)', [requestValue.text, predictedLabel], (err, res) => {
      if (err) {
        console.error("Error inserting text into database:", err);
      } else {
        console.log("Text inserted successfully:", requestValue.text);
      }
    });

    return h.response({
      result: predictedLabel
    }).code(200);
  }catch(error){
    console.error("Error during prediction:", error);
    return h.response({
      error: "Prediction failed",
      details: error.message
    }).code(500);
  }
  

}

async function getAllPredictions(request, h){
  try{
    const result = await pool.query('SELECT * FROM texts');
    if (result.rows.length === 0) {
      return h.response({
        message: "No predictions found"
      }).code(404);
    }
    return h.response(result.rows).code(200);
  }catch(error){
    console.error("Error fetching predictions:", error);
    return h.response({
      error: "Failed to fetch predictions",
      details: error.message
    }).code(500);
  }
}

async function deleteAllPredictions(request, h) {
  try {
    await pool.query('DELETE FROM texts');
    return h.response({
      message: "All predictions deleted successfully"
    }).code(200);
  } catch (error) {
    console.error("Error deleting predictions:", error);
    return h.response({
      error: "Failed to delete predictions",
      details: error.message
    }).code(500);
  }
}

module.exports = {predict, getAllPredictions, deleteAllPredictions};